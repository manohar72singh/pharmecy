import api from "./api.js";
const notificationService = {
  getAll: () => api.get("/notifications"),
  markAllRead: () => api.patch("/notifications/read-all"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
};
export default notificationService;
