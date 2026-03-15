import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MedicineImage from "../../components/common/MedicineImage";
import AddressForm from "../../components/common/AddressForm";
import cartService from "../../services/cartService";
import addressService from "../../services/addressService";
import orderService from "../../services/orderService";
import couponService from "../../services/couponService";

const PAYMENT_METHODS = [
  {
    id: "cod",
    icon: "💵",
    label: "Cash on Delivery",
    sub: "Delivery pe cash dena hoga",
  },
  {
    id: "online",
    icon: "💳",
    label: "Online Payment",
    sub: "Cards, NetBanking, Wallets",
  },
  { id: "upi", icon: "📱", label: "UPI", sub: "GPay, PhonePe, Paytm" },
  {
    id: "wallet",
    icon: "👛",
    label: "MediShop Wallet",
    sub: "Instant payment",
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [step, setStep] = useState(1); // 1=Address, 2=Payment, 3=Review
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showNewAddr, setShowNewAddr] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(null); // { discount_amount, code, title }
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  // ── Load cart + addresses ─────────────────────────
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    // Cart se aya coupon load karo
    const savedCoupon = localStorage.getItem("cartCoupon");
    if (savedCoupon) {
      try {
        const parsed = JSON.parse(savedCoupon);
        // discount_amount number ensure karo
        if (parsed)
          parsed.discount_amount = parseFloat(parsed.discount_amount) || 0;
        setCouponApplied(parsed);
      } catch (e) {
        console.error(e);
      }
    }

    const load = async () => {
      try {
        const [cartRes, addrRes] = await Promise.all([
          cartService.getCart(),
          addressService.getAll(),
        ]);
        const items = cartRes.data.data.items || [];
        if (items.length === 0) {
          navigate("/cart");
          return;
        }
        setCart(items);
        const addrs = addrRes.data.data || [];
        setAddresses(addrs);
        const def = addrs.find((a) => a.is_default) || addrs[0];
        if (def) setSelectedAddr(def.id);
        if (addrs.length === 0) setShowNewAddr(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Price ─────────────────────────────────────────
  const subtotal = cart.reduce(
    (s, i) => s + parseFloat(i.price) * i.quantity,
    0,
  );
  const mrpTotal = cart.reduce((s, i) => s + parseFloat(i.mrp) * i.quantity, 0);
  const saved = mrpTotal - subtotal;
  const couponDiscount = couponApplied
    ? parseFloat(couponApplied.discount_amount) || 0
    : 0;
  const delivery = subtotal >= 299 ? 0 : 49;
  const total = subtotal + delivery - couponDiscount;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  // ── Apply Coupon ─────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return setCouponError("Coupon code enter karo.");
    setCouponLoading(true);
    setCouponError("");
    try {
      const { data } = await couponService.apply(
        couponCode.trim(),
        subtotal + delivery,
      );
      setCouponApplied(data.data);
      localStorage.setItem("cartCoupon", JSON.stringify(data.data));
      setCouponCode("");
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon.");
      setCouponApplied(null);
      localStorage.removeItem("cartCoupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError("");
    localStorage.removeItem("cartCoupon");
  };

  // ── Place Order ───────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddr) return setError("Address select karo.");
    setPlacing(true);
    setError("");
    try {
      const { data } = await orderService.placeOrder({
        address_id: selectedAddr,
        payment_mode: paymentMethod,
        coupon_id: couponApplied?.coupon_id || null,
        discount_amount: couponApplied
          ? parseFloat(couponApplied.discount_amount)
          : 0,
      });
      setOrderSuccess(data.data);
      localStorage.removeItem("cartCoupon");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      setError(err.response?.data?.message || "Order place karna fail hua.");
    } finally {
      setPlacing(false);
    }
  };

  // ── Loading ───────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );

  // ── Order Success ─────────────────────────────────
  if (orderSuccess)
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl"
            style={{
              background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
              boxShadow: "0 8px 32px rgba(5,150,105,0.2)",
            }}
          >
            🎉
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            Order Ho Gaya!
          </h2>
          <p className="text-gray-500 mb-1">
            Order ID:{" "}
            <strong className="text-gray-800">#{orderSuccess.order_id}</strong>
          </p>
          <p className="text-gray-500 mb-6">
            Total:{" "}
            <strong className="text-emerald-600">
              ₹{parseFloat(orderSuccess.total_amount).toFixed(2)}
            </strong>
          </p>

          {orderSuccess.payment_mode === "cod" ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
              💵 <strong>Cash on Delivery</strong> — delivery pe payment karein
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-sm text-blue-800">
              💳 Payment complete karo — bank redirect hoga
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Link
              to="/orders"
              className="px-6 py-3 rounded-2xl text-white font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, #065f46, #059669)",
              }}
            >
              My Orders Dekho →
            </Link>
            <Link
              to="/"
              className="px-6 py-3 rounded-2xl font-bold text-sm border-2"
              style={{ borderColor: "#059669", color: "#059669" }}
            >
              Home Jao
            </Link>
          </div>
        </div>
      </div>
    );

  const selectedAddress = addresses.find((a) => a.id === selectedAddr);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-emerald-600">
              Home
            </Link>
            <span>›</span>
            <Link to="/cart" className="hover:text-emerald-600">
              Cart
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-0 max-w-md">
            {[
              { n: 1, label: "Address" },
              { n: 2, label: "Payment" },
              { n: 3, label: "Review" },
            ].map((s, idx) => (
              <div key={s.n} className="flex items-center flex-1">
                <button
                  onClick={() => step > s.n && setStep(s.n)}
                  className="flex items-center gap-2 group"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                      step >= s.n
                        ? "text-white shadow-lg"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    style={
                      step >= s.n
                        ? {
                            background:
                              "linear-gradient(135deg, #065f46, #059669)",
                          }
                        : {}
                    }
                  >
                    {step > s.n ? "✓" : s.n}
                  </div>
                  <span
                    className={`text-xs font-bold hidden sm:block ${step >= s.n ? "text-gray-800" : "text-gray-400"}`}
                  >
                    {s.label}
                  </span>
                </button>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${step > s.n ? "bg-emerald-400" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-2xl">
            <span>⚠️</span> {error}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT — Steps ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── STEP 1: Address ── */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-4">
                  📍 Delivery Address
                </h2>

                {/* Saved Addresses */}
                {addresses.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddr(addr.id);
                          setShowNewAddr(false);
                        }}
                        className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                          selectedAddr === addr.id
                            ? "border-emerald-500 shadow-md"
                            : "border-gray-100 hover:border-emerald-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-all ${
                                selectedAddr === addr.id
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAddr === addr.id && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {addr.full_name}
                              </p>
                              {addr.phone && (
                                <p className="text-xs text-gray-500">
                                  {addr.phone}
                                </p>
                              )}
                              <p className="text-sm text-gray-600 mt-1">
                                {addr.address_line1}
                                {addr.address_line2
                                  ? `, ${addr.address_line2}`
                                  : ""}
                              </p>
                              <p className="text-sm text-gray-600">
                                {addr.city}, {addr.state} — {addr.pincode}
                              </p>
                            </div>
                          </div>
                          {addr.is_default === 1 && (
                            <span
                              className="text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0"
                              style={{
                                background: "#d1fae5",
                                color: "#065f46",
                              }}
                            >
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Address Toggle */}
                {!showNewAddr ? (
                  <button
                    onClick={() => setShowNewAddr(true)}
                    className="w-full py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-bold text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">+</span> Naya Address Add Karein
                  </button>
                ) : (
                  <AddressForm
                    onSave={(saved, allAddrs) => {
                      setAddresses(allAddrs);
                      setSelectedAddr(saved.id);
                      setShowNewAddr(false);
                    }}
                    onCancel={
                      addresses.length > 0 ? () => setShowNewAddr(false) : null
                    }
                    showCancel={addresses.length > 0}
                  />
                )}

                {selectedAddr && !showNewAddr && (
                  <button
                    onClick={() => setStep(2)}
                    className="w-full mt-4 py-4 rounded-2xl text-white font-black text-sm shadow-lg transition-transform active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #065f46, #059669)",
                    }}
                  >
                    Payment Method Chunein →
                  </button>
                )}
              </div>
            )}

            {/* ── STEP 2: Payment ── */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-4">
                  💳 Payment Method
                </h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all flex items-center gap-4 ${
                        paymentMethod === pm.id
                          ? "border-emerald-500 shadow-md"
                          : "border-gray-100 hover:border-emerald-200"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          paymentMethod === pm.id
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === pm.id && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-2xl">{pm.icon}</span>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {pm.label}
                        </p>
                        <p className="text-xs text-gray-400">{pm.sub}</p>
                      </div>
                      {pm.id === "cod" && (
                        <span
                          className="ml-auto text-xs font-bold px-2 py-1 rounded-lg"
                          style={{ background: "#d1fae5", color: "#065f46" }}
                        >
                          Popular
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {paymentMethod === "cod" && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                    💵 Delivery pe <strong>cash ready rakhein</strong>. Exact
                    amount preferred.
                  </div>
                )}
                {(paymentMethod === "online" || paymentMethod === "upi") && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
                    🔒 Order place hone ke baad{" "}
                    <strong>secure payment gateway</strong> pe redirect karenge.
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 rounded-2xl font-bold text-sm border-2 transition"
                    style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
                  >
                    ← Wapas
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3.5 rounded-2xl text-white font-black text-sm shadow-lg transition-transform active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #065f46, #059669)",
                    }}
                  >
                    Order Review Karein →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Review ── */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-4">
                  📋 Order Review
                </h2>

                {/* Delivery Address Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                      📍 Delivery Address
                    </h3>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-emerald-600 font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  {selectedAddress && (
                    <div className="text-sm text-gray-600">
                      <p className="font-bold text-gray-900">
                        {selectedAddress.full_name}
                      </p>
                      {selectedAddress.phone && (
                        <p className="text-xs text-gray-400">
                          {selectedAddress.phone}
                        </p>
                      )}
                      <p>
                        {selectedAddress.address_line1}
                        {selectedAddress.address_line2
                          ? `, ${selectedAddress.address_line2}`
                          : ""}
                      </p>
                      <p>
                        {selectedAddress.city}, {selectedAddress.state} —{" "}
                        {selectedAddress.pincode}
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-700 text-sm">
                      💳 Payment Method
                    </h3>
                    <button
                      onClick={() => setStep(2)}
                      className="text-xs text-emerald-600 font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-sm text-gray-800 font-bold">
                    {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.icon}{" "}
                    {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}
                  </p>
                </div>

                {/* Coupon Apply */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                  <h3 className="font-bold text-gray-700 text-sm mb-3">
                    🏷️ Coupon Code
                  </h3>
                  {couponApplied ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl">
                      <div>
                        <p className="font-black text-emerald-700 text-sm">
                          {couponApplied.code} applied! ✅
                        </p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          ₹{couponApplied.discount_amount.toFixed(2)} ki bachat
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-xs font-bold text-red-400 hover:text-red-600 transition"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        placeholder="COUPON CODE YAHAN"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm
                                   font-bold tracking-widest focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition"
                        style={{
                          background: couponLoading
                            ? "#6ee7b7"
                            : "linear-gradient(135deg, #065f46, #059669)",
                        }}
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-xs text-red-500 font-semibold mt-2">
                      ⚠️ {couponError}
                    </p>
                  )}
                  <Link
                    to="/offers"
                    className="text-xs text-emerald-600 font-bold mt-2 block hover:underline transition"
                  >
                    🏷️ Available coupons dekho →
                  </Link>
                </div>

                {/* Items */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
                  <h3 className="font-bold text-gray-700 text-sm mb-3">
                    🛍️ Items ({totalItems})
                  </h3>
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <MedicineImage
                            src={item.image_url}
                            alt={item.name}
                            categorySlug={item.category_slug}
                            size="sm"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {item.name}
                          </p>
                          {item.pack_size && (
                            <p className="text-xs text-gray-400">
                              {item.pack_size}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-gray-900">
                            ₹
                            {(parseFloat(item.price) * item.quantity).toFixed(
                              2,
                            )}
                          </p>
                          <p className="text-xs text-gray-400">
                            ×{item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3.5 rounded-2xl font-bold text-sm border-2 transition"
                    style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
                  >
                    ← Wapas
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="flex-1 py-3.5 rounded-2xl text-white font-black text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    style={{
                      background: placing
                        ? "#6ee7b7"
                        : "linear-gradient(135deg, #065f46, #059669)",
                    }}
                  >
                    {placing ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Order Place Ho Raha Hai...
                      </>
                    ) : (
                      `🎉 Order Place Karo — ₹${total.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — Price Summary ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-4">Price Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>MRP Total ({totalItems} items)</span>
                  <span>₹{mrpTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>− ₹{saved.toFixed(2)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon ({couponApplied.code})</span>
                    <span>− ₹{couponApplied.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span
                    className={
                      delivery === 0 ? "text-green-600 font-semibold" : ""
                    }
                  >
                    {delivery === 0 ? "FREE 🎉" : `₹${delivery}`}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-gray-900 text-base">
                  <span>Total</span>
                  <span style={{ color: "#059669" }}>₹{total.toFixed(2)}</span>
                </div>
                {(saved > 0 || couponDiscount > 0) && (
                  <p className="text-xs text-green-600 font-bold bg-green-50 px-3 py-2 rounded-lg text-center">
                    🎉 ₹{(saved + couponDiscount).toFixed(2)} ki saving ho rahi
                    hai!
                  </p>
                )}
              </div>

              {/* Mini cart preview */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                {cart.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-xs text-gray-500"
                  >
                    <span className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      💊
                    </span>
                    <span className="flex-1 truncate">{item.name}</span>
                    <span>×{item.quantity}</span>
                  </div>
                ))}
                {cart.length > 3 && (
                  <p className="text-xs text-gray-400 text-center">
                    +{cart.length - 3} aur items
                  </p>
                )}
              </div>
            </div>

            {/* Trust */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              {[
                { icon: "🔒", text: "100% Secure Checkout" },
                { icon: "✅", text: "Genuine Medicines" },
                { icon: "🚚", text: "Fast Delivery" },
                { icon: "🔄", text: "Easy Returns" },
              ].map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-3 py-1.5 text-xs text-gray-600"
                >
                  <span>{b.icon}</span> {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
