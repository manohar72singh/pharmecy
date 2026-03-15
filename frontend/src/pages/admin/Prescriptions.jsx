import { useState, useEffect } from "react";
import api from "../../services/api";
import Pagination from "../../components/common/Pagination";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};
const API_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

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
      {/* Image viewer */}
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
            <img src={viewImg} alt="Rx" className="w-full rounded-2xl" />
            <button
              onClick={() => setViewImg(null)}
              className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center font-black"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-3">
        {["pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition capitalize ${status === s ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            style={
              status === s
                ? { background: "linear-gradient(135deg,#065f46,#059669)" }
                : {}
            }
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["#", "Patient", "Date", "Image", "Status", "Action"].map(
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
                ? [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : prescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-gray-50">
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
                          ? new Date(rx.created_at).toLocaleDateString("en-IN")
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
                            className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 hover:border-emerald-400 transition"
                          >
                            <img
                              src={`${API_URL}/uploads/prescriptions/${rx.image_url}`}
                              alt="Rx"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            No image
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[rx.status] || "bg-gray-100 text-gray-600"}`}
                        >
                          {rx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {rx.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(rx.id, "approved")}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => handleUpdate(rx.id, "rejected")}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}
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
