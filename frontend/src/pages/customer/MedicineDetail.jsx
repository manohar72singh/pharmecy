import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import medicineService from "../../services/medicineService";
import MedicineImage from "../../components/common/MedicineImage";
import cartService, { localCart } from "../../services/cartService";
import ReviewSection from "../../components/common/Reviewsection";
import { useToast } from "../../context/ToastContext";

// ── Schedule Badge ────────────────────────────────────
const ScheduleBadge = ({ code }) => {
  const map = {
    OTC: { bg: "bg-green-100  text-green-700", label: "OTC — No Prescription" },
    H: {
      bg: "bg-yellow-100 text-yellow-700",
      label: "Schedule H — Rx Required",
    },
    H1: {
      bg: "bg-red-100    text-red-700",
      label: "Schedule H1 — Rx Required",
    },
  };
  const s = map[code] || { bg: "bg-gray-100 text-gray-600", label: code };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${s.bg}`}
    >
      {s.label}
    </span>
  );
};

// ── Skeleton ──────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-gray-100 rounded-3xl h-96" />
      <div className="space-y-4">
        <div className="h-6 bg-gray-100 rounded w-1/3" />
        <div className="h-8 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-12 bg-gray-100 rounded w-1/3 mt-4" />
        <div className="h-12 bg-gray-100 rounded-2xl mt-4" />
      </div>
    </div>
  </div>
);

export default function MedicineDetail() {
  const { showCartToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [med, setMed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [error, setError] = useState("");
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    setLoading(true);
    medicineService
      .getById(id)
      .then(({ data }) => setMed(data.data))
      .catch(() => setError("Medicine not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const price = parseFloat(med?.selling_price || 0);
  const mrp = parseFloat(med?.mrp || 0);
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  // Check if medicine is expired OR expiring in current month
  const isExpired = med?.expiry_date
    ? (() => {
        const expiryDate = new Date(med.expiry_date);
        const today = new Date();

        // Check if already expired
        if (expiryDate < today) return true;

        // Check if expiring in current month and year
        if (
          expiryDate.getMonth() === today.getMonth() &&
          expiryDate.getFullYear() === today.getFullYear()
        ) {
          return true;
        }

        return false;
      })()
    : false;

  // Medicine is in stock only if quantity > 0 AND not expired
  const inStock = (med?.available_quantity || 0) > 0 && !isExpired;

  const addToCart = async () => {
    const isLoggedIn = !!localStorage.getItem("token");
    setCartError("");

    // Check for expired medicine
    if (isExpired) {
      setCartError("This medicine has expired and cannot be added to cart.");
      setTimeout(() => setCartError(""), 3000);
      return;
    }

    try {
      if (isLoggedIn) {
        if (!med.batch_id) {
          setCartError("Stock unavailable. Please refresh the page.");
          return;
        }
        await cartService.addToCart({
          medicine_id: med.id,
          batch_id: med.batch_id,
          quantity,
        });
      } else {
        localCart.add(med, quantity);
      }

      showCartToast({
        name: med.name,
        price: `₹${price.toFixed(2)}`,
      });

      window.dispatchEvent(new Event("cartUpdated"));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Cart add error:", err);
      setCartError("Could not add to cart. Please try again.");
      setTimeout(() => setCartError(""), 3000);
    }
  };

  const buyNow = async () => {
    await addToCart();
    navigate("/cart");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Skeleton />
      </div>
    );

  if (error || !med)
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center py-32 gap-4 px-4">
          <div className="text-6xl">😕</div>
          <h2 className="text-xl font-bold text-gray-700 text-center">
            Medicine Not Found
          </h2>
          <Link
            to="/medicines"
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
          >
            ← Back to Medicines
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 overflow-x-auto scrollbar-hide pb-1">
            <Link
              to="/"
              className="hover:text-emerald-600 whitespace-nowrap flex-shrink-0"
            >
              Home
            </Link>
            <span className="flex-shrink-0">›</span>
            <Link
              to="/medicines"
              className="hover:text-emerald-600 whitespace-nowrap flex-shrink-0"
            >
              Medicines
            </Link>
            <span className="flex-shrink-0">›</span>
            {med.category_name && (
              <>
                <Link
                  to={`/medicines?category=${med.category_slug}`}
                  className="hover:text-emerald-600 whitespace-nowrap flex-shrink-0"
                >
                  {med.category_name}
                </Link>
                <span className="flex-shrink-0">›</span>
              </>
            )}
            <span className="text-gray-700 font-medium whitespace-nowrap">
              {med.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* ── LEFT — Image ── */}
          <div className="space-y-3 sm:space-y-4">
            <div
              className="rounded-2xl sm:rounded-3xl border border-gray-100 relative overflow-hidden"
              style={{ height: "280px", minHeight: "280px" }}
            >
              {med.image_url ? (
                <img
                  src={med.image_url}
                  alt={med.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`${med.image_url ? "hidden" : "flex"} w-full h-full items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50`}
              >
                <MedicineImage
                  src={null}
                  categorySlug={med.category_slug}
                  size="lg"
                />
              </div>
              {discount > 0 && !isExpired && (
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 bg-red-500 text-white font-black text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg shadow">
                  {discount}% OFF
                </div>
              )}
              <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-20">
                <ScheduleBadge code={med.schedule_code} />
              </div>
              {!inStock && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-30">
                  <span className="text-sm sm:text-lg font-black text-gray-500 bg-gray-100 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { icon: "✅", label: "100% Genuine" },
                { icon: "🚚", label: "Fast Delivery" },
                { icon: "🔄", label: "Easy Returns" },
              ].map((c) => (
                <div
                  key={c.label}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-2 sm:p-3 text-center"
                >
                  <div className="text-lg sm:text-xl mb-0.5 sm:mb-1">
                    {c.icon}
                  </div>
                  <div className="text-[10px] sm:text-xs font-semibold text-gray-600">
                    {c.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT — Details ── */}
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              {med.category_name && (
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1 rounded-full">
                  {med.category_name}
                </span>
              )}
              <ScheduleBadge code={med.schedule_code} />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-tight">
                {med.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                by{" "}
                <span className="font-semibold text-gray-700">
                  {med.manufacturer_name}
                </span>
                {med.brand && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="text-emerald-600 font-semibold">
                      {med.brand}
                    </span>
                  </>
                )}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl">
              💊{" "}
              <span className="font-medium">
                {med.salt_composition || med.generic_name}
              </span>
              <span className="ml-2 text-gray-400">· {med.pack_size}</span>
            </p>

            {/* Price */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5">
              <div className="flex items-end gap-2 sm:gap-3 mb-2">
                <span className="text-3xl sm:text-4xl font-black text-gray-900">
                  ₹{price.toFixed(2)}
                </span>
                {mrp > price && (
                  <div className="mb-0.5 sm:mb-1">
                    <span className="text-base sm:text-lg text-gray-400 line-through">
                      ₹{mrp.toFixed(2)}
                    </span>
                    <span className="ml-1 sm:ml-2 text-green-600 font-black text-base sm:text-lg">
                      {discount}% off
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400">
                Inclusive of all taxes · MRP ₹{mrp.toFixed(2)}
              </p>
              <div
                className={`flex items-center gap-2 mt-2 sm:mt-3 text-xs sm:text-sm font-semibold ${inStock ? "text-green-600" : "text-red-500"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`}
                />
                {inStock
                  ? `In Stock (${med.available_quantity} units)`
                  : "Out of Stock"}
              </div>
            </div>

            {med.requires_prescription ? (
              <div className="flex items-start gap-2 sm:gap-3 bg-amber-50 border border-amber-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <span className="text-xl sm:text-2xl flex-shrink-0">📋</span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-amber-800">
                    Prescription Required
                  </p>
                  <p className="text-[10px] sm:text-xs text-amber-600 mt-0.5">
                    A valid prescription is required to order this medicine.
                  </p>
                  <Link
                    to="/prescription"
                    className="text-[10px] sm:text-xs text-amber-700 font-bold underline mt-1 inline-block"
                  >
                    Upload Prescription →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 sm:gap-3 bg-green-50 border border-green-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <span className="text-xl sm:text-2xl flex-shrink-0">✅</span>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-green-800">
                    Prescription Not Required
                  </p>
                  <p className="text-[10px] sm:text-xs text-green-600 mt-0.5">
                    This medicine can be ordered without a prescription.
                  </p>
                </div>
              </div>
            )}

            {cartError && (
              <p className="text-xs sm:text-sm text-red-500 bg-red-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl">
                ⚠️ {cartError}
              </p>
            )}

            {inStock && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">
                    Quantity:
                  </span>
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-base sm:text-lg font-bold transition"
                    >
                      −
                    </button>
                    <span className="w-8 sm:w-10 text-center font-black text-gray-900 text-sm sm:text-base">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(med.available_quantity, q + 1),
                        )
                      }
                      className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-base sm:text-lg font-bold transition"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-400">
                    Total:{" "}
                    <strong className="text-gray-700">
                      ₹{(price * quantity).toFixed(2)}
                    </strong>
                  </span>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={addToCart}
                    className={`flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 border-2
                      ${
                        added
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                      }`}
                  >
                    {added ? "✓ Added!" : "🛒 Add to Cart"}
                  </button>
                  <button
                    onClick={buyNow}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-white transition-all duration-200 shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #065f46, #059669)",
                    }}
                  >
                    Buy Now →
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 space-y-2">
              {[
                { icon: "🚚", text: "Free delivery on orders above ₹299" },
                { icon: "⚡", text: "Express delivery in 2 hours (city area)" },
                { icon: "🔄", text: "Easy 7-day return policy" },
                { icon: "🔒", text: "100% genuine & verified medicines" },
              ].map((d) => (
                <div
                  key={d.text}
                  className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600"
                >
                  <span className="text-base sm:text-lg flex-shrink-0">
                    {d.icon}
                  </span>
                  <span className="text-[11px] sm:text-sm">{d.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mt-6 sm:mt-10">
          <div className="flex gap-1 border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { key: "details", label: "Details" },
              { key: "description", label: "Description" },
              { key: "storage", label: "Storage" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold transition border-b-2 -mb-px whitespace-nowrap flex-shrink-0
                  ${
                    activeTab === tab.key
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
            {activeTab === "details" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: "Generic Name", value: med.generic_name },
                  { label: "Brand Name", value: med.brand },
                  { label: "Manufacturer", value: med.manufacturer_name },
                  { label: "Pack Size", value: med.pack_size },
                  { label: "Form", value: med.unit },
                  { label: "Category", value: med.category_name },
                  { label: "Schedule", value: med.schedule_code },
                  { label: "Salt Composition", value: med.salt_composition },
                  { label: "Batch No", value: med.batch_no },
                  {
                    label: "Expiry Date",
                    value: med.expiry_date
                      ? new Date(med.expiry_date).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })
                      : "N/A",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col sm:flex-row gap-1 sm:gap-3 py-2 border-b border-gray-50"
                  >
                    <span className="text-xs sm:text-sm text-gray-400 sm:w-40 flex-shrink-0 font-medium">
                      {row.label}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800 break-words">
                      {row.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "description" && (
              <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3">
                <p className="break-words">
                  {med.description ||
                    "Please consult a doctor before using this medicine."}
                </p>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 sm:p-4 mt-4">
                  <p className="text-[10px] sm:text-xs font-bold text-amber-800 mb-1">
                    ⚠️ Disclaimer
                  </p>
                  <p className="text-[10px] sm:text-xs text-amber-700">
                    The information provided here is for educational purposes
                    only. Please consult a qualified doctor before taking any
                    medication.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "storage" && (
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-600">
                {[
                  {
                    icon: "🌡️",
                    text: "Store in a cool and dry place (below 25°C)",
                  },
                  { icon: "☀️", text: "Protect from direct sunlight" },
                  { icon: "👶", text: "Keep out of reach of children" },
                  { icon: "📦", text: "Store in original packaging" },
                  {
                    icon: "📅",
                    text: `Expiry date: ${med.expiry_date ? new Date(med.expiry_date).toLocaleDateString("en-IN") : "N/A"}`,
                  },
                ].map((s) => (
                  <div
                    key={s.text}
                    className="flex items-start gap-2 sm:gap-3 py-2 border-b border-gray-50"
                  >
                    <span className="text-lg sm:text-xl flex-shrink-0">
                      {s.icon}
                    </span>
                    <span className="text-[11px] sm:text-sm break-words">
                      {s.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Reviews ── */}
        <ReviewSection medicineId={med.id} />
      </div>
    </div>
  );
}
