import api from "./api.js";
const walletService = {
  get: () => api.get("/wallet"),
};
export default walletService;
