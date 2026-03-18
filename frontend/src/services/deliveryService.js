import api from "./api.js";

const deliveryService = {
  // Profile & Availability
  getProfile: () => api.get("/delivery/profile"),
  toggleAvailability: () => api.patch("/delivery/availability"),

  // Orders
  getAssignedOrders: (page = 1, limit = 10) =>
    api.get(`/delivery/orders?page=${page}&limit=${limit}`),
  getOrderDetail: (id) => api.get(`/delivery/orders/${id}`),
  verifyOTP: (id, otp) =>
    api.post(`/delivery/orders/${id}/verify-otp`, { otp }),

  // Earnings & History
  getEarnings: () => api.get("/delivery/earnings"),
  getHistory: (page = 1, limit = 10) =>
    api.get(`/delivery/history?page=${page}&limit=${limit}`),
};

export default deliveryService;
