import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import MedicineImage from "../../components/common/MedicineImage";
import cartService, { localCart } from "../../services/cartService";
import couponService from "../../services/couponservice";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [applied, setApplied] = useState(null); // { code, discount_amount, coupon_id }
  const [couponMsg, setCouponMsg] = useState({ type: "", text: "" });
  const [allCoupons, setAllCoupons] = useState([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!localStorage.getItem("token");

  // ── Load saved coupon on mount ────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("cartCoupon");
    if (saved) {
      try {
        setApplied(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // ── Load Cart ─────────────────────────────────────
  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      if (isLoggedIn) {
        const { data } = await cartService.getCart();
        setCart(data.data.items || []);
      } else {
        setCart(localCart.get());
      }
    } catch (err) {
      console.error(err);
      setCart(localCart.get());
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // ── Load Coupons ──────────────────────────────────
  useEffect(() => {
    couponService
      .getAll()
      .then((res) => setAllCoupons(res.data.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);
  useEffect(() => {
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, [loadCart]);

  // ── Price Calculations ────────────────────────────
  const subtotal = cart.reduce(
    (s, i) => s + parseFloat(i.price) * i.quantity,
    0,
  );
  const mrpTotal = cart.reduce((s, i) => s + parseFloat(i.mrp) * i.quantity, 0);
  const saved = mrpTotal - subtotal;
  const delivery = subtotal >= 299 ? 0 : 49;
  const couponDiscount = applied ? applied.discount_amount : 0;
  const total = subtotal - couponDiscount + delivery;

  // ── Eligible coupons based on cart value ─────────
  const eligibleCoupons = allCoupons.filter((c) => {
    if (c.discount_type === "flat") {
      return parseFloat(c.discount_value) <= subtotal;
    }
    return true;
  });

  // ── Apply Coupon (DB validate) ────────────────
  const handleApply = async () => {
    if (!couponCode.trim())
      return setCouponMsg({
        type: "error",
        text: "Please enter a coupon code.",
      });
    if (!isLoggedIn)
      return setCouponMsg({
        type: "error",
        text: "Please login to apply coupons.",
      });

    setCouponLoading(true);
    setCouponMsg({ type: "", text: "" });
    try {
      const { data } = await couponService.apply(
        couponCode.trim(),
        subtotal + delivery,
      );
      setApplied(data.data);
      localStorage.setItem("cartCoupon", JSON.stringify(data.data));
      setCouponMsg({ type: "success", text: `🎉 ${data.message}` });
      setCouponCode("");
    } catch (err) {
      setApplied(null);
      localStorage.removeItem("cartCoupon");
      setCouponMsg({
        type: "error",
        text: err.response?.data?.message || "Invalid coupon code.",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setApplied(null);
    localStorage.removeItem("cartCoupon");
    setCouponMsg({ type: "", text: "" });
    setCouponCode("");
  };

  // ── Quick Apply ───────────────────
  const quickApply = async (code) => {
    if (!isLoggedIn)
      return setCouponMsg({
        type: "error",
        text: "Please login to apply coupons.",
      });
    setCouponLoading(true);
    setCouponMsg({ type: "", text: "" });
    try {
      const { data } = await couponService.apply(code, subtotal + delivery);
      setApplied(data.data);
      localStorage.setItem("cartCoupon", JSON.stringify(data.data));
      setCouponMsg({ type: "success", text: `🎉 ${data.message}` });
    } catch (err) {
      setCouponMsg({
        type: "error",
        text: err.response?.data?.message || "Invalid coupon code.",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Update Quantity ───────────────────────────────
  const updateQty = async (item, qty) => {
    if (qty < 1) return removeItem(item);
    try {
      if (isLoggedIn) {
        await cartService.updateItem(item.id, qty);
        setCart(
          cart.map((i) => (i.id === item.id ? { ...i, quantity: qty } : i)),
        );
      } else {
        localCart.update(item.medicine_id, qty);
        setCart(localCart.get());
      }
      if (applied) {
        setApplied(null);
        localStorage.removeItem("cartCoupon");
        setCouponMsg({
          type: "info",
          text: "Cart updated. Please re-apply your coupon.",
        });
      }
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Remove Item ───────────────────────────────────
  const removeItem = async (item) => {
    try {
      if (isLoggedIn) {
        await cartService.removeItem(item.id);
        setCart(cart.filter((i) => i.id !== item.id));
      } else {
        localCart.remove(item.medicine_id);
        setCart(localCart.get());
      }
      if (applied) {
        setApplied(null);
        setCouponMsg({ type: "", text: "" });
      }
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Clear Cart ────────────────────────────────────
  const clearCartAll = async () => {
    try {
      if (isLoggedIn) {
        await cartService.clearCart();
        setCart([]);
      } else {
        localCart.clear();
        setCart([]);
      }
      setApplied(null);
      localStorage.removeItem("cartCoupon");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Checkout ──────────────────────────────────────
  const handleCheckout = () => {
    if (!user) {
      navigate("/login", {
        state: {
          from: "/checkout",
          message: "Please login to proceed to checkout.",
        },
      });
    } else {
      navigate("/checkout");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your cart...</p>
        </div>
      </div>
    );

  if (cart.length === 0)
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl sm:text-8xl mb-6">🛒</div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-2">
            Your cart is empty!
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mb-8">
            Add some medicines to your cart and stay healthy 💊
          </p>
          <Link
            to="/medicines"
            className="inline-block text-white font-bold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg text-sm sm:text-base"
            style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
          >
            Browse Medicines →
          </Link>
        </div>
      </div>
    );

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
            <span className="text-gray-700 font-medium">My Cart</span>
          </div>
        </div>
      </div>

      {!user && (
        <div className="bg-amber-50 border-b border-amber-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-800">
              <span className="text-base sm:text-lg flex-shrink-0">👤</span>
              <span>
                <strong>Login now</strong> to track your orders and enjoy
                exclusive discounts!
              </span>
            </div>
            <Link
              to="/login"
              state={{ from: "/cart" }}
              className="flex-shrink-0 text-xs font-bold text-white px-4 py-2 rounded-xl whitespace-nowrap"
              style={{ background: "#059669" }}
            >
              Login / Register
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">
            My Cart{" "}
            <span className="text-gray-400 font-normal text-base sm:text-lg">
              ({cart.length})
            </span>
          </h1>
          <button
            onClick={clearCartAll}
            className="text-[10px] sm:text-xs text-red-500 hover:text-red-700 font-semibold border border-red-200 hover:border-red-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition"
          >
            🗑️ Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cart.map((item) => {
              const price = parseFloat(item.price);
              const mrp = parseFloat(item.mrp);
              const disc =
                mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-5 flex gap-3 sm:gap-4 hover:border-emerald-200 transition"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <MedicineImage
                      src={item.image_url}
                      alt={item.name}
                      categorySlug={item.category_slug}
                      className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                      size="md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-xs sm:text-sm md:text-base leading-tight">
                          {item.name}
                        </h3>
                        {item.pack_size && (
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                            {item.pack_size}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item)}
                        className="text-gray-300 hover:text-red-500 transition flex-shrink-0 p-1"
                      >
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 sm:mt-3 flex-wrap gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-base sm:text-lg font-black text-gray-900">
                          ₹{price.toFixed(2)}
                        </span>
                        {mrp > price && (
                          <>
                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                              ₹{mrp.toFixed(2)}
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                              {disc}% off
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => updateQty(item, item.quantity - 1)}
                          className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-base sm:text-lg transition"
                        >
                          −
                        </button>
                        <span className="w-6 sm:w-8 text-center font-black text-gray-900 text-xs sm:text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item, item.quantity + 1)}
                          className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-base sm:text-lg transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5 sm:mt-2">
                      Item total:{" "}
                      <strong className="text-gray-700">
                        ₹{(price * item.quantity).toFixed(2)}
                      </strong>
                    </p>
                  </div>
                </div>
              );
            })}
            <Link
              to="/medicines"
              className="flex items-center gap-2 text-xs sm:text-sm text-emerald-600 font-semibold hover:text-emerald-700 mt-2"
            >
              ← Continue Shopping
            </Link>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <span>🎟️</span> Apply Coupon
              </h3>
              {applied ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl mb-3">
                  <div>
                    <p className="font-black text-emerald-700 text-xs sm:text-sm">
                      {applied.code} ✅
                    </p>
                    <p className="text-[10px] sm:text-xs text-emerald-600 mt-0.5">
                      Saved ₹{applied.discount_amount.toFixed(2)}
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
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponMsg({ type: "", text: "" });
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleApply()}
                    placeholder="Enter coupon code"
                    className="flex-1 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-gray-200 text-xs sm:text-sm font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                  <button
                    onClick={handleApply}
                    disabled={couponLoading}
                    className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-white text-xs sm:text-sm font-bold transition"
                    style={{
                      background: couponLoading ? "#6ee7b7" : "#059669",
                    }}
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}

              {couponMsg.text && (
                <p
                  className={`text-[10px] sm:text-xs font-semibold mb-3 ${couponMsg.type === "success" ? "text-emerald-600" : couponMsg.type === "info" ? "text-blue-500" : "text-red-500"}`}
                >
                  {couponMsg.text}
                </p>
              )}

              {!applied && eligibleCoupons.length > 0 && (
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-semibold mb-2">
                    🎁 Available offers ({eligibleCoupons.length})
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    {eligibleCoupons.map((c) => {
                      const discText =
                        c.discount_type === "flat"
                          ? `₹${c.discount_value} off`
                          : `${c.discount_value}% off`;
                      const savingsPreview =
                        c.discount_type === "flat"
                          ? parseFloat(c.discount_value)
                          : (subtotal * parseFloat(c.discount_value)) / 100;
                      return (
                        <div
                          key={c.id}
                          className="flex-shrink-0 w-32 sm:w-36 border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-xl p-2 sm:p-2.5 flex flex-col justify-between gap-1.5"
                        >
                          <div>
                            <p className="font-black text-gray-800 text-[10px] sm:text-xs tracking-wider">
                              {c.code}
                            </p>
                            <p className="text-[10px] sm:text-xs font-bold text-emerald-600">
                              {discText}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-400">
                              Save ₹{savingsPreview.toFixed(0)}
                            </p>
                          </div>
                          <button
                            onClick={() => quickApply(c.code)}
                            className="w-full text-[10px] sm:text-xs font-bold text-white py-1 rounded-lg transition"
                            style={{ background: "#059669" }}
                          >
                            Apply
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!applied &&
                eligibleCoupons.length === 0 &&
                allCoupons.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-[10px] sm:text-xs text-amber-700">
                    💡 Add more items to your cart to unlock exclusive coupons!
                  </div>
                )}
              <Link
                to="/offers"
                className="text-[10px] sm:text-xs text-emerald-600 font-bold mt-3 block hover:underline"
              >
                🏷️ View all offers →
              </Link>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden">
              <button
                onClick={() => setPriceOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm sm:text-base">
                    Price Details
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400">
                    ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="font-black text-emerald-600 text-base sm:text-lg">
                    ₹{total.toFixed(2)}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${priceOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {priceOpen && (
                <div className="px-4 sm:px-5 pb-3 sm:pb-4 border-t border-gray-50">
                  <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm pt-3">
                    <div className="flex justify-between text-gray-600">
                      <span>MRP Total</span>
                      <span>₹{mrpTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-semibold">
                      <span>Product Discount</span>
                      <span>− ₹{saved.toFixed(2)}</span>
                    </div>
                    {applied && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Coupon ({applied.code})</span>
                        <span>− ₹{couponDiscount.toFixed(2)}</span>
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
                    {delivery > 0 && (
                      <p className="text-[10px] sm:text-xs text-amber-600 bg-amber-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                        Add ₹{(299 - subtotal).toFixed(0)} more for FREE
                        delivery!
                      </p>
                    )}
                    <div className="border-t border-gray-100 pt-2.5 sm:pt-3 flex justify-between font-black text-gray-900">
                      <span>Total Amount</span>
                      <span className="text-emerald-600">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                    {saved + couponDiscount > 0 && (
                      <p className="text-[10px] sm:text-xs text-green-600 font-bold bg-green-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center">
                        🎉 You are saving ₹{(saved + couponDiscount).toFixed(2)}{" "}
                        on this order!
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white font-black text-sm sm:text-base shadow-lg transition-transform active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #065f46, #059669)",
                  }}
                >
                  {user ? "Proceed to Checkout →" : "Login to Checkout →"}
                </button>
                {!user && (
                  <p className="text-center text-[10px] sm:text-xs text-gray-400 mt-2">
                    Your items will be saved after you login
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4">
              {[
                { icon: "🔒", text: "100% Secure Payments" },
                { icon: "✅", text: "Genuine & Verified Medicines" },
                { icon: "🚚", text: "Fast Doorstep Delivery" },
                { icon: "🔄", text: "Easy 7-day Returns" },
              ].map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-2 sm:gap-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-gray-600"
                >
                  <span className="text-sm sm:text-base flex-shrink-0">
                    {b.icon}
                  </span>{" "}
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
