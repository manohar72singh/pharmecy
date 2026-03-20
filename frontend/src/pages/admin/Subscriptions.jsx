import { useState, useEffect } from "react";
import api from "../../services/api";
import Pagination from "../../components/common/Pagination";

const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",
  paused: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/subscriptions?page=${page}&limit=${LIMIT}&status=${status}`,
      );
      setSubs(data.data.subscriptions);
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

  return (
    <div className="space-y-4">
      {/* ── Status Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 shadow-sm">
        {["", "active", "paused", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize ${
              status === s
                ? "text-white shadow-md"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            style={
              status === s
                ? { background: "linear-gradient(135deg,#065f46,#059669)" }
                : {}
            }
          >
            {s || "All Subscriptions"}
          </button>
        ))}
      </div>

      {/* ── Subscriptions Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "ID",
                  "Customer Details",
                  "Plan Type",
                  "Next Scheduled Delivery",
                  "Location",
                  "Current Status",
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
                      <td colSpan={6} className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : subs.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-gray-900">
                        #{s.id}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">
                          {s.user_name}
                        </p>
                        <p className="text-xs text-gray-400">{s.user_phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">{s.plan_name}</p>
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">
                          {s.discount_percent}% Loyalty Discount
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-600">
                        {s.next_delivery_date
                          ? new Date(s.next_delivery_date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 uppercase font-bold">
                        {s.city}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${STATUS_COLORS[s.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!loading && subs.length === 0 && (
          <div className="text-center py-12 text-gray-400 italic">
            No subscription records found for the selected filter.
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
