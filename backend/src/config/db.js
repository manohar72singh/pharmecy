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

// SSL configuration - dynamic based on environment
const getSSLConfig = () => {
  // Check if DB_SSL is explicitly set to false
  if (String(process.env.DB_SSL).trim() === "false") {
    console.log("🔓 Database SSL disabled for local connection");
    return false;
  }

  // Check if CA file exists
  if (fs.existsSync(caPath)) {
    console.log("✅ Using CA certificate for secure connection");
    return {
      ca: fs.readFileSync(caPath),
      rejectUnauthorized: true
    };
  } else {
    // If we're on a server and DB_SSL is true but ca.pem isn't there, 
    // try standard SSL or return false if we're not sure
    console.log("⚠️ CA certificate not found, checking SSL status...");
    return process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : false;
  }
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
