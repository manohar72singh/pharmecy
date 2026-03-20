import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MedicineImage from "../common/MedicineImage";
import cartService, { localCart } from "../../services/cartService";
import wishlistService from "../../services/wishlistService";
import { useToast } from "../../context/ToastContext";

const ScheduleBadge = ({ code }) => {
  const colors = {
    OTC: "bg-green-100 text-green-700",
    H: "bg-yellow-100 text-yellow-700",
    H1: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colors[code] || "bg-gray-100 text-gray-600"}`}
    >
      {code || "OTC"}
    </span>
  );
};

export default function MedicineCard({ med }) {
  const { showCartToast } = useToast();
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  const price = parseFloat(med.selling_price || 0);
  const mrp = parseFloat(med.mrp || 0);
  const discount = mrp > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inStock = (med.available_quantity || 0) > 0;
  const isLoggedIn = !!localStorage.getItem("token");

  // ── Wishlist status check on mount ───────────────
  useEffect(() => {
    if (!isLoggedIn) return;
    const cached = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
    if (cached.includes(med.id)) setWishlisted(true);
  }, [med.id, isLoggedIn]);

  // ── Add to Cart ───────────────────────────────────
  const addToCart = async () => {
    setCartError(null);
    try {
      if (isLoggedIn) {
        if (!med.batch_id) {
          setCartError("Stock unavailable. Please refresh.");
          return;
        }
        await cartService.addToCart({
          medicine_id: med.id,
          batch_id: med.batch_id,
          quantity: 1,
        });
      } else {
        localCart.add(med, 1);
      }
      showCartToast({ name: med.name, price: `₹${price.toFixed(2)}` });
      window.dispatchEvent(new Event("cartUpdated"));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Cart add error:", err);
      setCartError("Failed to add to cart. Please try again.");
      setTimeout(() => setCartError(null), 3000);
    }
  };

  // ── Toggle Wishlist ───────────────────────────────
  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }
    setWishLoading(true);
    try {
      const { data } = await wishlistService.toggle(med.id);
      const newState = data.data.wishlisted;
      setWishlisted(newState);

      const cached = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
      if (newState) {
        localStorage.setItem(
          "wishlistIds",
          JSON.stringify([...new Set([...cached, med.id])]),
        );
      } else {
        localStorage.setItem(
          "wishlistIds",
          JSON.stringify(cached.filter((id) => id !== med.id)),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg transition-all duration-200 group overflow-hidden">
      {/* ── Image ── */}
      <Link to={`/medicines/${med.id}`}>
        <div className="relative bg-gradient-to-br from-gray-50 to-emerald-50 h-36 flex items-center justify-center overflow-hidden">
          {med.image_url ? (
            <MedicineImage
              src={med.image_url}
              alt={med.name}
              categorySlug={med.category_slug}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              size="md"
            />
          ) : (
            <MedicineImage
              src={null}
              categorySlug={med.category_slug}
              size="md"
              className="group-hover:scale-110 transition-transform duration-200"
            />
          )}

          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {discount}% OFF
            </span>
          )}
          <span className="absolute top-2 right-2">
            <ScheduleBadge code={med.schedule_code} />
          </span>
          {!inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* ── Details ── */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <Link to={`/medicines/${med.id}`} className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 hover:text-emerald-600 transition">
              {med.name}
            </h3>
          </Link>
          <button
            onClick={toggleWishlist}
            disabled={wishLoading}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-red-50 transition"
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <span
              className={`text-base transition ${wishLoading ? "opacity-50" : ""}`}
            >
              {wishlisted ? "❤️" : "🤍"}
            </span>
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-0.5">{med.brand}</p>
        <p className="text-xs text-gray-400">{med.pack_size}</p>

        <div className="flex items-center gap-2 mt-2 mb-2">
          <span className="text-base font-black text-gray-900">
            ₹{price.toFixed(2)}
          </span>
          {mrp > price && (
            <span className="text-xs text-gray-400 line-through">
              ₹{mrp.toFixed(2)}
            </span>
          )}
        </div>

        {med.requires_prescription ? (
          <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mb-2">
            📋 Rx Required
          </p>
        ) : (
          <p className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-lg mb-2">
            📋 Rx Not Required
          </p>
        )}

        {cartError && (
          <p className="text-[10px] text-red-500 bg-red-50 px-2 py-1 rounded-lg mb-2">
            ⚠️ {cartError}
          </p>
        )}

        <button
          disabled={!inStock}
          onClick={addToCart}
          className={`w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            !inStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : added
                ? "bg-emerald-600 text-white scale-95"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
          }`}
        >
          {added ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
