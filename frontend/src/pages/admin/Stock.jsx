import { useState, useEffect } from "react";
import api from "../../services/api";
import Pagination from "../../components/common/Pagination";

export default function AdminStock() {
  const [stock, setStock] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [newQty, setNewQty] = useState("");
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/stock?page=${page}&limit=${LIMIT}&search=${search}&low_stock=${lowOnly}`,
      );
      setStock(data.data.stock);
      setTotal(data.data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, lowOnly]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/admin/stock/${id}`, {
        available_quantity: parseInt(newQty),
      });
      setStock((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, available_quantity: parseInt(newQty) } : s,
        ),
      );
      setEditing(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="flex gap-2 flex-1 min-w-[300px]"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by medicine name or batch ID..."
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
        <button
          onClick={() => {
            setLowOnly(!lowOnly);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border-2 ${
            lowOnly
              ? "bg-red-500 text-white border-red-500 shadow-md"
              : "bg-red-50 text-red-500 border-red-100 hover:bg-red-100"
          }`}
        >
          <span>⚠️</span> Low Stock Alerts
        </button>
      </div>

      {/* Stock Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "Product Info",
                  "Batch Reference",
                  "Supplier Source",
                  "Current Qty",
                  "Selling Price",
                  "Expiration Status",
                  "Actions",
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
                : stock.map((item) => {
                    const isLow = item.available_quantity <= 10;
                    const isExpiring =
                      item.expiry_date &&
                      new Date(item.expiry_date) <
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 transition-colors ${isLow ? "bg-red-50/30" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900">
                            {item.medicine_name}
                          </p>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">
                            {item.brand}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-600">
                          {item.batch_no}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                          {item.supplier_name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {editing === item.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                autoFocus
                                value={newQty}
                                onChange={(e) => setNewQty(e.target.value)}
                                className="w-20 px-2 py-1 rounded-lg border-2 border-emerald-400 text-sm focus:outline-none bg-white"
                              />
                              <button
                                onClick={() => handleUpdate(item.id)}
                                className="text-xs font-black px-2 py-1 rounded-lg bg-emerald-500 text-white shadow-sm"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setEditing(null)}
                                className="text-xs font-black px-2 py-1 rounded-lg bg-gray-100 text-gray-400"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`text-sm font-black flex items-center gap-1 ${isLow ? "text-red-500" : "text-gray-900"}`}
                            >
                              {isLow && "⚠️ "}
                              {item.available_quantity}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-600">
                          ₹{parseFloat(item.selling_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] uppercase font-black px-2 py-1 rounded-lg ${isExpiring ? "bg-red-100 text-red-600 shadow-sm" : "bg-gray-100 text-gray-500"}`}
                          >
                            {isExpiring && "⚠️ "}
                            {item.expiry_date
                              ? new Date(item.expiry_date).toLocaleDateString(
                                  "en-IN",
                                  { month: "short", year: "numeric" },
                                )
                              : "No Expiry"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setEditing(item.id);
                              setNewQty(item.available_quantity);
                            }}
                            className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all"
                          >
                            Quick Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        {!loading && stock.length === 0 && (
          <div className="text-center py-16 text-gray-400 italic">
            No stock records found matching your current filters.
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
