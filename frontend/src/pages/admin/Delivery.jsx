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
  const [otpMap, setOtpMap] = useState({}); // order_id → otp
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
      const { data } = await api.post(`/admin/delivery/${orderId}/assign`, {
        delivery_boy_id: deliveryBoyId,
      });

      const otp = data.data?.delivery_otp;
      const boyName = data.data?.delivery_boy_name;

      setOtpMap((prev) => ({ ...prev, [orderId]: otp }));
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                order_status: "out_for_delivery",
                delivery_boy_id: deliveryBoyId,
                delivery_boy_name: boyName,
                delivery_otp: otp,
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

  // Online/Offline counts
  const onlineCount = deliveryBoys.filter((d) => d.is_available).length;
  const offlineCount = deliveryBoys.filter((d) => !d.is_available).length;

  return (
    <div className="space-y-4">
      {/* ── Delivery Personnel Status ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
            🟢
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600">
              {onlineCount}
            </p>
            <p className="text-xs text-gray-400">Available Now</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-xl">
            🔴
          </div>
          <div>
            <p className="text-2xl font-black text-red-500">{offlineCount}</p>
            <p className="text-xs text-gray-400">Offline</p>
          </div>
        </div>

        <div className="sm:col-span-2 bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-500 mb-2">
            Delivery Fleet Status
          </p>
          <div className="flex flex-wrap gap-2">
            {deliveryBoys.map((db) => (
              <span
                key={db.id}
                className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                  db.is_available
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${db.is_available ? "bg-emerald-500" : "bg-gray-400"}`}
                />
                {db.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Dispatch Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "Order Details",
                  "Customer Info",
                  "Delivery Address",
                  "Amount",
                  "Status",
                  "Dispatch Assignment",
                  "Security OTP",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider"
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
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">
                          #{order.order_number}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                            { day: "2-digit", month: "short", year: "numeric" },
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
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px]">
                        <p className="truncate">{order.address_line1}</p>
                        <p className="text-gray-400">
                          {order.city} - {order.pincode}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        ₹{parseFloat(order.total_amount).toFixed(0)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${STATUS_COLORS[order.order_status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {order.order_status?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {order.delivery_boy_name ? (
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg flex items-center gap-1 w-fit">
                              🚴 {order.delivery_boy_name}
                            </span>
                            <select
                              defaultValue=""
                              onChange={(e) =>
                                handleAssign(order.id, e.target.value)
                              }
                              disabled={assigning === order.id}
                              className="text-[10px] px-2 py-1 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-400 text-gray-500 cursor-pointer bg-white"
                            >
                              <option value="" disabled>
                                Re-assign Driver...
                              </option>
                              {deliveryBoys.map((db) => (
                                <option key={db.id} value={db.id}>
                                  {db.is_available ? "🟢" : "🔴"} {db.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <select
                            defaultValue=""
                            onChange={(e) =>
                              handleAssign(order.id, e.target.value)
                            }
                            disabled={assigning === order.id}
                            className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-400 bg-white cursor-pointer"
                          >
                            <option value="" disabled>
                              Assign Personnel...
                            </option>
                            {deliveryBoys.map((db) => (
                              <option key={db.id} value={db.id}>
                                {db.is_available ? "🟢" : "🔴"} {db.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {otpMap[order.id] || order.delivery_otp ? (
                          <span className="text-xs font-black px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 tracking-widest">
                            🔐 {otpMap[order.id] || order.delivery_otp}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                        {assigning === order.id && (
                          <span className="text-[10px] text-gray-400 ml-1 italic">
                            Updating...
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              {!loading && orders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No pending deliveries found.
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
