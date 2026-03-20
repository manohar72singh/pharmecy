import { useState, useEffect } from "react";
import api from "../../services/api";
import Pagination from "../../components/common/Pagination";

const STATUS_OPTIONS = [
  "placed",
  "confirmed",
  "processing",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];
const STATUS_COLORS = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-purple-100 text-purple-700",
  processing: "bg-cyan-100 text-cyan-700",
  packed: "bg-orange-100 text-orange-700",
  out_for_delivery: "bg-teal-100 text-teal-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/orders?page=${page}&limit=${LIMIT}&search=${search}&status=${status}`,
      );
      setOrders(data.data.orders);
      setTotal(data.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, order_status: newStatus } : o,
        ),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex gap-2 flex-1 min-w-[300px]"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, Customer Name, or Phone..."
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:bg-white transition-all"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
          >
            Search
          </button>
        </form>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 bg-white cursor-pointer"
        >
          <option value="">Filter by Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "Order Ref",
                  "Customer Details",
                  "Items Count",
                  "Total Amount",
                  "Payment Summary",
                  "Current Status",
                  "Update Progress",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"
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
                      <td colSpan={7} className="px-4 py-4">
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
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
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
                      <td className="px-4 py-3 text-gray-600 font-medium">
                        {order.item_count}{" "}
                        {order.item_count > 1 ? "Items" : "Item"}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        ₹{parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                          {order.payment_mode}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase ${order.payment_status === "paid" ? "text-green-600" : "text-amber-600"}`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${STATUS_COLORS[order.order_status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {order.order_status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.order_status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value)
                          }
                          disabled={
                            updating === order.id ||
                            order.order_status === "delivered" ||
                            order.order_status === "cancelled"
                          }
                          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-400 bg-white disabled:opacity-50 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s.replace(/_/g, " ").toUpperCase()}
                            </option>
                          ))}
                        </select>
                        {updating === order.id && (
                          <span className="ml-2 text-[10px] text-gray-400 italic">
                            Updating...
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!loading && orders.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No records found matching your criteria.
          </div>
        )}
        <div className="px-4 py-4 border-t border-gray-50 bg-gray-50/30">
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
