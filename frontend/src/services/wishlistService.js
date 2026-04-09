import api from "./api.js";
const wishlistService = {
  getAll: () => api.get("/wishlist"),
  toggle: (medicine_id) => api.post("/wishlist/toggle", { medicine_id }),
  remove: (medicine_id) => api.delete(`/wishlist/${medicine_id}`),
};
export default wishlistService;

// ✅ Guest wishlist ko login ke baad DB me sync karne ke liye
export const syncLocalWishlistToDB = async () => {
  try {
    const ids = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
    if (ids.length === 0) return;

    // Standard toggle use karein jo api instance use karta hai
    await Promise.allSettled(
      ids.map((id) => wishlistService.toggle(parseInt(id))),
    );

    // Sync complete hone ke baad source of truth (DB) se cache update karein
    await refreshWishlistCache();
  } catch (err) {
    console.error("Wishlist sync failed:", err);
  }
};

// ✅ DB se wishlist IDs lekar localStorage update karne ke liye
export const refreshWishlistCache = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const { data } = await wishlistService.getAll();
    if (data.success) {
      const ids = (data.data || []).map((item) => item.medicine_id?.toString());
      localStorage.setItem("wishlistIds", JSON.stringify(ids));
      window.dispatchEvent(new Event("wishlistUpdated"));
    }
  } catch (err) {
    console.error("Failed to refresh wishlist cache:", err);
  }
};
