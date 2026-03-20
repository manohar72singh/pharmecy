import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import deliveryService from "../../services/deliveryService";

const PAYMENT_ICONS = { cod: "💵", online: "💳", upi: "📱", wallet: "👛" };

export default function DeliveryOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [msg, setMsg] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    deliveryService
      .getOrderDetail(id)
      .then(({ data }) => setOrder(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setOtpError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6)
      return setOtpError("Please enter the 6-digit OTP.");
    setVerifying(true);
    try {
      await deliveryService.verifyOTP(id, otpString);
      setMsg("Order delivered successfully! ✅");
      setTimeout(() => navigate("/delivery"), 1500);
    } catch (err) {
      setOtpError(
        err.response?.data?.message || "Invalid OTP! Please try again.",
      );
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!order)
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">❌</div>
        <p className="text-gray-500 font-bold">Order not found.</p>
        <Link
          to="/delivery/orders"
          className="text-emerald-600 font-bold text-sm mt-2 block"
        >
          ← Go Back to Orders
        </Link>
      </div>
    );

  return (
    <div>
      {/* Toast */}
      {msg && (
        <div
          className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-xl"
          style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
        >
          {msg}
        </div>
      )}

      {/* Header Banner */}
      <div
        className="rounded-3xl p-5 mb-4 shadow-md"
        style={{ background: "linear-gradient(135deg,#064e3b,#065f46)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-400 text-xs font-semibold mb-1">
              Order Number
            </p>
            <h1 className="text-white font-black text-xl">
              #{order.order_number}
            </h1>
            <p className="text-emerald-300 text-xs mt-1">
              Assigned:{" "}
              {new Date(order.assigned_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            🚴 Out for Delivery
          </span>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Customer */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
            <span>👤</span>
            <h2 className="font-black text-gray-900 text-sm">
              Customer Details
            </h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold">Name</span>
              <span className="font-bold text-gray-900 text-sm">
                {order.full_name || order.user_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-semibold">Phone</span>
              <a
                href={`tel:${order.address_phone || order.user_phone}`}
                className="font-bold text-emerald-600 text-sm hover:underline"
              >
                📞 {order.address_phone || order.user_phone}
              </a>
            </div>
            <div className="pt-2 border-t border-gray-50">
              <p className="text-xs text-gray-400 font-semibold mb-1.5">
                📍 Delivery Address
              </p>
              <p className="font-semibold text-gray-800 text-sm">
                {order.address_line1}
                {order.address_line2 ? `, ${order.address_line2}` : ""}
              </p>
              <p className="text-gray-500 text-sm">
                {order.city}, {order.state} — {order.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
            <span>💳</span>
            <h2 className="font-black text-gray-900 text-sm">Payment Info</h2>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-xl">
                {PAYMENT_ICONS[order.payment_mode] || "💳"}
              </div>
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
              ₹{parseFloat(order.total_amount).toFixed(0)}
            </p>
          </div>
          {order.payment_mode === "cod" && (
            <div className="mx-5 mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-100 text-xs font-bold text-amber-700">
              💵 Please collect ₹{parseFloat(order.total_amount).toFixed(0)}{" "}
              cash from the customer.
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-2">
            <span>🛍️</span>
            <h2 className="font-black text-gray-900 text-sm">
              Items List ({order.items?.length || 0})
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
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
                <div className="text-right">
                  <p className="font-black text-gray-900 text-sm">
                    ₹{(parseFloat(item.unit_price) * item.quantity).toFixed(0)}
                  </p>
                  <p className="text-xs text-gray-400">×{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OTP Verification Section */}
        {!order.otp_verified ? (
          <div className="bg-white rounded-3xl border-2 border-emerald-300 overflow-hidden shadow-md">
            <div
              className="px-5 py-4 text-center border-b border-emerald-100"
              style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)" }}
            >
              <div className="text-3xl mb-1">🔐</div>
              <h2 className="font-black text-gray-900 text-base">
                Verify Delivery OTP
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Collect the 6-digit OTP from the customer
              </p>
            </div>
            <div className="px-5 py-5">
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
                    className={`w-12 h-14 text-center text-2xl font-black rounded-2xl border-2 focus:outline-none transition ${
                      otpError
                        ? "border-red-400 bg-red-50 text-red-600"
                        : digit
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-gray-50 text-gray-900 focus:border-emerald-400 focus:bg-white"
                    }`}
                  />
                ))}
              </div>
              {otpError && (
                <p className="text-xs text-red-500 font-bold text-center mb-3 bg-red-50 py-2 rounded-xl">
                  ⚠️ {otpError}
                </p>
              )}
              <button
                onClick={handleVerify}
                disabled={verifying || otp.join("").length !== 6}
                className="w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                style={{
                  background:
                    verifying || otp.join("").length !== 6
                      ? "#6ee7b7"
                      : "linear-gradient(135deg,#065f46,#059669)",
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
                    </svg>{" "}
                    Verifying...
                  </>
                ) : (
                  "✅ Verify OTP & Mark Delivered"
                )}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="rounded-3xl p-6 text-center shadow-md"
            style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
          >
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-black text-white text-xl">Order Delivered!</p>
            <p className="text-emerald-300 text-xs mt-1">
              OTP verified — transaction complete
            </p>
          </div>
        )}

        <Link
          to="/delivery/orders"
          className="block text-center text-sm font-bold text-gray-500 hover:text-emerald-600 py-3 transition"
        >
          ← Return to Assigned Orders
        </Link>
      </div>
    </div>
  );
}
