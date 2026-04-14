import crypto from "crypto";
import pool from "../../config/db.js";
import { finalizeOrder } from "../../utils/orderFinalizer.js";

/**
 * Handle Razorpay Webhooks (Server-to-Server)
 */
export const handleRazorpayWebhook = async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // 1. Verify Webhook Signature
    // Use the raw body buffer if available (captured in server.js)
    const body = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

    if (signature !== expectedSignature) {
        console.error("❌ Invalid Webhook Signature");
        return res.status(400).send("Invalid signature");
    }

    const event = req.body;
    console.log(`🔔 Razorpay Webhook received: ${event.event}`);

    // 2. Handle payment captured or order paid
    if (event.event === "payment.captured" || event.event === "order.paid") {
        const payload = event.payload.payment?.entity || event.payload.order?.entity;
        const razorpay_order_id = payload.order_id || payload.id;
        const razorpay_payment_id = payload.id;

        const conn = await pool.getConnection();
        try {
            // Check if order already exists (prevent double processing)
            const [existing] = await conn.query("SELECT id FROM orders WHERE razorpay_order_id = ?", [razorpay_order_id]);
            if (existing.length > 0) {
                console.log(`ℹ️ Order ${razorpay_order_id} already exists. Skipping webhook.`);
                return res.status(200).send("Processed");
            }

            // Fetch temp order
            const [tempRows] = await conn.query("SELECT user_id, order_data FROM temporary_orders WHERE id = ?", [razorpay_order_id]);
            if (tempRows.length === 0) {
                console.warn(`⚠️ Temp order ${razorpay_order_id} not found for webhook.`);
                return res.status(200).send("No temp order found");
            }

            const { orderDetails, notes } = JSON.parse(tempRows[0].order_data);
            const userId = tempRows[0].user_id;

            await conn.beginTransaction();
            
            // Finalize
            await finalizeOrder(userId, orderDetails, {
                payment_mode: 'online',
                payment_status: 'paid',
                razorpay_order_id,
                razorpay_payment_id
            }, notes, conn);

            // Cleanup
            await conn.query("DELETE FROM temporary_orders WHERE id = ?", [razorpay_order_id]);

            await conn.commit();
            console.log(`✅ Order finalized via webhook for RZP Order: ${razorpay_order_id}`);
        } catch (err) {
            if (conn) await conn.rollback();
            console.error("❌ Webhook Finalization Error:", err);
        } finally {
            if (conn) conn.release();
        }
    }

    res.status(200).send("OK");
};
