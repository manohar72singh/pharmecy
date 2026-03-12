import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import MedicineImage from "../../components/common/MedicineImage";
import cartService, { localCart } from "../../services/cartService";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!localStorage.getItem("token");

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
      setCart(localCart.get()); // fallback
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // cartUpdated event pe reload
  useEffect(() => {
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, [loadCart]);

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
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Price Calculations ────────────────────────────
  const subtotal = cart.reduce(
    (s, i) => s + parseFloat(i.price) * i.quantity,
    0,
  );
  const mrpTotal = cart.reduce((s, i) => s + parseFloat(i.mrp) * i.quantity, 0);
  const saved = mrpTotal - subtotal;
  const delivery = subtotal >= 299 ? 0 : 49;
  const total = subtotal - discount + delivery;

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (code === "MEDI10") {
      setDiscount(Math.round(subtotal * 0.1));
      setCouponMsg("✅ 10% discount apply ho gaya!");
    } else if (code === "FIRST50") {
      setDiscount(50);
      setCouponMsg("✅ ₹50 discount apply ho gaya!");
    } else {
      setDiscount(0);
      setCouponMsg("❌ Invalid coupon code");
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", {
        state: {
          from: "/checkout",
          message: "Checkout ke liye pehle login karein",
        },
      });
    } else {
      navigate("/checkout");
    }
  };

  // ── Loading ───────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Cart load ho rahi hai...</p>
          </div>
        </div>
      </div>
    );

  // ── Empty Cart ────────────────────────────────────
  if (cart.length === 0)
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            Aapka cart khali hai!
          </h2>
          <p className="text-gray-500 mb-8">
            Kuch medicines add karein aur healthy rahein 💊
          </p>
          <Link
            to="/medicines"
            className="inline-block text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition"
            style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
          >
            Medicines Browse Karein →
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

      {/* Guest Banner */}
      {!user && (
        <div className="bg-amber-50 border-b border-amber-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <span className="text-lg">👤</span>
              <span>
                <strong>Login karein</strong> — orders track karein aur
                exclusive discounts paayein!
              </span>
            </div>
            <Link
              to="/login"
              state={{ from: "/cart" }}
              className="flex-shrink-0 text-xs font-bold text-white px-4 py-2 rounded-xl"
              style={{ background: "#059669" }}
            >
              Login / Register
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900">
            My Cart{" "}
            <span className="text-gray-400 font-normal text-lg">
              ({cart.length} items)
            </span>
          </h1>
          <button
            onClick={clearCartAll}
            className="text-xs text-red-500 hover:text-red-700 font-semibold border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition"
          >
            🗑️ Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const price = parseFloat(item.price);
              const mrp = parseFloat(item.mrp);
              const disc =
                mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex gap-4 hover:border-emerald-200 transition"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <MedicineImage
                      src={item.image_url}
                      alt={item.name}
                      categorySlug={item.category_slug}
                      className="w-full h-full object-cover rounded-2xl"
                      size="md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                          {item.name}
                        </h3>
                        {item.pack_size && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.pack_size}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item)}
                        className="text-gray-300 hover:text-red-500 transition flex-shrink-0 p-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
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

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-gray-900">
                          ₹{price.toFixed(2)}
                        </span>
                        {mrp > price && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              ₹{mrp.toFixed(2)}
                            </span>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              {disc}% off
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => updateQty(item, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-lg transition"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-black text-gray-900 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold text-lg transition"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
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
              className="flex items-center gap-2 text-sm text-emerald-600 font-semibold hover:text-emerald-700 mt-2"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* ── Order Summary ── */}
          <div className="space-y-4">
            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🎟️</span> Apply Coupon
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Coupon code"
                  onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  onClick={applyCoupon}
                  className="px-4 py-2.5 rounded-xl text-white text-sm font-bold transition"
                  style={{ background: "#059669" }}
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p
                  className={`text-xs mt-2 font-semibold ${couponMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}
                >
                  {couponMsg}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Try: <strong>MEDI10</strong> or <strong>FIRST50</strong>
              </p>
            </div>

            {/* Price Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Price Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>
                    MRP Total ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                  <span>₹{mrpTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Product Discount</span>
                  <span>− ₹{saved.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>− ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span
                    className={
                      delivery === 0 ? "text-green-600 font-semibold" : ""
                    }
                  >
                    {delivery === 0 ? "FREE 🎉" : `₹${delivery}`}
                  </span>
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    ₹{(299 - subtotal).toFixed(0)} aur add karein — FREE
                    delivery paayein!
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-gray-900 text-base">
                  <span>Total Amount</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                {saved + discount > 0 && (
                  <p className="text-xs text-green-600 font-bold bg-green-50 px-3 py-2 rounded-lg text-center">
                    🎉 Aap ₹{(saved + discount).toFixed(2)} bachaa rahe hain!
                  </p>
                )}
              </div>

              <button
                onClick={handleCheckout}
                className="w-full mt-5 py-4 rounded-2xl text-white font-black text-base shadow-lg transition-transform active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #065f46, #059669)",
                }}
              >
                {user
                  ? "Proceed to Checkout →"
                  : "Login karke Checkout karein →"}
              </button>

              {!user && (
                <p className="text-center text-xs text-gray-400 mt-2">
                  Cart items save rahenge login ke baad ✅
                </p>
              )}
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              {[
                { icon: "🔒", text: "100% Secure Payments" },
                { icon: "✅", text: "Genuine & Verified Medicines" },
                { icon: "🚚", text: "Fast Doorstep Delivery" },
                { icon: "🔄", text: "Easy 7-day Returns" },
              ].map((b) => (
                <div
                  key={b.text}
                  className="flex items-center gap-3 py-1.5 text-xs text-gray-600"
                >
                  <span className="text-base">{b.icon}</span> {b.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
