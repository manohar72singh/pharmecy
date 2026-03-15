import api from "./api.js";
const reviewService = {
  getByMedicine: (medicine_id) => api.get(`/reviews/medicine/${medicine_id}`),
  add: (data) => api.post("/reviews", data),
  remove: (id) => api.delete(`/reviews/${id}`),
};
export default reviewService;
