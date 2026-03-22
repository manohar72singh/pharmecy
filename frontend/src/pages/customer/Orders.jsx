import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import orderService from "../../services/orderService";

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

const PAYMENT_ICONS = { cod: "💵", online: "💳", upi: "📱", wallet: "👛" };

const FILTERS = [
  { key: "all", label: "All Orders" },
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "out_for_delivery", label: "On the Way" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
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
      className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold ${cfg.bg} ${cfg.color}`}
    >
      <span className="flex-shrink-0">{cfg.icon}</span>
      <span className="whitespace-nowrap">{cfg.label}</span>
    </span>
  );
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await orderService.getMyOrders();
        setOrders(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.order_status === filter);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your orders...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-emerald-600 transition">
              Home
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">My Orders</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {orders.length} total {orders.length === 1 ? "order" : "orders"}
            </p>
          </div>
          <Link
            to="/medicines"
            className="text-xs sm:text-sm font-bold text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
          >
            + New Order
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                filter === f.key
                  ? "text-white border-transparent shadow-lg"
                  : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
              }`}
              style={
                filter === f.key
                  ? { background: "linear-gradient(135deg, #065f46, #059669)" }
                  : {}
              }
            >
              {f.label}
              {f.key === "all" && orders.length > 0 && (
                <span className="ml-1.5 text-xs opacity-75">
                  ({orders.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="text-6xl sm:text-7xl mb-4">📦</div>
            <h3 className="text-base sm:text-lg font-black text-gray-800 mb-2">
              {filter === "all"
                ? "No orders found yet"
                : `No ${STATUS_CONFIG[filter]?.label || filter} orders found`}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 max-w-md mx-auto">
              {filter === "all"
                ? "Start your healthcare journey by placing your first order!"
                : "There are no orders in this category at the moment."}
            </p>
            {filter === "all" && (
              <Link
                to="/medicines"
                className="inline-block text-white font-bold px-6 py-3 rounded-xl sm:rounded-2xl text-sm"
                style={{
                  background: "linear-gradient(135deg, #065f46, #059669)",
                }}
              >
                Browse Medicines →
              </Link>
            )}
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-3 sm:space-y-4">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all overflow-hidden"
            >
              {/* Order Header */}
              <div className="px-3 sm:px-5 py-3 sm:py-4 flex items-start sm:items-center justify-between gap-3 border-b border-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-0 sm:block">
                    <p className="font-black text-gray-900 text-xs sm:text-sm">
                      #{order.order_number}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 sm:mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={order.order_status} />
                </div>
                <Link
                  to={`/orders/${order.id}`}
                  className="text-[10px] sm:text-xs font-bold text-emerald-600 hover:text-emerald-700 transition whitespace-nowrap flex-shrink-0"
                >
                  Details →
                </Link>
              </div>

              {/* Order Body */}
              <div className="px-3 sm:px-5 py-3 sm:py-4">
                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6 mb-3 sm:mb-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl flex-shrink-0">
                      🛍️
                    </span>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        Items
                      </p>
                      <p className="font-bold text-gray-900 text-xs sm:text-sm">
                        {order.item_count}{" "}
                        <span className="hidden sm:inline">
                          {order.item_count > 1 ? "medicines" : "medicine"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl flex-shrink-0">
                      {PAYMENT_ICONS[order.payment_mode] || "💳"}
                    </span>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        Payment
                      </p>
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-gray-900 text-xs sm:text-sm uppercase">
                          {order.payment_mode}
                        </p>
                        <span
                          className={`text-[8px] sm:text-[10px] uppercase font-bold px-1 sm:px-1.5 py-0.5 rounded-full ${
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

                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      Total Amount
                    </p>
                    <p className="font-black text-lg sm:text-xl text-emerald-600">
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3 sm:mt-4">
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition text-center"
                  >
                    View Details
                  </Link>
                  {order.order_status === "delivered" && (
                    <Link
                      to="/medicines"
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-white transition text-center"
                      style={{
                        background: "linear-gradient(135deg, #065f46, #059669)",
                      }}
                    >
                      Reorder
                    </Link>
                  )}
                </div>
              </div>

              {/* Status Banners */}
              {order.order_status === "delivered" && (
                <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-green-50 border-t border-green-100 text-[10px] sm:text-xs font-semibold text-green-700">
                  🎉 Order delivered successfully!
                </div>
              )}
              {order.order_status === "out_for_delivery" && (
                <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-emerald-50 border-t border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                  <p className="text-[10px] sm:text-xs font-semibold text-emerald-700">
                    🚴 Our delivery partner is on the way and will reach you
                    shortly!
                  </p>
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-[10px] sm:text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition whitespace-nowrap"
                  >
                    🔐 View OTP →
                  </Link>
                </div>
              )}
              {order.order_status === "cancelled" && (
                <div className="px-3 sm:px-5 py-2 sm:py-2.5 bg-red-50 border-t border-red-100 text-[10px] sm:text-xs font-semibold text-red-600">
                  ❌ This order has been cancelled.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
