import { useState, useEffect } from "react";
import api from "../../services/api";
import Pagination from "../../components/common/Pagination";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};
const API_URL = import.meta.env.VITE_API_URL?.replace("/api", "");

export default function AdminPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [viewImg, setViewImg] = useState(null);
  const LIMIT = 15;

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/prescriptions?page=${page}&limit=${LIMIT}&status=${status}`,
      );
      setPrescriptions(data.data.prescriptions);
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

  const handleUpdate = async (id, newStatus) => {
    try {
      await api.put(`/admin/prescriptions/${id}/status`, { status: newStatus });
      setPrescriptions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Prescription Image Viewer */}
      {viewImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setViewImg(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={viewImg}
              alt="Prescription Detail"
              className="w-full rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setViewImg(null)}
              className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-gray-800 shadow-lg hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3 shadow-sm">
        {["pending", "verified", "rejected"].map((s) => (
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
            {s === "verified" ? "approved" : s}
          </button>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {[
                  "Order ID",
                  "Patient Details",
                  "Date Uploaded",
                  "Rx Image",
                  "Current Status",
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
                      <td colSpan={6} className="px-4 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : prescriptions.map((rx) => (
                    <tr
                      key={rx.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-bold text-gray-900">
                        #{rx.id}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">
                          {rx.user_name}
                        </p>
                        <p className="text-xs text-gray-400">{rx.user_phone}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {rx.created_at
                          ? new Date(rx.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {rx.image_url ? (
                          <button
                            onClick={() =>
                              setViewImg(
                                `${API_URL}/uploads/prescriptions/${rx.image_url}`,
                              )
                            }
                            className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 hover:border-emerald-400 transition-all shadow-sm"
                          >
                            <img
                              src={`${API_URL}/uploads/prescriptions/${rx.image_url}`}
                              alt="Rx Preview"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[10px] uppercase font-bold">
                            No image
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] uppercase font-black px-2 py-1 rounded-full ${STATUS_COLORS[rx.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {rx.status === "verified" ? "approved" : rx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {rx.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(rx.id, "verified")}
                              className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-green-50 text-green-600 border border-green-200 hover:bg-green-600 hover:text-white transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdate(rx.id, "rejected")}
                              className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-red-50 text-red-500 border border-red-200 hover:bg-red-600 hover:text-white transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!loading && prescriptions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No prescriptions found for this category.
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
