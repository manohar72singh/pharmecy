import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import deliveryService from "../../services/deliveryService";

const PAYMENT_ICONS = { cod: "💵", online: "💳", upi: "📱", wallet: "👛" };

export default function DeliveryOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await deliveryService.getAssignedOrders(page);
        setOrders(data.data?.orders || []);
        setTotalPages(
          Math.ceil((data.data?.total || 0) / (data.data?.limit || 15)),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Orders load ho rahi hain...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/delivery" className="hover:text-emerald-600 transition">
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">Assigned Orders</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              📋 Assigned Orders
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {orders.length} pending deliveries
            </p>
          </div>
        </div>

        {/* Empty */}
        {orders.length === 0 && (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">✅</div>
            <h3 className="text-lg font-black text-gray-800 mb-2">
              Koi pending order nahi!
            </h3>
            <p className="text-gray-400 text-sm">
              Abhi koi order assign nahi hua hai.
            </p>
            <Link
              to="/delivery"
              className="inline-block mt-4 text-white font-bold px-6 py-3 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #065f46, #059669)",
              }}
            >
              Dashboard pe Jao
            </Link>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all overflow-hidden"
            >
              {/* Order Header */}
              <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap border-b border-gray-50">
                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <p className="font-black text-gray-900 text-sm">
                      #{order.order_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.assigned_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600">
                    🚴 Out for Delivery
                  </span>
                </div>
                <Link
                  to={`/delivery/orders/${order.id}`}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
                >
                  Details →
                </Link>
              </div>

              {/* Order Body */}
              <div className="px-5 py-4">
                {/* Customer Info */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg flex-shrink-0">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">
                      {order.user_name}
                    </p>
                    <p className="text-xs text-gray-400">{order.user_phone}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {order.address_line1}
                      {order.address_line2 ? `, ${order.address_line2}` : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.city}, {order.state} — {order.pincode}
                    </p>
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {PAYMENT_ICONS[order.payment_mode] || "💳"}
                      </span>
                      <div>
                        <p className="text-xs text-gray-400">Payment</p>
                        <p className="font-bold text-gray-900 text-sm uppercase">
                          {order.payment_mode}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Items</p>
                      <p className="font-bold text-gray-900 text-sm">
                        {order.item_count} medicines
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-black text-xl text-emerald-600">
                        ₹{parseFloat(order.total_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/delivery/orders/${order.id}`}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-transform active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #065f46, #059669)",
                    }}
                  >
                    🚴 Deliver Now
                  </Link>
                </div>
              </div>

              {/* COD Banner */}
              {order.payment_mode === "cod" && (
                <div className="px-5 py-2.5 bg-amber-50 border-t border-amber-100 text-xs font-semibold text-amber-700">
                  💵 Cash on Delivery — ₹
                  {parseFloat(order.total_amount).toFixed(2)} collect karna hai
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 transition"
            >
              ← Pehle
            </button>
            <span className="text-sm font-bold text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 transition"
            >
              Aage →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
