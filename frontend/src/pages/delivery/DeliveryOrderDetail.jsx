import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import deliveryService from "../../services/deliveryService";
import { useToast } from "../../context/ToastContext";

const PAYMENT_ICONS = { cod: "💵", online: "💳", upi: "📱", wallet: "👛" };

export default function DeliveryOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await deliveryService.getOrderDetail(id);
        setOrder(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // OTP input handle
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError("");
    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) return setOtpError("6 digit OTP enter karo.");

    setVerifying(true);
    setOtpError("");
    try {
      await deliveryService.verifyOTP(id, otpString);
      showToast("Order delivered! ✅", "success");
      navigate("/delivery");
    } catch (err) {
      setOtpError(err.response?.data?.message || "Galat OTP! Dobara try karo.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Order load ho raha hai...</p>
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3">❌</div>
          <p className="text-gray-500 font-semibold">Order nahi mila.</p>
          <Link
            to="/delivery/orders"
            className="text-emerald-600 font-bold text-sm mt-2 block"
          >
            ← Wapas Jao
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/delivery" className="hover:text-emerald-600 transition">
              Dashboard
            </Link>
            <span>›</span>
            <Link
              to="/delivery/orders"
              className="hover:text-emerald-600 transition"
            >
              Orders
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">
              #{order.order_number}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Order Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-black text-gray-900">
              #{order.order_number}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600">
              🚴 Out for Delivery
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Assigned:{" "}
            {new Date(order.assigned_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Customer & Address */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-700 text-sm mb-3">
            👤 Customer Details
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs w-16">Name</span>
              <span className="font-bold text-gray-900 text-sm">
                {order.full_name || order.user_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs w-16">Phone</span>
              <a
                href={`tel:${order.address_phone || order.user_phone}`}
                className="font-bold text-emerald-600 text-sm hover:underline"
              >
                {order.address_phone || order.user_phone}
              </a>
            </div>
            <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-50">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  {order.address_line1}
                  {order.address_line2 ? `, ${order.address_line2}` : ""}
                </p>
                <p className="text-sm text-gray-500">
                  {order.city}, {order.state} — {order.pincode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-700 text-sm mb-3">
            💳 Payment Details
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {PAYMENT_ICONS[order.payment_mode] || "💳"}
              </span>
              <div>
                <p className="font-bold text-gray-900 text-sm uppercase">
                  {order.payment_mode}
                </p>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    order.payment_status === "paid"
                      ? "bg-green-100 text-green-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {order.payment_status}
                </span>
              </div>
            </div>
            <p className="font-black text-2xl text-emerald-600">
              ₹{parseFloat(order.total_amount).toFixed(2)}
            </p>
          </div>
          {order.payment_mode === "cod" && (
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 font-semibold">
              💵 Customer se ₹{parseFloat(order.total_amount).toFixed(2)} cash
              collect karna hai
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-700 text-sm mb-3">
            🛍️ Order Items ({order.items?.length || 0})
          </h2>
          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-sm flex-shrink-0">
                    💊
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {item.medicine_name}
                    </p>
                    {item.pack_size && (
                      <p className="text-xs text-gray-400">{item.pack_size}</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-gray-900 text-sm">
                    ₹{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-400">×{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OTP Section */}
        {!order.otp_verified ? (
          <div className="bg-white rounded-2xl border-2 border-emerald-200 p-5">
            <h2 className="font-black text-gray-900 text-center mb-1">
              🔐 Delivery OTP Verify Karo
            </h2>
            <p className="text-xs text-gray-400 text-center mb-5">
              Customer se 6 digit OTP lo aur yahan enter karo
            </p>

            {/* OTP Inputs */}
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-11 h-12 text-center text-xl font-black rounded-xl border-2 focus:outline-none transition ${
                    otpError
                      ? "border-red-400 bg-red-50 text-red-600"
                      : digit
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-gray-50 text-gray-900 focus:border-emerald-400"
                  }`}
                />
              ))}
            </div>

            {otpError && (
              <p className="text-xs text-red-500 font-semibold text-center mb-3">
                ⚠️ {otpError}
              </p>
            )}

            <button
              onClick={handleVerify}
              disabled={verifying || otp.join("").length !== 6}
              className="w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
              style={{
                background:
                  verifying || otp.join("").length !== 6
                    ? "#6ee7b7"
                    : "linear-gradient(135deg, #065f46, #059669)",
              }}
            >
              {verifying ? (
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
                  Verify Ho Raha Hai...
                </>
              ) : (
                "✅ OTP Verify Karo & Deliver Karo"
              )}
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
            <div className="text-5xl mb-2">🎉</div>
            <p className="font-black text-green-700 text-lg">
              Order Delivered!
            </p>
            <p className="text-xs text-green-600 mt-1">
              OTP verified — delivery complete
            </p>
          </div>
        )}

        <Link
          to="/delivery/orders"
          className="block text-center text-sm font-bold text-gray-500 hover:text-gray-700 py-2"
        >
          ← Wapas Orders pe Jao
        </Link>
      </div>
    </div>
  );
}
