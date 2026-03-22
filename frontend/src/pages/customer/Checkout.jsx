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
    sub: "Pay when you receive your order",
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
    sub: "Instant payment from wallet",
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
  const [couponApplied, setCouponApplied] = useState(null);
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

    const savedCoupon = localStorage.getItem("cartCoupon");
    if (savedCoupon) {
      try {
        const parsed = JSON.parse(savedCoupon);
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
    if (!couponCode.trim())
      return setCouponError("Please enter a coupon code.");
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
    if (!selectedAddr) return setError("Please select a delivery address.");
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
      setError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

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
        <div className="max-w-lg mx-auto px-4 py-12 sm:py-20 text-center">
          <div
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-4xl sm:text-6xl"
            style={{
              background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
              boxShadow: "0 8px 32px rgba(5,150,105,0.2)",
            }}
          >
            🎉
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            Order Placed Successfully!
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mb-1">
            Order ID:{" "}
            <strong className="text-gray-800">#{orderSuccess.order_id}</strong>
          </p>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
            Total Amount:{" "}
            <strong className="text-emerald-600">
              ₹{parseFloat(orderSuccess.total_amount).toFixed(2)}
            </strong>
          </p>

          {orderSuccess.payment_mode === "cod" ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-amber-800">
              <p>
                💵 <strong>Cash on Delivery</strong> — Please keep the cash
                ready at the time of delivery.
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-xs sm:text-sm text-blue-800">
              <p>
                💳 Processing payment — you will be redirected to our secure
                payment gateway.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/orders"
              className="px-6 py-3 rounded-xl sm:rounded-2xl text-white font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, #065f46, #059669)",
              }}
            >
              View My Orders →
            </Link>
            <Link
              to="/"
              className="px-6 py-3 rounded-xl sm:rounded-2xl font-bold text-sm border-2"
              style={{ borderColor: "#059669", color: "#059669" }}
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );

  const selectedAddress = addresses.find((a) => a.id === selectedAddr);

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-0 max-w-md mx-auto sm:mx-0">
            {[
              { n: 1, label: "Address" },
              { n: 2, label: "Payment" },
              { n: 3, label: "Review" },
            ].map((s, idx) => (
              <div key={s.n} className="flex items-center flex-1">
                <button
                  onClick={() => step > s.n && setStep(s.n)}
                  className="flex items-center gap-1.5 sm:gap-2 group"
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-black transition-all ${
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
                    className={`text-[10px] sm:text-xs font-bold hidden sm:block ${step >= s.n ? "text-gray-800" : "text-gray-400"}`}
                  >
                    {s.label}
                  </span>
                </button>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-0.5 mx-1.5 sm:mx-2 ${step > s.n ? "bg-emerald-400" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl">
            <span className="flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {step === 1 && (
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4">
                  📍 Delivery Address
                </h2>
                {addresses.length > 0 && (
                  <div className="space-y-2.5 sm:space-y-3 mb-3 sm:mb-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddr(addr.id);
                          setShowNewAddr(false);
                        }}
                        className={`bg-white rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 cursor-pointer transition-all ${
                          selectedAddr === addr.id
                            ? "border-emerald-500 shadow-md"
                            : "border-gray-100 hover:border-emerald-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div
                              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 transition-all ${
                                selectedAddr === addr.id
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAddr === addr.id && (
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-xs sm:text-sm">
                                {addr.full_name}
                              </p>
                              {addr.phone && (
                                <p className="text-[10px] sm:text-xs text-gray-500">
                                  {addr.phone}
                                </p>
                              )}
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                {addr.address_line1}
                                {addr.address_line2
                                  ? `, ${addr.address_line2}`
                                  : ""}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {addr.city}, {addr.state} — {addr.pincode}
                              </p>
                            </div>
                          </div>
                          {addr.is_default === 1 && (
                            <span
                              className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg flex-shrink-0"
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
                {!showNewAddr ? (
                  <button
                    onClick={() => setShowNewAddr(true)}
                    className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 text-xs sm:text-sm font-bold text-gray-500 hover:border-emerald-400 hover:text-emerald-600 transition flex items-center justify-center gap-2"
                  >
                    <span className="text-base sm:text-lg">+</span> Add New
                    Address
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
                    className="w-full mt-3 sm:mt-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white font-black text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #065f46, #059669)",
                    }}
                  >
                    Select Payment Method →
                  </button>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4">
                  💳 Payment Method
                </h2>
                <div className="space-y-2.5 sm:space-y-3">
                  {PAYMENT_METHODS.map((pm) => (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`bg-white rounded-xl sm:rounded-2xl border-2 p-3 sm:p-4 cursor-pointer transition-all flex items-center gap-3 sm:gap-4 ${
                        paymentMethod === pm.id
                          ? "border-emerald-500 shadow-md"
                          : "border-gray-100 hover:border-emerald-200"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          paymentMethod === pm.id
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-gray-300"
                        }`}
                      >
                        {paymentMethod === pm.id && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-xl sm:text-2xl flex-shrink-0">
                        {pm.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm">
                          {pm.label}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          {pm.sub}
                        </p>
                      </div>
                      {pm.id === "cod" && (
                        <span
                          className="ml-auto text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg flex-shrink-0"
                          style={{ background: "#d1fae5", color: "#065f46" }}
                        >
                          Popular
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {paymentMethod === "cod" && (
                  <div className="mt-3 sm:mt-4 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-amber-800">
                    💵 Please <strong>keep the exact cash ready</strong> at the
                    time of delivery.
                  </div>
                )}
                {(paymentMethod === "online" || paymentMethod === "upi") && (
                  <div className="mt-3 sm:mt-4 bg-blue-50 border border-blue-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-blue-800">
                    🔒 You will be redirected to a{" "}
                    <strong>secure payment gateway</strong> after placing the
                    order.
                  </div>
                )}
                <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm border-2 transition"
                    style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-white font-black text-xs sm:text-sm shadow-lg transition-transform active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #065f46, #059669)",
                    }}
                  >
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-3 sm:mb-4">
                  📋 Order Review
                </h2>
                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h3 className="font-bold text-gray-700 text-xs sm:text-sm flex items-center gap-2">
                      📍 Delivery Address
                    </h3>
                    <button
                      onClick={() => setStep(1)}
                      className="text-[10px] sm:text-xs text-emerald-600 font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  {selectedAddress && (
                    <div className="text-xs sm:text-sm text-gray-600">
                      <p className="font-bold text-gray-900">
                        {selectedAddress.full_name}
                      </p>
                      {selectedAddress.phone && (
                        <p className="text-[10px] sm:text-xs text-gray-400">
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

                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-700 text-xs sm:text-sm">
                      💳 Payment Method
                    </h3>
                    <button
                      onClick={() => setStep(2)}
                      className="text-[10px] sm:text-xs text-emerald-600 font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-800 font-bold">
                    {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.icon}{" "}
                    {PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}
                  </p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 mb-3 sm:mb-4">
                  <h3 className="font-bold text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3">
                    🏷️ Coupon Code
                  </h3>
                  {couponApplied ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl">
                      <div>
                        <p className="font-black text-emerald-700 text-xs sm:text-sm">
                          {couponApplied.code} applied! ✅
                        </p>
                        <p className="text-[10px] sm:text-xs text-emerald-600 mt-0.5">
                          Saved ₹{couponApplied.discount_amount.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[10px] sm:text-xs font-bold text-red-400 hover:text-red-600 transition"
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
                        placeholder="ENTER CODE"
                        className="flex-1 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50 text-xs sm:text-sm font-bold tracking-widest focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm text-white transition"
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
                    <p className="text-[10px] sm:text-xs text-red-500 font-semibold mt-2">
                      ⚠️ {couponError}
                    </p>
                  )}
                  <Link
                    to="/offers"
                    className="text-[10px] sm:text-xs text-emerald-600 font-bold mt-2 block hover:underline transition"
                  >
                    🏷️ View all available coupons →
                  </Link>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 mb-3 sm:mb-4">
                  <h3 className="font-bold text-gray-700 text-xs sm:text-sm mb-2 sm:mb-3">
                    🛍️ Items ({totalItems})
                  </h3>
                  <div className="space-y-2.5 sm:space-y-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 sm:gap-3"
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <MedicineImage
                            src={item.image_url}
                            alt={item.name}
                            categorySlug={item.category_slug}
                            size="sm"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                            {item.name}
                          </p>
                          {item.pack_size && (
                            <p className="text-[10px] sm:text-xs text-gray-400">
                              {item.pack_size}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs sm:text-sm font-black text-gray-900">
                            ₹
                            {(parseFloat(item.price) * item.quantity).toFixed(
                              2,
                            )}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400">
                            ×{item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm border-2 transition"
                    style={{ borderColor: "#e5e7eb", color: "#6b7280" }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-white font-black text-xs sm:text-sm shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                    style={{
                      background: placing
                        ? "#6ee7b7"
                        : "linear-gradient(135deg, #065f46, #059669)",
                    }}
                  >
                    {placing
                      ? "Placing..."
                      : `🎉 Place Order — ₹${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                Price Details
              </h3>
              <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>MRP Total ({totalItems})</span>
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
                <div className="border-t border-gray-100 pt-2.5 sm:pt-3 flex justify-between font-black text-gray-900 text-sm sm:text-base">
                  <span>Total</span>
                  <span style={{ color: "#059669" }}>₹{total.toFixed(2)}</span>
                </div>
                {(saved > 0 || couponDiscount > 0) && (
                  <p className="text-[10px] sm:text-xs text-green-600 font-bold bg-green-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center">
                    🎉 You are saving ₹{(saved + couponDiscount).toFixed(2)} on
                    this order!
                  </p>
                )}
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 space-y-1.5 sm:space-y-2">
                {cart.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500"
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-emerald-50 flex items-center justify-center flex-shrink-0 text-xs">
                      💊
                    </span>
                    <span className="flex-1 truncate">{item.name}</span>
                    <span className="flex-shrink-0">×{item.quantity}</span>
                  </div>
                ))}
                {cart.length > 3 && (
                  <p className="text-[10px] sm:text-xs text-gray-400 text-center">
                    +{cart.length - 3} more items
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4">
              {[
                { icon: "🔒", text: "100% Secure Checkout" },
                { icon: "✅", text: "Genuine Medicines" },
                { icon: "🚚", text: "Fast Delivery" },
                { icon: "🔄", text: "Easy Returns" },
              ].map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-2 sm:gap-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-gray-600"
                >
                  <span className="flex-shrink-0">{b.icon}</span> {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
