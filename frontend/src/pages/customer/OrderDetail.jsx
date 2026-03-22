import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import MedicineImage from "../../components/common/MedicineImage";
import ReviewModal from "../../components/common/ReviewModal";
import orderService from "../../services/orderService";
import reviewService from "../../services/reviewservice";

const STATUS_CONFIG = {
  placed: {
    label: "Order Placed",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: "📦",
  },
  prescription_pending: {
    label: "Prescription Pending",
    color: "text-amber-600",
    bg: "bg-amber-50",
    icon: "📋",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-purple-600",
    bg: "bg-purple-50",
    icon: "✅",
  },
  processing: {
    label: "Processing",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    icon: "⚙️",
  },
  packed: {
    label: "Packed",
    color: "text-orange-600",
    bg: "bg-orange-50",
    icon: "📫",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    icon: "🚴",
  },
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: "🎉",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-500",
    bg: "bg-red-50",
    icon: "❌",
  },
  returned: {
    label: "Returned",
    color: "text-gray-500",
    bg: "bg-gray-100",
    icon: "↩️",
  },
};

const TRACKING_STEPS = [
  { key: "placed", label: "Placed", icon: "📦" },
  { key: "confirmed", label: "Confirmed", icon: "✅" },
  { key: "processing", label: "Processing", icon: "⚙️" },
  { key: "packed", label: "Packed", icon: "📫" },
  { key: "out_for_delivery", label: "Delivery", icon: "🚴" },
  { key: "delivered", label: "Delivered", icon: "🎉" },
];

