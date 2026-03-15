import { useState } from "react";
import reviewService from "../../services/reviewservice";

const StarRating = ({ rating, setRating }) => (
  <div className="flex gap-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        className="text-3xl transition hover:scale-110"
      >
        {star <= rating ? "⭐" : "☆"}
      </button>
    ))}
  </div>
);

const RATING_LABELS = {
  1: "Bahut Bura 😞",
  2: "Theek Nahi 😕",
  3: "Theek Hai 😊",
  4: "Accha Hai 😄",
  5: "Bahut Accha! 🤩",
};

export default function ReviewModal({ item, orderId, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      await reviewService.add({
        medicine_id: item.medicine_id,
        order_id: orderId,
        rating,
        comment,
      });
      onSubmit(item.medicine_id);
    } catch (err) {
      setError(err.response?.data?.message || "Review submit nahi hua.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="font-black text-gray-900 text-lg">⭐ Review Do</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Medicine info */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-2xl flex-shrink-0">
              💊
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{item.name}</p>
              {item.brand && (
                <p className="text-xs text-gray-400">{item.brand}</p>
              )}
            </div>
          </div>

          {/* Star Rating */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-700 mb-2">Rating do *</p>
            <StarRating rating={rating} setRating={setRating} />
            {rating > 0 && (
              <p className="text-sm font-semibold text-emerald-600 mt-1">
                {RATING_LABELS[rating]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-700 mb-2">
              Comment{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Is medicine ke baare mein apna experience share karein..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl mb-3">
              ⚠️ {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !rating}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition"
              style={{
                background: saving
                  ? "#6ee7b7"
                  : "linear-gradient(135deg, #065f46, #059669)",
              }}
            >
              {saving ? "Submitting..." : "⭐ Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
