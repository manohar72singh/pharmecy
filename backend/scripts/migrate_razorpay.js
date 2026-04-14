import pool from "../src/config/db.js";

const migrate = async () => {
    try {
        console.log("🚀 Starting Razorpay Database Migration...");

        // Add razorpay_order_id to orders table
        const [ordersCols] = await pool.query("SHOW COLUMNS FROM orders LIKE 'razorpay_order_id'");
        if (ordersCols.length === 0) {
            await pool.query("ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(255) AFTER coupon_id");
            console.log("✅ Added razorpay_order_id column to orders table.");
        } else {
            console.log("ℹ️ razorpay_order_id column already exists.");
        }

        console.log("✨ Razorpay Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Razorpay Migration failed:", error.message);
        process.exit(1);
    }
};

migrate();
