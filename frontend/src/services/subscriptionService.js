import api from "./api.js";

const subscriptionService = {
  getPlans: () => api.get("/subscriptions/plans"),
  getAll: () => api.get("/subscriptions"),
  create: (data) => api.post("/subscriptions", data),
  toggle: (id) => api.patch(`/subscriptions/${id}/toggle`),
  cancel: (id) => api.delete(`/subscriptions/${id}`),
  getOrders: (id) => api.get(`/subscriptions/${id}/orders`),
};

export default subscriptionService;
