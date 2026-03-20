import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import deliveryService from "../../services/deliveryService";
import Pagination from "../../components/common/Pagination";

const PAYMENT_ICONS = { cod: "💵", online: "💳", upi: "📱", wallet: "👛" };
const PAYMENT_COLORS = {
  cod: "bg-amber-50 text-amber-700",
  online: "bg-blue-50 text-blue-700",
  upi: "bg-purple-50 text-purple-700",
  wallet: "bg-emerald-50 text-emerald-700",
};

export default function DeliveryOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await deliveryService.getAssignedOrders(page);
        setOrders(data.data?.orders || []);
        setTotal(data.data?.total || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  return (
    <div>
      {/* Header */}
      <div
        className="rounded-3xl p-5 mb-5 shadow-md"
        style={{ background: "linear-gradient(135deg,#064e3b,#065f46)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-xl">
              📦 Assigned Orders
            </h1>
            <p className="text-emerald-300 text-xs mt-0.5 font-medium">
              {total} pending deliveries
            </p>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            🚴
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 text-center py-20 shadow-sm">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-lg font-black text-gray-800 mb-2">
            Sab clear hai!
          </h3>
          <p className="text-gray-400 text-sm">
            Abhi koi order assign nahi hua.
          </p>
          <Link
            to="/delivery"
            className="inline-block mt-4 text-white font-bold px-6 py-3 rounded-2xl text-sm"
            style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
          >
            Dashboard pe Jao
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Top */}
                <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
                      }}
                    >
                      📦
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">
                        #{order.order_number}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.assigned_at).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short" },
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                    🚴 Out for Delivery
                  </span>
                </div>

                {/* Customer */}
                <div className="mx-5 mb-3 p-3 rounded-2xl bg-gray-50">
                  <div className="flex items-start gap-2">
                    <span className="text-base">👤</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">
                        {order.user_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.user_phone}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        📍 {order.address_line1}, {order.city} — {order.pincode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom */}
                <div className="px-5 pb-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${PAYMENT_COLORS[order.payment_mode] || "bg-gray-100 text-gray-600"}`}
                    >
                      {PAYMENT_ICONS[order.payment_mode]}{" "}
                      {order.payment_mode.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold">
                      {order.item_count} items
                    </span>
                    <span className="font-black text-emerald-600 text-lg">
                      ₹{parseFloat(order.total_amount).toFixed(0)}
                    </span>
                  </div>
                  <Link
                    to={`/delivery/orders/${order.id}`}
                    className="px-5 py-2.5 rounded-2xl text-sm font-black text-white shadow-md transition-transform active:scale-95"
                    style={{
                      background: "linear-gradient(135deg,#065f46,#059669)",
                    }}
                  >
                    🚴 Deliver Now
                  </Link>
                </div>

                {order.payment_mode === "cod" && (
                  <div className="mx-5 mb-4 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-xs font-semibold text-amber-700">
                    💵 Cash collect karna hai — ₹
                    {parseFloat(order.total_amount).toFixed(0)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Pagination
              page={page}
              total={total}
              limit={LIMIT}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
