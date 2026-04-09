import { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "../../context/Toastcontext";

export default function Pincodes() {
  const { showToast } = useToast();
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPin, setNewPin] = useState({ pincode: "", city_name: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchPincodes();
  }, []);

  const fetchPincodes = async () => {
    try {
      const { data } = await api.get("/admin/pincodes");
      setPincodes(data.data || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load pincodes.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newPin.pincode) return;
    setAdding(true);
    try {
      await api.post("/admin/pincodes", newPin);
      showToast("Pincode added successfully! ✅", "success");
      setNewPin({ pincode: "", city_name: "" });
      fetchPincodes();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add pincode.", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/admin/pincodes/${id}/toggle`);
      fetchPincodes();
    } catch (err) {
      showToast("Failed to update status.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this pincode?")) return;
    try {
      await api.delete(`/admin/pincodes/${id}`);
      showToast("Pincode removed.", "success");
      fetchPincodes();
    } catch (err) {
      showToast("Failed to delete.", "error");
    }
  };

  if (loading) return <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">📍 Serviceable Pincodes</h1>
        <p className="text-sm text-gray-500 font-medium">Manage areas where you deliver medicines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Pincode Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-xl">➕</span> Add New Area
            </h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Pincode *</label>
                <input
                  type="text"
                  required
                  value={newPin.pincode}
                  onChange={(e) => setNewPin({ ...newPin, pincode: e.target.value })}
                  placeholder="e.g. 110001"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:border-emerald-400 focus:bg-white transition font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">City / Area Name</label>
                <input
                  type="text"
                  value={newPin.city_name}
                  onChange={(e) => setNewPin({ ...newPin, city_name: e.target.value })}
                  placeholder="e.g. New Delhi"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:border-emerald-400 focus:bg-white transition"
                />
              </div>
              <button
                type="submit"
                disabled={adding}
                className="w-full py-3.5 rounded-xl text-white font-black text-sm shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
              >
                {adding ? "Adding..." : "Add Pincode →"}
              </button>
            </form>
          </div>
        </div>

        {/* Pincode List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Active Pincodes</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                {pincodes.length} Total
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {pincodes.length === 0 ? (
                <div className="py-20 text-center text-gray-400 italic">No pincodes found. Add one to start delivering!</div>
              ) : (
                pincodes.map((p) => (
                  <div key={p.id} className="group flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${p.is_active ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                        {p.is_active ? '🚚' : '❌'}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg leading-none">{p.pincode}</p>
                        <p className="text-xs text-gray-400 mt-1 font-medium italic">{p.city_name || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggle(p.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase shadow-sm transition-all ${p.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
                      >
                        {p.is_active ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
