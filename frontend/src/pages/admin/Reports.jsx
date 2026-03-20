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
      {/* Date Range Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 flex-wrap shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-black uppercase text-gray-500 tracking-wider">
            From:
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 bg-gray-50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-black uppercase text-gray-500 tracking-wider">
            To:
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 bg-gray-50 transition-all"
          />
        </div>
        <button
          onClick={load}
          className="px-6 py-2 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
        >
          Generate Report
        </button>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `₹${parseFloat(data?.summary?.revenue || 0).toLocaleString("en-IN")}`,
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
            label: "Successful Deliveries",
            value: data?.summary?.delivered || 0,
            icon: "✅",
            color: "text-green-600",
          },
          {
            label: "Order Cancellations",
            value: data?.summary?.cancelled || 0,
            icon: "❌",
            color: "text-red-500",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                  {s.label}
                </p>
                <p className={`text-2xl font-black mt-1 ${s.color}`}>
                  {s.value}
                </p>
              </div>
              <span className="text-3xl opacity-80">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Medicines */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              🏆 Best Selling Products
            </h3>
            <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
              {data?.top_medicines?.length || 0} Products
            </span>
          </div>
          <div className="divide-y divide-gray-50 min-h-[300px]">
            {(data?.top_medicines || [])
              .slice((medPage - 1) * MED_PER_PAGE, medPage * MED_PER_PAGE)
              .map((m, i) => {
                const globalIdx = (medPage - 1) * MED_PER_PAGE + i;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 ${
                        globalIdx === 0
                          ? "bg-amber-400 shadow-sm"
                          : globalIdx === 1
                            ? "bg-gray-400 shadow-sm"
                            : globalIdx === 2
                              ? "bg-orange-400 shadow-sm"
                              : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {globalIdx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {m.name}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">
                        {m.brand}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-emerald-600">
                        {m.sold} Units
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        ₹{parseFloat(m.revenue).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                );
              })}
            {(data?.top_medicines || []).length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic text-sm">
                No sales data available for this period.
              </div>
            )}
          </div>

          {/* Internal Pagination */}
          {(data?.top_medicines || []).length > MED_PER_PAGE && (
            <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Showing {(medPage - 1) * MED_PER_PAGE + 1}–
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
                  className="w-8 h-8 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition-all flex items-center justify-center shadow-sm"
                >
                  ←
                </button>
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
                  className="w-8 h-8 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 transition-all flex items-center justify-center shadow-sm"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Revenue contribution by Category */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              📂 Revenue by Category
            </h3>
          </div>
          <div className="divide-y divide-gray-50 p-2">
            {(data?.category_revenue || []).map((c, i) => {
              const maxRevenue = Math.max(
                ...(data?.category_revenue || []).map((x) =>
                  parseFloat(x.revenue),
                ),
              );
              const pct =
                maxRevenue > 0 ? (parseFloat(c.revenue) / maxRevenue) * 100 : 0;
              return (
                <div
                  key={i}
                  className="px-3 py-4 hover:bg-gray-50/50 rounded-xl transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-gray-900">
                      {c.category}
                    </p>
                    <p className="text-sm font-black text-emerald-600">
                      ₹{parseFloat(c.revenue).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full shadow-inner"
                      style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg,#065f46,#10b981)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter italic">
                      {c.sold} units sold
                    </p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {Math.round(pct)}% of Peak
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            📅 Daily Revenue Overview
          </h3>
          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">
            Last 30 Active Days
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Date", "Total Orders", "Net Revenue"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.daily_revenue || []).map((d, i) => (
                <tr
                  key={i}
                  className="hover:bg-emerald-50/30 transition-colors"
                >
                  <td className="px-5 py-4 font-bold text-gray-800">
                    {new Date(d.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-gray-600 font-medium">
                    {d.orders} Orders
                  </td>
                  <td className="px-5 py-4 font-black text-emerald-600">
                    ₹{parseFloat(d.revenue).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
              {(data?.daily_revenue || []).length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-12 text-center text-gray-400 italic text-sm"
                  >
                    No transaction history found for the selected period.
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
