import { useState, useEffect } from "react";
import reviewService from "../../services/reviewService";

const StarRating = ({ rating, setRating, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => !readonly && setRating && setRating(star)}
        className={`text-2xl transition ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
      >
        {star <= rating ? "⭐" : "☆"}
      </button>
    ))}
  </div>
);

export default function ReviewSection({ medicineId, readonly = true }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // readonly mode mein form kabhi nahi dikhega
  const canReview = !readonly && isLoggedIn && !alreadyReviewed;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!medicineId) return;
    reviewService
      .getByMedicine(medicineId)
      .then((res) => {
        console.log("Reviews:", res.data);
        setReviews(res.data.data || []);
      })
      .catch((err) => {
        console.error("Review fetch error:", err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, [medicineId]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleSubmit = async () => {
    if (!rating) return showMsg("error", "Rating zaroori hai.");
    setSaving(true);
    try {
      const { data } = await reviewService.add({
        medicine_id: medicineId,
        rating,
        comment,
      });
      setReviews((prev) => [
        {
          ...data.data,
          id: data.data.id,
          user_name: user?.name || "Aap",
          rating,
          comment,
          created_at: new Date(),
        },
        ...prev,
      ]);
      setShowForm(false);
      setRating(5);
      setComment("");
      showMsg("success", "Review add ho gaya! ⭐");
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Review add nahi hua.");
    } finally {
      setSaving(false);
    }
  };

  // const handleDelete = async (id) => {
  //   try {
  //     await reviewService.remove(id);
  //     setReviews((prev) => prev.filter((r) => r.id !== id));
  //     showMsg("success", "Review delete ho gaya.");
  //   } catch {
  //     showMsg("error", "Delete failed.");
  //   }
  // };

  const alreadyReviewed = reviews.some((r) => r.user_id === user?.id);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-gray-900 text-lg">
            Reviews & Ratings
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-amber-500">
              {avgRating}
            </span>
            <StarRating rating={Math.round(avgRating)} readonly />
            <span className="text-sm text-gray-400">
              ({reviews.length} reviews)
            </span>
          </div>
        </div>
        {canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-bold text-white px-4 py-2 rounded-xl"
            style={{ background: "linear-gradient(135deg, #065f46, #059669)" }}
          >
            + Review Do
          </button>
        )}
      </div>

      {/* Toast */}
      {msg.text && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-xl text-sm font-semibold ${
            msg.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Review Form */}
      {showForm && canReview && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
          <h4 className="font-bold text-gray-900 mb-3">Apna Review Likhein</h4>
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-600 mb-1">Rating *</p>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-600 mb-1">
              Comment (optional)
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Is medicine ke baare mein likhein..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm border-2 border-gray-200 text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition"
              style={{
                background: saving
                  ? "#6ee7b7"
                  : "linear-gradient(135deg, #065f46, #059669)",
              }}
            >
              {saving ? "Saving..." : "Submit ⭐"}
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-6 text-gray-400 text-sm">Loading...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-gray-500 font-semibold text-sm">
            Koi review nahi abhi
          </p>
          <p className="text-gray-400 text-xs mt-1">Pehle review likhein!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-50 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-black">
                    {review.user_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {review.user_name}
                    </p>
                    <StarRating rating={review.rating} readonly />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {review.created_at && (
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                  {/* {review.user_id === user?.id && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-xs text-red-400 hover:text-red-600 font-bold"
                    >
                      🗑️
                    </button>
                  )} */}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 mt-2 ml-10">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
