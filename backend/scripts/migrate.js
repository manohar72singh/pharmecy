import pool from "../src/config/db.js";

const migrate = async () => {
    try {
        console.log("🚀 Starting Database Migration...");

        // 1. Add loyalty_points to users table
        console.log("📦 Adding loyalty_points to users table...");
        const [usersCols] = await pool.query("SHOW COLUMNS FROM users LIKE 'loyalty_points'");
        if (usersCols.length === 0) {
            await pool.query("ALTER TABLE users ADD COLUMN loyalty_points INT DEFAULT 0 AFTER gender");
            console.log("✅ Added loyalty_points column.");
        } else {
            console.log("ℹ️ loyalty_points column already exists.");
        }

        // 2. Create serviceable_pincodes table
        console.log("📦 Creating serviceable_pincodes table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS serviceable_pincodes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                pincode VARCHAR(10) NOT NULL UNIQUE,
                city_name VARCHAR(100),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ table serviceable_pincodes created.");

        // 3. Seed some default pincodes if empty
        const [counts] = await pool.query("SELECT COUNT(*) as count FROM serviceable_pincodes");
        if (counts[0].count === 0) {
            console.log("🌱 Seeding default pincodes...");
            await pool.query("INSERT INTO serviceable_pincodes (pincode, city_name) VALUES (?, ?), (?, ?), (?, ?)", 
                ["110001", "New Delhi", "400001", "Mumbai", "800001", "Patna"]);
            console.log("✅ Seeded default pincodes.");
        }

        console.log("✨ Migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error.message);
        process.exit(1);
    }
};

migrate();
