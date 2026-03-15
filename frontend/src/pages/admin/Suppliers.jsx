import { useState, useEffect } from "react";
import api from "../../services/api";
import Pagination from "../../components/common/Pagination";

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gst_number: "",
  });
  const [saving, setSaving] = useState(false);
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/suppliers?page=${page}&limit=${LIMIT}&search=${search}`,
      );
      setSuppliers(data.data.suppliers);
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await api.post("/admin/suppliers", form);
      setShowForm(false);
      setForm({ name: "", email: "", phone: "", address: "", gst_number: "" });
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete karna chahte ho?")) return;
    try {
      await api.delete(`/admin/suppliers/${id}`);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search supplier..."
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 bg-white"
          />
          <button
            className="px-4 py-2 rounded-xl text-white text-sm font-bold"
            style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
          >
            Search
          </button>
        </form>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
        >
          + Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">New Supplier</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "name", label: "Name *", placeholder: "Supplier name" },
              { key: "phone", label: "Phone", placeholder: "9999999999" },
              {
                key: "email",
                label: "Email",
                placeholder: "supplier@email.com",
              },
              {
                key: "gst_number",
                label: "GST Number",
                placeholder: "22AAAAA0000A1Z5",
              },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-bold text-gray-600 mb-1 block">
                  {f.label}
                </label>
                <input
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-600 mb-1 block">
                Address
              </label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Full address"
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
              {saving ? "Saving..." : "Add Supplier"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Supplier", "Phone", "Email", "GST", "Batches", "Action"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : suppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {s.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {s.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500">
                        {s.gst_number || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {s.batch_count}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(s.id)}
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
