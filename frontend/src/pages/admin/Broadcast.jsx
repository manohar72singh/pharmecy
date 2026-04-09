import { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/Toastcontext";

export default function Broadcast() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    target: "all", // "all" or "specific"
    userId: "",
    title: "",
    message: "",
    type: "general",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      return showToast("Please fill in all required fields.", "error");
    }
    if (form.target === "specific" && !form.userId) {
      return showToast("Please enter a User ID.", "error");
    }

    setLoading(true);
    try {
      const endpoint = form.target === "all" 
        ? "/admin/notifications/broadcast" 
        : "/admin/notifications/direct";
      
      const payload = form.target === "all" 
        ? { title: form.title, message: form.message, type: form.type }
        : { userId: form.userId, title: form.title, message: form.message, type: form.type };

      await api.post(endpoint, payload);
      showToast(`Notification ${form.target === "all" ? "broadcasted" : "sent"} successfully! ✅`, "success");
      setForm({ ...form, title: "", message: "", userId: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send notification.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">📢 Push Notifications</h1>
          <p className="text-sm text-gray-500 font-medium">Send updates and alerts to your customers</p>
        </div>
        <div className="text-4xl">🔔</div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, target: "all" })}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${form.target === "all" ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <span className="text-2xl">👥</span>
              <span className={`text-sm font-black ${form.target === "all" ? 'text-emerald-700' : 'text-gray-500'}`}>All Customers</span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, target: "specific" })}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${form.target === "specific" ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <span className="text-2xl">👤</span>
              <span className={`text-sm font-black ${form.target === "specific" ? 'text-emerald-700' : 'text-gray-500'}`}>Specific User</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {form.target === "specific" && (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">User ID *</label>
                <input
                  type="number"
                  required
                  placeholder="Enter User ID"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:border-emerald-400 focus:bg-white transition font-bold"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Notification Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Flash Sale Live! ⚡"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:border-emerald-400 focus:bg-white transition font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Message *</label>
              <textarea
                required
                rows="4"
                placeholder="Write your message here..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:border-emerald-400 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Notification Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:outline-none focus:border-emerald-400 transition"
              >
                <option value="general">🔔 General Alert</option>
                <option value="offer">🏷️ Special Offer</option>
                <option value="system">⚙️ System Update</option>
                <option value="order_placed">📦 Order Related</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-50">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-black text-base shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>🚀 {form.target === "all" ? "Broadcast to All Users" : "Send to User"}</>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-4 italic">
              * Note: Notifications will be visible to users in their notification center.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
