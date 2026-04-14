import pool from "../src/config/db.js";

const migrate = async () => {
    try {
        console.log("🚀 Creating temporary_orders table...");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS temporary_orders (
                id VARCHAR(255) PRIMARY KEY,
                user_id INT NOT NULL,
                order_data JSON NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                razorpay_order_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Table temporary_orders created.");

        console.log("✨ Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error.message);
        process.exit(1);
    }
};

migrate();
