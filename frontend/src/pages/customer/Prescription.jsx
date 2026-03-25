import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import prescriptionService from "../../services/prescriptionservice";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: "⏳",
    bg: "bg-amber-50",
    color: "text-amber-600",
    border: "border-amber-200",
  },
  verified: {
    label: "Approved",
    icon: "✅",
    bg: "bg-emerald-50",
    color: "text-emerald-600",
    border: "border-emerald-200",
  },
  rejected: {
    label: "Rejected",
    icon: "❌",
    bg: "bg-red-50",
    color: "text-red-500",
    border: "border-red-200",
  },
  expired: {
    label: "Expired",
    icon: "📅",
    bg: "bg-gray-100",
    color: "text-gray-500",
    border: "border-gray-200",
  },
};

export default function Prescription() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [deleteId, setDeleteId] = useState(null);
  const [viewImg, setViewImg] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL?.replace("/api", "");

  useEffect(() => {
    prescriptionService
      .getAll()
      .then((res) => setPrescriptions(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024)
      return showMsg("error", "File size must be less than 5MB.");
    setFile(f);
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview("pdf");
    }
  };

  const handleUpload = async () => {
    if (!file) return showMsg("error", "Please select a prescription first.");
    const formData = new FormData();
    formData.append("prescription", file);
    setUploading(true);
    try {
      const { data } = await prescriptionService.upload(formData);
      setPrescriptions((prev) => [
        { ...data.data, created_at: new Date() },
        ...prev,
      ]);
      setFile(null);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      showMsg(
        "success",
        "Prescription uploaded successfully! Our team will verify it shortly. ✅",
      );
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await prescriptionService.remove(id);
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
      setDeleteId(null);
      showMsg("success", "Prescription deleted successfully.");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Delete failed.");
    }
  };

  const handleOrder = (prescription) => {
    navigate("/medicines", { state: { prescription_id: prescription.id } });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Viewer Modal */}
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
              alt="Prescription"
              className="w-full rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setViewImg(null)}
              className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center font-black text-gray-700 shadow-lg hover:bg-gray-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 mb-2">
              Delete Prescription?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This prescription will be permanently deleted from your account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-emerald-600">
              Home
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">My Prescriptions</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast */}
        {msg.text && (
          <div
            className={`mb-5 flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold ${
              msg.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-600"
            }`}
          >
            {msg.type === "success" ? "✅" : "⚠️"} {msg.text}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              My Prescriptions
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {prescriptions.length} total prescriptions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Upload Section ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-4">📤 Upload New</h3>

              <div
                onClick={() => fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition mb-4 ${
                  preview
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {preview ? (
                  preview === "pdf" ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-5xl">📄</span>
                      <p className="text-sm font-bold text-emerald-700">
                        {file?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(file?.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <p className="text-xs text-emerald-600 font-bold mt-2">
                        ✅ Ready to upload
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl">📋</div>
                    <p className="text-sm font-bold text-gray-700">
                      Click to upload
                    </p>
                    <p className="text-xs text-gray-400">
                      JPG, PNG, PDF • Max 5MB
                    </p>
                  </div>
                )}
              </div>

              {preview && (
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="w-full mb-2 py-2 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                >
                  🔄 Change File
                </button>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full py-3 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2 ${
                  !file ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{
                  background: uploading
                    ? "#6ee7b7"
                    : "linear-gradient(135deg, #065f46, #059669)",
                }}
              >
                {uploading ? "Uploading..." : "📤 Upload Now"}
              </button>

              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 space-y-1">
                <p>📌 Verification usually takes up to 24 hours.</p>
                <p>📌 You can order medicines once approved.</p>
                <p>📌 Essential for Schedule H/X medications.</p>
              </div>
            </div>
          </div>

          {/* ── Prescriptions List ── */}
          <div className="lg:col-span-2">
            {prescriptions.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-black text-gray-800 mb-2">
                  No prescriptions found
                </h3>
                <p className="text-gray-400 text-sm">
                  Upload your doctor's prescription to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((rx) => {
                  const statusCfg =
                    STATUS_CONFIG[rx.status] || STATUS_CONFIG.pending;
                  const imgUrl = rx.image_url
                    ? `${API_URL}/uploads/prescriptions/${rx.image_url}`
                    : null;
                  const isPdf = rx.image_url?.endsWith(".pdf");

                  return (
                    <div
                      key={rx.id}
                      className={`bg-white rounded-2xl border-2 ${statusCfg.border} overflow-hidden hover:shadow-md transition`}
                    >
                      <div
                        className={`${statusCfg.bg} px-5 py-2.5 flex items-center justify-between`}
                      >
                        <span
                          className={`text-xs font-bold ${statusCfg.color} flex items-center gap-1.5`}
                        >
                          {statusCfg.icon} {statusCfg.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {rx.created_at
                            ? new Date(rx.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : ""}
                        </span>
                      </div>

                      <div className="p-5 flex items-start gap-4">
                        <div
                          className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition"
                          onClick={() => imgUrl && !isPdf && setViewImg(imgUrl)}
                        >
                          {isPdf ? (
                            <div className="text-center">
                              <div className="text-3xl">📄</div>
                              <p className="text-xs text-gray-500 mt-1">PDF</p>
                            </div>
                          ) : imgUrl ? (
                            <img
                              src={imgUrl}
                              alt="Prescription"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-3xl">📋</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm">
                            Prescription #{rx.id}
                          </p>
                          {rx.valid_until && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Valid until:{" "}
                              {new Date(rx.valid_until).toLocaleDateString(
                                "en-IN",
                              )}
                            </p>
                          )}
                          {rx.verified_by_name && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Verified by: {rx.verified_by_name}
                            </p>
                          )}
                          {rx.notes && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              "{rx.notes}"
                            </p>
                          )}

                          {rx.status === "pending" && (
                            <p className="text-xs text-amber-600 font-semibold mt-2">
                              ⏳ Verification in progress — expect a response
                              within 24 hours.
                            </p>
                          )}
                          {rx.status === "rejected" && (
                            <p className="text-xs text-red-500 font-semibold mt-2">
                              ❌ Rejected — Please upload a clearer image of the
                              prescription.
                            </p>
                          )}
                          {rx.status === "verified" && (
                            <p className="text-xs text-emerald-600 font-semibold mt-2">
                              ✅ Approved — You can now order medicines using
                              this prescription.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="px-5 pb-4 flex gap-2 flex-wrap">
                        {imgUrl && !isPdf && (
                          <button
                            onClick={() => setViewImg(imgUrl)}
                            className="px-3 py-2 rounded-xl text-xs font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                          >
                            🔍 View Image
                          </button>
                        )}
                        {isPdf && imgUrl && (
                          <a
                            href={imgUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-xl text-xs font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                          >
                            📄 Open PDF
                          </a>
                        )}

                        {rx.status === "verified" && (
                          <button
                            onClick={() => handleOrder(rx)}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white transition"
                            style={{
                              background:
                                "linear-gradient(135deg, #065f46, #059669)",
                            }}
                          >
                            🛒 Order Medicines
                          </button>
                        )}

                        {rx.status !== "verified" && (
                          <button
                            onClick={() => setDeleteId(rx.id)}
                            className="px-3 py-2 rounded-xl text-xs font-bold border-2 border-red-200 text-red-500 hover:bg-red-50 transition"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
