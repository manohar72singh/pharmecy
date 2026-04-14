import api from "./api.js";

const razorpayService = {
  prepareOrder: (data) => api.post("/razorpay/prepare-order", data),
  verifyAndPlace: (data) => api.post("/razorpay/verify-and-place", data),
};

export default razorpayService;
