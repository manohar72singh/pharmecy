import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MedicineCard from "../../components/medicine/MedicineCard";

// ── Guest wishlist helpers (localStorage) ─────────────
const localWishlist = {
  get: () => JSON.parse(localStorage.getItem("wishlistIds") || "[]"),
  add: (id) => {
    const ids = localWishlist.get();
    const idStr = id?.toString();
    if (!ids.includes(idStr)) {
      localStorage.setItem("wishlistIds", JSON.stringify([...ids, idStr]));
    }
  },
  remove: (id) => {
    const ids = localWishlist.get().filter((i) => i !== id?.toString());
    localStorage.setItem("wishlistIds", JSON.stringify(ids));
  },
  clear: () => localStorage.removeItem("wishlistIds"),
};

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const isLoggedIn = !!localStorage.getItem("token");

  // ── Load wishlist ──────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (isLoggedIn) {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/wishlist`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const data = await res.json();
          setItems(data.data || []);
        } else {
          // Guest: localStorage se medicine IDs lo, medicines fetch karo
          const ids = localWishlist.get();
          if (ids.length === 0) {
            setItems([]);
          } else {
            // Each medicine ki detail fetch karo
            const results = await Promise.allSettled(
              ids.map((id) =>
                fetch(`${import.meta.env.VITE_API_URL}/medicines/${id}`).then(
                  (r) => r.json(),
                ),
              ),
            );
            const medicines = results
              .filter((r) => r.status === "fulfilled" && r.value?.success)
              .map((r) => r.value.data);
            setItems(medicines);
          }
        }
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();

    // Listen for wishlist updates
    const handleWishlistUpdate = () => load();
    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () =>
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, [isLoggedIn]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-emerald-600">
              Home
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">My Wishlist</span>
          </div>
        </div>
      </div>

      {/* Guest login banner */}
      {!isLoggedIn && (
        <div className="bg-amber-50 border-b border-amber-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-800">
              <span className="text-base sm:text-lg flex-shrink-0">👤</span>
              <span>
                <strong>Login now</strong> to save your wishlist permanently and
                sync across devices!
              </span>
            </div>
            <Link
              to="/login"
              state={{ from: "/wishlist" }}
              className="flex-shrink-0 text-xs font-bold text-white px-4 py-2 rounded-xl whitespace-nowrap"
              style={{ background: "#059669" }}
            >
              Login / Register
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-400 mt-0.5">{items.length} items</p>
          </div>
          {items.length > 0 && (
            <Link
              to="/medicines"
              className="text-sm font-bold text-white px-4 py-2.5 rounded-xl transition"
              style={{
                background: "linear-gradient(135deg, #065f46, #059669)",
              }}
            >
              + Add More
            </Link>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-lg font-black text-gray-800 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Save your favorite medicines to buy them later!
            </p>
            <Link
              to="/medicines"
              className="inline-block text-white font-bold px-6 py-3 rounded-2xl transition"
              style={{
                background: "linear-gradient(135deg, #065f46, #059669)",
              }}
            >
              Browse Medicines →
            </Link>
          </div>
        )}

        {/* Grid - Using MedicineCard */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((item) => (
              <MedicineCard key={item.id} med={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
