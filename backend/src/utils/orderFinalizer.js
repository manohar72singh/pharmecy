import pool from "../config/db.js";
import { generateOrderNumber } from "./orderHelper.js"; // I'll move this to helper
import { createNotification, notifyAdmins, notifyDeliveryPartners } from "./notificationHelper.js";

/**
 * Finalizes an order and saves it to the database.
 * Handles stock updates, cart clearing, loyalty points, and notifications.
 * 
 * @param {number} userId 
 * @param {object} orderDetails Result from calculateOrderTotals
 * @param {object} paymentInfo { payment_mode, payment_status, razorpay_order_id, razorpay_payment_id }
 * @param {string} notes Optional notes
 * @param {object} conn Database connection for transaction
 * @returns {object} The created order details
 */
export const finalizeOrder = async (userId, orderDetails, paymentInfo, notes = null, conn) => {
    const { 
        address, 
        cartItems, 
        subtotal, 
        totalAmount, 
        discountAmount, 
        deliveryCharge, 
        tax_amount = 0, 
        loyaltyDiscount, 
        earnedPoints,
        coupon_id = null
    } = orderDetails;

    const { 
        payment_mode, 
        payment_status = 'pending', 
        razorpay_order_id = null,
        razorpay_payment_id = null 
    } = paymentInfo;

    const orderNumber = generateOrderNumber();

    // 1. Insert Order
    const [orderResult] = await conn.query(
        `INSERT INTO orders
        (user_id, address_id, coupon_id, order_number, order_type, subtotal, delivery_charge,
         discount_amount, tax_amount, total_amount, payment_mode, payment_status, order_status, notes, razorpay_order_id)
        VALUES (?, ?, ?, ?, 'normal', ?, ?, ?, ?, ?, ?, ?, 'placed', ?, ?)`,
        [
            userId,
            address.id,
            coupon_id,
            orderNumber,
            subtotal,
            deliveryCharge,
            discountAmount,
            tax_amount,
            totalAmount,
            payment_mode,
            payment_status,
            notes,
            razorpay_order_id
        ]
    );
    const orderId = orderResult.insertId;

    // 2. Coupon Usage
    if (coupon_id) {
        await conn.query(
            "INSERT INTO coupon_usage (coupon_id, user_id, order_id) VALUES (?, ?, ?)",
            [coupon_id, userId, orderId]
        );
    }

    // 3. Order Items & Stock
    for (const item of cartItems) {
        const itemTotal = parseFloat(item.selling_price) * item.quantity;
        await conn.query(
            `INSERT INTO order_items (order_id, medicine_id, batch_id, quantity, unit_price, total_price)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, item.medicine_id, item.batch_id, item.quantity, item.selling_price, itemTotal]
        );
        await conn.query(
            "UPDATE medicine_batches SET available_quantity = available_quantity - ? WHERE id = ?",
            [item.quantity, item.batch_id]
        );
    }

    // 4. Status History
    await conn.query(
        "INSERT INTO order_status_history (order_id, status, updated_by) VALUES (?, ?, ?)",
        [orderId, "placed", userId]
    );

    // 5. Payments Table (if paid)
    if (payment_status === 'paid') {
        await conn.query(
            `INSERT INTO payments 
              (order_id, user_id, amount, payment_mode, transaction_id, status, paid_at)
             VALUES (?, ?, ?, ?, ?, 'success', NOW())`,
            [orderId, userId, totalAmount, payment_mode, razorpay_payment_id]
        );
        
        // Also add paid status to history
        await conn.query(
            "INSERT INTO order_status_history (order_id, status, updated_by) VALUES (?, ?, ?)",
            [orderId, "paid", userId]
        );
    }

    // 6. Clear Cart
    await conn.query("DELETE FROM cart WHERE user_id = ?", [userId]);

    // 7. Loyalty Points
    if (loyaltyDiscount > 0) {
        await conn.query("UPDATE users SET loyalty_points = loyalty_points - ? WHERE id = ?", [loyaltyDiscount, userId]);
    }
    if (earnedPoints > 0) {
        await conn.query("UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?", [earnedPoints, userId]);
    }

    // 8. Notifications
    await createNotification(
        userId,
        "Order Placed successfully! 📦",
        `Your order #${orderNumber} has been received and is being processed.`,
        "order_placed",
        { order_id: orderId, order_number: orderNumber }
    );

    await notifyAdmins(
        "New Order Received! 🛍️",
        `Order #${orderNumber} has been placed by a customer.`,
        "order_placed",
        { order_id: orderId, order_number: orderNumber }
    );

    await notifyDeliveryPartners(
        "New Order Received! 🛍️",
        `Order #${orderNumber} has been placed and is waiting for assignment.`,
        "order_placed",
        { order_id: orderId, order_number: orderNumber }
    );

    return {
        order_id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount,
        payment_mode
    };
};
