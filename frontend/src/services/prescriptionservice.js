import api from "./api.js";

const prescriptionService = {
  upload: (formData) =>
    api.post("/prescriptions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAll: () => api.get("/prescriptions"),
  getById: (id) => api.get(`/prescriptions/${id}`),
  remove: (id) => api.delete(`/prescriptions/${id}`),
};

export default prescriptionService;
