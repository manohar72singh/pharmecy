import pool from "../config/db.js";

/**
/**
 * Generates a unique order number.
 */
export const generateOrderNumber = () => {
    const date = new Date();
    const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${ymd}-${rand}`;
};

/**
 * Calculates order details based on current cart and applied discounts.
 * 
 * @param {number} userId 
 * @param {object} options { address_id, coupon_id, use_loyalty_points, clientDiscount }
 * @param {object} conn (Optional) Database connection for transactions
 * @returns {object} { subtotal, totalAmount, discountAmount, deliveryCharge, cartItems, loyaltyDiscount, earnedPoints, address }
 */
export const calculateOrderTotals = async (userId, options, conn = pool) => {
    const { address_id, coupon_id = null, use_loyalty_points = false, clientDiscount = 0 } = options;

    // 1. Fetch Address
    const [addrRows] = await conn.query(
        "SELECT * FROM customer_addresses WHERE id = ? AND user_id = ?",
        [address_id, userId]
    );
    if (addrRows.length === 0) throw new Error("Delivery address not found.");
    const address = addrRows[0];

    // 2. Fetch Cart Items
    const [cartItems] = await conn.query(
        `SELECT ci.id, ci.medicine_id, ci.batch_id, ci.quantity,
                mb.selling_price, mb.mrp, mb.available_quantity, m.name
         FROM cart ci
         JOIN medicine_batches mb ON ci.batch_id    = mb.id
         JOIN medicines        m  ON ci.medicine_id = m.id
         WHERE ci.user_id = ?`,
        [userId]
    );

    if (cartItems.length === 0) throw new Error("Your cart is empty.");

    // 3. Subtotal & Stock Check
    let subtotal = 0;
    for (const item of cartItems) {
        if (item.available_quantity < item.quantity) {
            throw new Error(`Stock for "${item.name}" is currently unavailable.`);
        }
        subtotal += parseFloat(item.selling_price) * item.quantity;
    }

    // 4. Coupon Discount
    let discountAmount = parseFloat(clientDiscount) || 0;
    if (coupon_id && discountAmount === 0) {
        const [coupon] = await conn.query(
            "SELECT id, discount_type, discount_value FROM coupons WHERE id = ?",
            [coupon_id]
        );
        if (coupon.length > 0) {
            const dtype = (coupon[0].discount_type || "").toLowerCase();
            const dvalue = parseFloat(coupon[0].discount_value) || 0;
            if (dtype === "flat") {
                discountAmount = dvalue;
            } else {
                discountAmount = parseFloat(((subtotal * dvalue) / 100).toFixed(2));
            }
            discountAmount = Math.min(discountAmount, subtotal);
        }
    }

    // 5. Delivery & Tax
    const deliveryCharge = subtotal >= 299 ? 0 : 49;
    const taxAmount = 0;
    let totalAmount = subtotal - discountAmount + deliveryCharge + taxAmount;

    // 6. Loyalty Points
    let loyaltyDiscount = 0;
    if (use_loyalty_points) {
        const [userRows] = await conn.query("SELECT loyalty_points FROM users WHERE id = ?", [userId]);
        const availablePoints = userRows[0]?.loyalty_points || 0;
        if (availablePoints > 0) {
            loyaltyDiscount = Math.min(availablePoints, totalAmount);
            totalAmount -= loyaltyDiscount;
        }
    }

    const earnedPoints = Math.floor(subtotal / 100);

    return {
        subtotal,
        totalAmount,
        discountAmount,
        deliveryCharge,
        taxAmount,
        loyaltyDiscount,
        earnedPoints,
        cartItems,
        address
    };
};
