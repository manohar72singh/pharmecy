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
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicine, batch..."
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
          />
          <button
            className="px-4 py-2 rounded-xl text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
          >
            Search
          </button>
        </form>
        <button
          onClick={() => {
            setLowOnly(!lowOnly);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition ${lowOnly ? "bg-red-500 text-white" : "bg-red-50 text-red-500 hover:bg-red-100"}`}
        >
          ⚠️ Low Stock Only
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "Medicine",
                  "Batch No",
                  "Supplier",
                  "Qty",
                  "Price",
                  "Expiry",
                  "Action",
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
                : stock.map((item) => {
                    const isLow = item.available_quantity <= 10;
                    const isExpiring =
                      item.expiry_date &&
                      new Date(item.expiry_date) <
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 ${isLow ? "bg-red-50/30" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">
                            {item.medicine_name}
                          </p>
                          <p className="text-xs text-gray-400">{item.brand}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-600">
                          {item.batch_no}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {item.supplier_name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {editing === item.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={newQty}
                                onChange={(e) => setNewQty(e.target.value)}
                                className="w-20 px-2 py-1 rounded-lg border border-emerald-400 text-sm focus:outline-none"
                              />
                              <button
                                onClick={() => handleUpdate(item.id)}
                                className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500 text-white"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setEditing(null)}
                                className="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-600"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`font-bold ${isLow ? "text-red-500" : "text-gray-900"}`}
                            >
                              {isLow && "⚠️ "}
                              {item.available_quantity}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-600">
                          ₹{parseFloat(item.selling_price).toFixed(0)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs ${isExpiring ? "text-red-500 font-bold" : "text-gray-500"}`}
                          >
                            {isExpiring && "⚠️ "}
                            {item.expiry_date
                              ? new Date(item.expiry_date).toLocaleDateString(
                                  "en-IN",
                                  { month: "short", year: "numeric" },
                                )
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setEditing(item.id);
                              setNewQty(item.available_quantity);
                            }}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
