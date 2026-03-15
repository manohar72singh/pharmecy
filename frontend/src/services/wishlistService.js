import api from "./api.js";
const wishlistService = {
  getAll: () => api.get("/wishlist"),
  toggle: (medicine_id) => api.post("/wishlist/toggle", { medicine_id }),
  remove: (medicine_id) => api.delete(`/wishlist/${medicine_id}`),
};
export default wishlistService;
