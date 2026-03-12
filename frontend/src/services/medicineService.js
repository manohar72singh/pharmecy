import api from "./api.js";

const medicineService = {
  getAll: (params) => api.get("/medicines", { params }),
  getFeatured: () => api.get("/medicines/featured"),
  getById: (id) => api.get(`/medicines/${id}`),
  getCategories: () => api.get("/medicines/categories"),
  search: (query) => api.get("/medicines", { params: { search: query } }),
};

export default medicineService;
