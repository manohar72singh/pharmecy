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

    localStorage.removeItem("wishlistIds");
    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (err) {
    console.error("Wishlist sync failed:", err);
  }
};
