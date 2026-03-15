import api from "./api.js";

const couponService = {
  getAll: () => api.get("/coupons"),
  apply: (code, order_amount) =>
    api.post("/coupons/apply", { code, order_amount }),
};

export default couponService;
