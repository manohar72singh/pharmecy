import api from "./api.js";

const razorpayService = {
  createOrder: (data) => api.post("/razorpay/create-order", data),
  verifyPayment: (data) => api.post("/razorpay/verify-payment", data),
};

export default razorpayService;
