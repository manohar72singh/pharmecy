import { useState, useEffect } from "react";
import api from "../../services/api";
import Pagination from "../../components/common/Pagination";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percent",
    discount_value: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/coupons?page=${page}&limit=${LIMIT}`,
      );
      setCoupons(data.data.coupons);
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

  const handleCreate = async () => {
    if (!form.code || !form.discount_value)
      return setError("Sab fields zaroori hain.");
    setSaving(true);
    try {
      await api.post("/admin/coupons", form);
      setShowForm(false);
      setForm({ code: "", discount_type: "percent", discount_value: "" });
      setError("");
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Create failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete karna chahte ho?")) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-bold"
          style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
        >
          + New Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">New Coupon</h3>
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">
              ⚠️ {error}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">
                Code *
              </label>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="SAVE20"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold tracking-widest focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">
                Type *
              </label>
              <select
                value={form.discount_type}
                onChange={(e) =>
                  setForm({ ...form, discount_type: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1 block">
                Value *
              </label>
              <input
                type="number"
                value={form.discount_value}
                onChange={(e) =>
                  setForm({ ...form, discount_value: e.target.value })
                }
                placeholder={form.discount_type === "percent" ? "10" : "50"}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-6 py-2 rounded-xl text-white text-sm font-bold"
              style={{
                background: saving
                  ? "#6ee7b7"
                  : "linear-gradient(135deg,#065f46,#059669)",
              }}
            >
              {saving ? "Saving..." : "Create Coupon"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Code", "Type", "Value", "Used", "Action"].map((h) => (
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
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-black text-gray-900 tracking-wider">
                        {c.code}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${c.discount_type === "flat" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}
                        >
                          {c.discount_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-600">
                        {c.discount_type === "flat"
                          ? `₹${c.discount_value}`
                          : `${c.discount_value}%`}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.used_count} times
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
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
