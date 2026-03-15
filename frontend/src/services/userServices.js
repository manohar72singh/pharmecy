import api from "./api.js";

const userService = {
  getProfile: () => api.get("/users"),
  updateProfile: (data) => api.put("/users", data),
  changePassword: (data) => api.put("/users/change-password", data),
  uploadPhoto: (formData) =>
    api.post("/users/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default userService;
