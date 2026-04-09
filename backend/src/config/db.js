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
  const isSSL = String(process.env.DB_SSL).trim() === "true";
  
  // If explicitly disabled (e.g. localhost)
  if (String(process.env.DB_SSL).trim() === "false") {
    console.log("🔓 Database SSL disabled for local connection");
    return false;
  }

  // TiDB Cloud / managed DBs usually need these options
  const baseSSLOptions = {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  };

  // Check if CA file exists (for specific custom certs)
  if (fs.existsSync(caPath)) {
    console.log("✅ Using CA certificate for secure connection");
    return {
      ...baseSSLOptions,
      ca: fs.readFileSync(caPath)
    };
  } 
  
  // If DB_SSL is true, provide standard secure connection options
  if (isSSL) {
    console.log("🛡️ Enabling secure SSL connection (Standard)");
    return baseSSLOptions;
  }

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
