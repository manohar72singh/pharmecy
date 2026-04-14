import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CA certificate path
const caPath = path.join(__dirname, "ca.pem");

/**
 * SSL configuration - dynamic based on environment
 * Cloud databases (TiDB, Render, etc.) REQUIRE secure connections.
 */
const getSSLConfig = () => {
  const dbHost = process.env.DB_HOST || '';
  const dbSslEnv = String(process.env.DB_SSL).toLowerCase().trim();
  
  const isRender = process.env.RENDER === "true" || !!process.env.RENDER_EXTERNAL_URL;
  const isProduction = process.env.NODE_ENV === "production";
  const isLocalHost = dbHost.includes('localhost') || dbHost.includes('127.0.0.1');

  // 1. Only allow disabling SSL if we are on localhost.
  // This prevents local .env files (DB_SSL=false) from breaking remote cloud DBs on Render.
  if (isLocalHost && dbSslEnv === "false") {
    console.log("🔓 Database SSL disabled for local connection.");
    return false;
  }

  // Base options for secure cloud databases (TiDB Cloud, etc.)
  const baseSSLOptions = {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  };

  // 2. FORCED SSL for Remote/Production/Render
  // If we are NOT on localhost, or we are on Render, or in Production, or DB_SSL=true
  if (!isLocalHost || isRender || isProduction || dbSslEnv === "true") {
    
    // Check for CA certificate file
    if (fs.existsSync(caPath)) {
      console.log(`✅ Using CA certificate for ${isRender ? 'Render' : !isLocalHost ? 'Remote' : 'Secure'} connection.`);
      return {
        ...baseSSLOptions,
        ca: fs.readFileSync(caPath)
      };
    }

    console.log(`🛡️ Enabling secure SSL connection (${isRender ? "Render" : isProduction ? "Production" : !isLocalHost ? "Remote Host" : "Manual"}).`);
    return baseSSLOptions;
  }

  // Default for special local cases
  return false;
};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL configuration
  ssl: getSSLConfig()
});

// Connection test and Auto-Migrations
pool.getConnection()
  .then(connection => {
    console.log("✅ Database connection pool created successfully");
    
    // Auto-migrate: Add is_deleted column if it doesn't exist
    connection.query("ALTER TABLE customer_addresses ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE")
      .then(() => console.log("✅ Auto-migrated: is_deleted column added to customer_addresses"))
      .catch((err) => {
         // Ignore duplicate column errors
         if (err.code !== 'ER_DUP_FIELDNAME') {
             console.error("Migration warning:", err.message);
         }
      })
      .finally(() => {
          // Auto-migrate: Add razorpay_order_id to orders table
          connection.query("ALTER TABLE orders ADD COLUMN razorpay_order_id VARCHAR(255) AFTER coupon_id")
            .then(() => console.log("✅ Auto-migrated: razorpay_order_id added to orders"))
            .catch((err) => {
               if (err.code !== 'ER_DUP_FIELDNAME') {
                   console.error("Migration warning (razorpay):", err.message);
               }
            })
            .finally(() => {
                connection.release();
            });
      });
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
  });

export default pool;
