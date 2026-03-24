import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MedicineImage from "../../components/common/MedicineImage";
import wishlistService from "../../services/wishlistService";
import cartService from "../../services/cartService";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null); // medicine_id being added to cart
  const [msg, setMsg] = useState({ type: "", text: "" });

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    wishlistService
      .getAll()
      .then((res) => setItems(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3000);
  };

  const handleRemove = async (medicine_id) => {
    try {
      await wishlistService.remove(medicine_id);
      setItems((prev) => prev.filter((i) => i.medicine_id !== medicine_id));

      let cached = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
      cached = cached.map((id) => id?.toString()).filter(Boolean);
      const updated = cached.filter((id) => id !== medicine_id?.toString());
      localStorage.setItem("wishlistIds", JSON.stringify(updated));
      window.dispatchEvent(new Event("wishlistUpdated"));

      showMsg("success", "Item removed from wishlist.");
    } catch {
      showMsg("error", "Failed to remove item.");
    }
  };

  const handleAddToCart = async (item) => {
    setAdding(item.medicine_id);
    try {
      if (!item.batch_id) {
        showMsg("error", "This item is currently out of stock.");
        setAdding(null);
        return;
      }
      await cartService.addToCart({
        medicine_id: item.medicine_id,
        batch_id: item.batch_id,
        quantity: 1,
        image_url: item.image_url,
        category_slug: item.category_slug,
      });
      window.dispatchEvent(new Event("cartUpdated"));
      showMsg("success", `${item.name} added to cart! 🛒`);
    } catch {
      showMsg("error", "Could not add to cart.");
    } finally {
      setAdding(null);
    }
  };

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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-emerald-600">
              Home
            </Link>
            <span>›</span>
            <span className="text-gray-700 font-medium">My Wishlist</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Not logged in */}
        {!isLoggedIn && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-lg font-black text-gray-800 mb-2">
              Please Login
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              You need to be logged in to manage your wishlist.
            </p>
            <Link
              to="/login"
              className="inline-block text-white font-bold px-6 py-3 rounded-2xl transition"
              style={{
                background: "linear-gradient(135deg, #065f46, #059669)",
              }}
            >
              Login Now →
            </Link>
          </div>
        )}

        {/* Empty State */}
        {isLoggedIn && items.length === 0 && (
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

        {/* Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const price = parseFloat(item.price || 0);
              const mrp = parseFloat(item.mrp || 0);
              const disc =
                mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-emerald-200 transition group"
                >
                  <div className="relative">
                    <Link to={`/medicines/${item.medicine_id}`}>
                      <div className="h-44 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center overflow-hidden">
                        <MedicineImage
                          src={item.image_url}
                          alt={item.name}
                          categorySlug={item.category_slug}
                          size="lg"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <button
                      onClick={() => handleRemove(item.medicine_id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Remove from wishlist"
                    >
                      ❤️
                    </button>
                    {disc > 0 && (
                      <span className="absolute top-3 left-3 text-xs font-bold text-white bg-green-500 px-2 py-0.5 rounded-full">
                        {disc}% off
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <Link to={`/medicines/${item.medicine_id}`}>
                      <h3 className="font-bold text-gray-900 text-sm leading-tight hover:text-emerald-600 transition line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    {item.brand && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.brand}
                      </p>
                    )}
                    {item.pack_size && (
                      <p className="text-xs text-gray-400">{item.pack_size}</p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-black text-gray-900">
                        ₹{price.toFixed(2)}
                      </span>
                      {mrp > price && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{mrp.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={adding === item.medicine_id}
                        className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition shadow-sm"
                        style={{
                          background:
                            adding === item.medicine_id
                              ? "#6ee7b7"
                              : "linear-gradient(135deg, #065f46, #059669)",
                        }}
                      >
                        {adding === item.medicine_id
                          ? "Adding..."
                          : "🛒 Add to Cart"}
                      </button>
                      <button
                        onClick={() => handleRemove(item.medicine_id)}
                        className="px-3 py-2.5 rounded-xl text-xs font-bold border-2 border-red-200 text-red-400 hover:bg-red-50 transition"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
