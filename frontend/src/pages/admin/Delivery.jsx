import { useState, useEffect } from "react";
import api from "../../services/api";
import Pagination from "../../components/common/Pagination";

const STATUS_COLORS = {
  confirmed: "bg-purple-100 text-purple-700",
  processing: "bg-cyan-100 text-cyan-700",
  packed: "bg-orange-100 text-orange-700",
  out_for_delivery: "bg-teal-100 text-teal-700",
};

export default function AdminDelivery() {
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/delivery?page=${page}&limit=${LIMIT}`,
      );
      setOrders(data.data.orders);
      setDeliveryBoys(data.data.delivery_boys || []);
      setTotal(data.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const handleAssign = async (orderId, deliveryBoyId) => {
    if (!deliveryBoyId) return;
    setAssigning(orderId);
    try {
      await api.post(`/admin/delivery/${orderId}/assign`, {
        delivery_boy_id: deliveryBoyId,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                order_status: "out_for_delivery",
                delivery_boy_id: deliveryBoyId,
              }
            : o,
        ),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setAssigning(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "Order",
                  "Customer",
                  "Address",
                  "Amount",
                  "Status",
                  "Assign Delivery",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">
                          #{order.order_number}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">
                          {order.user_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.user_phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {order.address_line1}, {order.city} - {order.pincode}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        ₹{parseFloat(order.total_amount).toFixed(0)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[order.order_status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.delivery_boy_name ? (
                          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg">
                            🚴 {order.delivery_boy_name}
                          </span>
                        ) : (
                          <select
                            defaultValue=""
                            onChange={(e) =>
                              handleAssign(order.id, e.target.value)
                            }
                            disabled={assigning === order.id}
                            className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-400"
                          >
                            <option value="" disabled>
                              Assign boy...
                            </option>
                            {deliveryBoys.map((db) => (
                              <option key={db.id} value={db.id}>
                                {db.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {assigning === order.id && "Assigning..."}
                      </td>
                    </tr>
                  ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    Koi pending delivery nahi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-4">
          <Pagination
            page={page}
            total={total}
            limit={LIMIT}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
