import api from "./api.js";

// ── DB Cart APIs ──────────────────────────────────────
const cartService = {
  getCart: () => api.get("/cart"),
  addToCart: (data) => api.post("/cart", data),
  updateItem: (id, quantity) => api.put(`/cart/${id}`, { quantity }),
  removeItem: (id) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete("/cart/clear"),
  syncCart: (items) => api.post("/cart/sync", { items }),
};

export default cartService;

// ── LocalStorage Cart (guest) ─────────────────────────
export const localCart = {
  get: () => JSON.parse(localStorage.getItem("cart") || "[]"),

  add: (med, qty = 1) => {
    const cart = localCart.get();
    const price = parseFloat(med.selling_price || med.price || 0);
    const mrp = parseFloat(med.mrp || 0);
    const idx = cart.findIndex((i) => i.medicine_id === med.id);
    if (idx >= 0) {
      cart[idx].quantity += qty;
    } else {
      cart.push({
        medicine_id: med.id,
        batch_id: med.batch_id || med.stock_id,
        name: med.name,
        brand: med.brand,
        price,
        mrp,
        quantity: qty,
        image_url: med.image_url,
        category_slug: med.category_slug,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  },

  update: (medicineId, qty) => {
    const cart = localCart.get();
    const idx = cart.findIndex((i) => i.medicine_id === medicineId);
    if (idx >= 0) {
      if (qty <= 0) cart.splice(idx, 1);
      else cart[idx].quantity = qty;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  },

  remove: (medicineId) => {
    const cart = localCart.get().filter((i) => i.medicine_id !== medicineId);
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  },

  clear: () => {
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cartUpdated"));
  },

  count: () => localCart.get().reduce((sum, i) => sum + i.quantity, 0),
};

// ── Smart Cart — login ke baad sync karo ──────────────
export const syncLocalCartToDB = async () => {
  try {
    const localItems = localCart.get();
    if (localItems.length === 0) return;

    const items = localItems.map((i) => ({
      medicine_id: i.medicine_id,
      batch_id: i.batch_id,
      quantity: i.quantity,
    }));

    await cartService.syncCart(items);
    localCart.clear(); // localStorage clean karo
    window.dispatchEvent(new Event("cartUpdated"));
  } catch (err) {
    console.error("Cart sync error:", err);
  }
};
