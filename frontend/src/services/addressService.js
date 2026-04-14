import api from "./api.js";

const addressService = {
  getAll: () => api.get("/addresses"),
  add: (data) => api.post("/addresses", data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  remove: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.patch(`/addresses/${id}/default`),
  validatePincode: (pincode) => api.get(`/addresses/validate/${pincode}`),
};

export default addressService;
