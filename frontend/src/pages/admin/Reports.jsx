import { useState, useEffect } from "react";
import api from "../../services/api";

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [medPage, setMedPage] = useState(1);
  const MED_PER_PAGE = 5;

  const load = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get(
        `/admin/reports?from=${from}&to=${to}`,
      );
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-gray-600">From:</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-gray-600">To:</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
          />
        </div>
        <button
          onClick={load}
          className="px-4 py-2 rounded-xl text-white text-sm font-bold"
          style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
        >
          Apply Filter
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `₹${parseFloat(data?.summary?.revenue || 0).toFixed(0)}`,
            icon: "💰",
            color: "text-emerald-600",
          },
          {
            label: "Total Orders",
            value: data?.summary?.orders || 0,
            icon: "📦",
            color: "text-blue-600",
          },
          {
            label: "Delivered",
            value: data?.summary?.delivered || 0,
            icon: "✅",
            color: "text-green-600",
          },
          {
            label: "Cancelled",
            value: data?.summary?.cancelled || 0,
            icon: "❌",
            color: "text-red-500",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold">{s.label}</p>
                <p className={`text-3xl font-black mt-1 ${s.color}`}>
                  {s.value}
                </p>
              </div>
              <span className="text-3xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Medicines — Paginated */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">
              🏆 Top Selling Medicines
            </h3>
            <span className="text-xs text-gray-400">
              {(data?.top_medicines || []).length} total
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {(data?.top_medicines || [])
              .slice((medPage - 1) * MED_PER_PAGE, medPage * MED_PER_PAGE)
              .map((m, i) => {
                const globalIdx = (medPage - 1) * MED_PER_PAGE + i;
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 ${
                        globalIdx === 0
                          ? "bg-amber-400"
                          : globalIdx === 1
                            ? "bg-gray-400"
                            : globalIdx === 2
                              ? "bg-orange-400"
                              : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {globalIdx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {m.name}
                      </p>
                      <p className="text-xs text-gray-400">{m.brand}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-emerald-600">
                        {m.sold} sold
                      </p>
                      <p className="text-xs text-gray-400">
                        ₹{parseFloat(m.revenue).toFixed(0)}
                      </p>
                    </div>
                  </div>
                );
              })}
            {(data?.top_medicines || []).length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm">No data</p>
            )}
          </div>
          {/* Pagination */}
          {(data?.top_medicines || []).length > MED_PER_PAGE && (
            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {(medPage - 1) * MED_PER_PAGE + 1}–
                {Math.min(
                  medPage * MED_PER_PAGE,
                  (data?.top_medicines || []).length,
                )}{" "}
                of {(data?.top_medicines || []).length}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setMedPage((p) => Math.max(1, p - 1))}
                  disabled={medPage === 1}
                  className="px-3 py-1 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  ←
                </button>
                {Array.from(
                  {
                    length: Math.ceil(
                      (data?.top_medicines || []).length / MED_PER_PAGE,
                    ),
                  },
                  (_, i) => (
                    <button
                      key={i}
                      onClick={() => setMedPage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition ${medPage === i + 1 ? "text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                      style={
                        medPage === i + 1
                          ? {
                              background:
                                "linear-gradient(135deg,#065f46,#059669)",
                            }
                          : {}
                      }
                    >
                      {i + 1}
                    </button>
                  ),
                )}
                <button
                  onClick={() =>
                    setMedPage((p) =>
                      Math.min(
                        Math.ceil(
                          (data?.top_medicines || []).length / MED_PER_PAGE,
                        ),
                        p + 1,
                      ),
                    )
                  }
                  disabled={
                    medPage ===
                    Math.ceil((data?.top_medicines || []).length / MED_PER_PAGE)
                  }
                  className="px-3 py-1 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category Revenue */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">📂 Category Revenue</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {(data?.category_revenue || []).map((c, i) => {
              const maxRevenue = Math.max(
                ...(data?.category_revenue || []).map((x) =>
                  parseFloat(x.revenue),
                ),
              );
              const pct =
                maxRevenue > 0 ? (parseFloat(c.revenue) / maxRevenue) * 100 : 0;
              return (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {c.category}
                    </p>
                    <p className="text-sm font-bold text-emerald-600">
                      ₹{parseFloat(c.revenue).toFixed(0)}
                    </p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(135deg,#065f46,#059669)",
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {c.sold} units sold
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Revenue Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900">
            📅 Daily Revenue (Last 30 days)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Date", "Orders", "Revenue"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.daily_revenue || []).map((d, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    {new Date(d.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{d.orders}</td>
                  <td className="px-5 py-3 font-bold text-emerald-600">
                    ₹{parseFloat(d.revenue).toFixed(0)}
                  </td>
                </tr>
              ))}
              {(data?.daily_revenue || []).length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-gray-400"
                  >
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