const STATUS_ORDER = [
  "placed",
  "confirmed",
  "processing",
  "packed",
  "out_for_delivery",
  "delivered",
];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    color: "text-gray-500",
    bg: "bg-gray-100",
    icon: "•",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-bold ${cfg.bg} ${cfg.color}`}
    >
      <span className="flex-shrink-0">{cfg.icon}</span>
      <span className="whitespace-nowrap">{cfg.label}</span>
    </span>
  );
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewed, setReviewed] = useState([]);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await orderService.getOrderDetail(id);
        const orderData = data.data.order;
        const itemsData = data.data.items || [];
        setOrder(orderData);
        setItems(itemsData);
        setHistory(data.data.history || []);

        if (orderData.order_status === "delivered") {
          const user = JSON.parse(localStorage.getItem("user") || "null");
          if (user) {
            const reviewChecks = await Promise.all(
              itemsData.map((item) =>
                reviewService
                  .getByMedicine(item.medicine_id)
                  .then((res) => {
                    const reviews = res.data.data || [];
                    const alreadyReviewed = reviews.some(
                      (r) =>
                        r.user_id === user.id && r.order_id === parseInt(id),
                    );
                    return alreadyReviewed ? item.medicine_id : null;
                  })
                  .catch(() => null),
              ),
            );
            setReviewed(reviewChecks.filter(Boolean));
          }
        }
      } catch (err) {
        console.error(err);
        setError("Order not found.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(id, {
        reason: cancelReason || "Cancelled by customer",
      });
      setOrder({
        ...order,
        order_status: "cancelled",
        cancellation_reason: cancelReason,
      });
      setShowCancel(false);
    } catch (err) {
      setError(err.response?.data?.message || "Cancellation failed.");
    } finally {
      setCancelling(false);
    }
  };

  const currentStepIdx = STATUS_ORDER.indexOf(order?.order_status);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading order details...</p>
        </div>
      </div>
    );

  if (error || !order)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-600 font-bold mb-4">
            {error || "Order not found"}
          </p>
          <Link
            to="/orders"
            className="text-emerald-600 font-bold hover:underline"
          >
            ← Back to My Orders
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 overflow-x-auto scrollbar-hide">
            <Link
              to="/"
              className="hover:text-emerald-600 transition whitespace-nowrap flex-shrink-0"
            >
              Home
            </Link>
            <span className="flex-shrink-0">›</span>
            <Link
              to="/orders"
              className="hover:text-emerald-600 transition whitespace-nowrap flex-shrink-0"
            >
              My Orders
            </Link>
            <span className="flex-shrink-0">›</span>
            <span className="text-gray-700 font-medium whitespace-nowrap">
              #{order.order_number}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-5">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl">
            <span className="flex-shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-lg sm:text-xl font-black text-gray-900">
                  #{order.order_number}
                </h1>
                <StatusBadge status={order.order_status} />
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {order.estimated_delivery && (
                <p className="text-xs sm:text-sm text-emerald-600 font-semibold mt-1">
                  🚚 Est. delivery:{" "}
                  {new Date(order.estimated_delivery).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </p>
              )}
            </div>
            {["placed", "confirmed"].includes(order.order_status) && (
              <button
                onClick={() => setShowCancel(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition"
              >
                Cancel Order
              </button>
            )}
          </div>

          {order.order_status === "cancelled" && order.cancellation_reason && (
            <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-red-600">
              <strong>Cancellation Reason:</strong> {order.cancellation_reason}
            </div>
          )}
        </div>

        {/* OTP Card */}
        {order.order_status === "out_for_delivery" &&
          order.delivery_otp &&
          !order.otp_verified && (
            <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-emerald-300 p-4 sm:p-5">
              <div className="flex items-start sm:items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
                  🚴
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm sm:text-base">
                    Delivery OTP
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Provide this OTP to delivery partner
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2 justify-center my-3 sm:my-4">
                {order.delivery_otp
                  .toString()
                  .split("")
                  .map((digit, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-12 sm:w-12 sm:h-14 rounded-lg sm:rounded-xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-xl sm:text-2xl font-black text-emerald-700"
                    >
                      {digit}
                    </div>
                  ))}
              </div>
              <p className="text-[10px] sm:text-xs text-center text-gray-400 mt-2">
                ⚠️ For delivery verification only — do not share
              </p>
            </div>
          )}

        {/* Order Tracking */}
        {!["cancelled", "returned"].includes(order.order_status) && (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5">
            <h3 className="font-bold text-gray-900 mb-4 sm:mb-5 text-sm sm:text-base">
              📍 Order Tracking
            </h3>
            <div className="relative">
              <div
                className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100"
                style={{ zIndex: 0 }}
              >
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{
                    width:
                      currentStepIdx >= 0
                        ? `${(currentStepIdx / (TRACKING_STEPS.length - 1)) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <div
                className="relative flex justify-between"
                style={{ zIndex: 1 }}
              >
                {TRACKING_STEPS.map((step, idx) => {
                  const done = currentStepIdx >= idx;
                  const current = currentStepIdx === idx;
                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center gap-1.5 sm:gap-2"
                      style={{ flex: 1 }}
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg font-black border-2 transition-all ${
                          done
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-lg"
                            : "border-gray-200 bg-white text-gray-300"
                        } ${current ? "ring-4 ring-emerald-100" : ""}`}
                      >
                        {done ? (current ? step.icon : "✓") : step.icon}
                      </div>
                      <p
                        className={`text-[10px] sm:text-xs font-semibold text-center ${done ? "text-emerald-600" : "text-gray-400"}`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5">
              <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                🛍️ Order Items ({items.length})
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => {
                  const price = parseFloat(item.unit_price);
                  const total = parseFloat(item.total_price);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <MedicineImage
                          src={item.image_url}
                          alt={item.name}
                          categorySlug={item.category_slug}
                          size="sm"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm leading-tight">
                          {item.name}
                        </p>
                        {item.brand && (
                          <p className="text-[10px] sm:text-xs text-gray-400">
                            {item.brand}
                          </p>
                        )}
                        {item.pack_size && (
                          <p className="text-[10px] sm:text-xs text-gray-400">
                            {item.pack_size}
                          </p>
                        )}
                        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                          ₹{price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <p className="font-black text-gray-900 text-sm sm:text-base">
                          ₹{total.toFixed(2)}
                        </p>
                        {order.order_status === "delivered" &&
                          (reviewed.includes(item.medicine_id) ? (
                            <span className="text-[10px] sm:text-xs text-emerald-600 font-bold">
                              ✅ Reviewed
                            </span>
                          ) : (
                            <button
                              onClick={() => setReviewItem(item)}
                              className="text-[10px] sm:text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg hover:bg-amber-100 transition"
                            >
                              ⭐ Review
                            </button>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">
                📍 Delivery Address
              </h3>
              <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-gray-600">
                <p className="font-bold text-gray-900">{order.full_name}</p>
                {order.addr_phone && (
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">
                    {order.addr_phone}
                  </p>
                )}
                <p className="mt-1">
                  {order.address_line1}
                  {order.address_line2 ? `, ${order.address_line2}` : ""}
                </p>
                <p>
                  {order.city}, {order.state} — {order.pincode}
                </p>
              </div>
            </div>

            {history.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5">
                <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                  🕒 Order History
                </h3>
                <div className="space-y-2.5 sm:space-y-3">
                  {history.map((h, idx) => (
                    <div key={idx} className="flex items-start gap-2 sm:gap-3">
                      <div
                        className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                          idx === history.length - 1
                            ? "bg-emerald-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-800 capitalize">
                          {STATUS_CONFIG[h.status]?.icon}{" "}
                          {STATUS_CONFIG[h.status]?.label || h.status}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          {new Date(h.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="space-y-4 sm:space-y-5">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5">
              <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                💰 Price Details
              </h3>
              <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{parseFloat(order.subtotal || 0).toFixed(2)}</span>
                </div>
                {parseFloat(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount</span>
                    <span>
                      − ₹{parseFloat(order.discount_amount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span
                    className={
                      parseFloat(order.delivery_charge) === 0
                        ? "text-green-600 font-semibold"
                        : ""
                    }
                  >
                    {parseFloat(order.delivery_charge) === 0
                      ? "FREE 🎉"
                      : `₹${parseFloat(order.delivery_charge).toFixed(2)}`}
                  </span>
                </div>
                {parseFloat(order.tax_amount) > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>₹{parseFloat(order.tax_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2.5 sm:pt-3 flex justify-between font-black text-gray-900 text-sm sm:text-base">
                  <span>Total</span>
                  <span className="text-emerald-600">
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm sm:text-base">
                💳 Payment
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-bold text-gray-900 uppercase">
                    {order.payment_mode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] sm:text-xs capitalize ${
                      order.payment_status === "paid"
                        ? "bg-green-100 text-green-600"
                        : order.payment_status === "failed"
                          ? "bg-red-100 text-red-500"
                          : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                to="/orders"
                className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm border-2 border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition"
              >
                ← Back to Orders
              </Link>
              {order.order_status === "delivered" && (
                <Link
                  to="/medicines"
                  className="w-full flex items-center justify-center py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition"
                  style={{
                    background: "linear-gradient(135deg, #065f46, #059669)",
                  }}
                >
                  🔄 Reorder
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1">
              Cancel Order?
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 mb-4">
              This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                Reason (optional)
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 bg-gray-50"
              >
                <option value="">Select a reason...</option>
                <option value="Order placed by mistake">
                  Order placed by mistake
                </option>
                <option value="Better price available elsewhere">
                  Better price available
                </option>
                <option value="Delivery time is too long">
                  Delivery time too long
                </option>
                <option value="Product no longer needed">
                  Product not needed
                </option>
                <option value="Need to change delivery address">
                  Change address
                </option>
              </select>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowCancel(false);
                  setError("");
                }}
                className="flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition bg-red-500 hover:bg-red-600"
              >
                {cancelling ? "..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewItem && (
        <ReviewModal
          item={reviewItem}
          orderId={order.id}
          onClose={() => setReviewItem(null)}
          onSubmit={(medicine_id) => {
            setReviewed((prev) => [...prev, medicine_id]);
            setReviewItem(null);
          }}
        />
      )}
    </div>
  );
}
