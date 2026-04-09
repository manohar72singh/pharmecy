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
  const dbSslEnv = String(process.env.DB_SSL).trim().toLowerCase();
  
  const isRender = process.env.RENDER === "true" || !!process.env.RENDER_EXTERNAL_URL;
  const isProduction = process.env.NODE_ENV === "production";
  const isLocalHost = dbHost.includes('localhost') || dbHost.includes('127.0.0.1');

  // 1. Explicitly DISABLED (Only if explicitly set to "false")
  if (dbSslEnv === "false") {
    console.log("🔓 Database SSL explicitly disabled via DB_SSL env var.");
    return false;
  }

  // TiDB Cloud / managed DBs usually need these options
  const baseSSLOptions = {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  };

  // 2. High Priority: Use specific CA certificate file if it exists
  if (fs.existsSync(caPath)) {
    console.log("✅ Using local CA certificate (ca.pem) for secure connection.");
    return {
      ...baseSSLOptions,
      ca: fs.readFileSync(caPath)
    };
  } 
  
  // 3. AUTO-DETECT for Cloud/Production/Remote hosts
  // If we are on Render, in Production, or connecting to a non-local host, we FORCE SSL.
  if (isRender || isProduction || dbSslEnv === "true" || (!isLocalHost && dbHost.length > 0)) {
    console.log(`🛡️ Enabling secure SSL connection (${isRender ? "Render" : isProduction ? "Production" : !isLocalHost ? "Remote Host" : "Manual"})`);
    return baseSSLOptions;
  }

  // 4. Default to false (for local dev without DB_SSL=true)
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

// Connection test
pool.getConnection()
  .then(connection => {
    console.log("✅ Database connection pool created successfully");
    connection.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
  });

export default pool;
