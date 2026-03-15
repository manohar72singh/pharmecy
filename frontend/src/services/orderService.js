import api from "./api.js";

const orderService = {
  placeOrder: (data) => api.post("/orders", data),
  getMyOrders: () => api.get("/orders"),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getOrderDetail: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, data) => api.put(`/orders/${id}/cancel`, data),
};

export default orderService;
