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
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await api.delete(`/admin/suppliers/${id}`);
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Action Bar */}
      <div className="flex items-center gap-3 shadow-sm p-1 rounded-2xl bg-gray-50/50">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by supplier name or GST..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 bg-white transition-all"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-xl text-white text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
          >
            Search
          </button>
        </form>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-bold flex-shrink-0 shadow-md hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg,#065f46,#059669)" }}
        >
          {showForm ? "✕ Close" : "+ Add New Supplier"}
        </button>
      </div>

      {/* Entry Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span>📝</span> Registration Form
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                key: "name",
                label: "Business Name *",
                placeholder: "e.g. Apollo Pharmacy Ltd",
              },
              {
                key: "phone",
                label: "Contact Number",
                placeholder: "e.g. 9876543210",
              },
              {
                key: "email",
                label: "Email Address",
                placeholder: "e.g. contact@supplier.com",
              },
              {
                key: "gst_number",
                label: "Tax ID / GSTIN",
                placeholder: "e.g. 22AAAAA0000A1Z5",
              },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block">
                  {f.label}
                </label>
                <input
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm({ ...form, [f.key]: e.target.value })
                  }
                  placeholder={f.placeholder}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 block">
                Office / Warehouse Address
              </label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Complete street address, city, state"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-8 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm"
              style={{
                background: saving
                  ? "#6ee7b7"
                  : "linear-gradient(135deg,#065f46,#059669)",
              }}
            >
              {saving ? "Saving..." : "Save Supplier Details"}
            </button>
          </div>
        </div>
      )}

      {/* Supplier Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "Business Entity",
                  "Phone",
                  "Email",
                  "GSTIN",
                  "Total Batches",
                  "Management",
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
                ? [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : suppliers.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900 leading-tight">
                          {s.name}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          ID: SUP-{s.id}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-medium">
                        {s.phone || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs italic">
                        {s.email || "No email"}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 uppercase">
                        {s.gst_number || "Unregistered"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-100">
                          {s.batch_count} Batches
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-[10px] uppercase font-black px-3 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!loading && suppliers.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            No supplier records found in the directory.
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
