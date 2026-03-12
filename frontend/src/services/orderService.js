import api from "./api.js";

const orderService = {
  placeOrder: (data) => api.post("/orders", data),
  getMyOrders: (params) => api.get("/orders", { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  returnOrder: (id, data) => api.post(`/orders/${id}/return`, data),
};

export default orderService;
