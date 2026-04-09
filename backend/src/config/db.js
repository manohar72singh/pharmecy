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
  const dbHost = process.env.DB_HOST || '';
  const isSSL = String(process.env.DB_SSL).trim() === "true";
  const isExplicitlyDisabled = String(process.env.DB_SSL).trim() === "false";
  const isLocal = dbHost.includes('localhost') || dbHost.includes('127.0.0.1');
  
  // Base SSL options
  const baseSSLOptions = {
    rejectUnauthorized: true,
    minVersion: 'TLSv1.2'
  };

  // 1. If CA certificate exists, use it (highest priority)
  if (fs.existsSync(caPath)) {
    console.log("✅ Using CA certificate for secure connection");
    return {
      ...baseSSLOptions,
      ca: fs.readFileSync(caPath)
    };
  }

  // 2. If connecting to a remote host (like TiDB Cloud), force SSL
  // Most cloud providers prohibit insecure connections.
  if (!isLocal && dbHost.length > 0 && dbHost !== 'localhost') {
    console.log(`🛡️ Remote host detected (${dbHost}), ensuring secure SSL connection`);
    return baseSSLOptions;
  }

  // 3. If explicitly requested via environment variable
  if (isSSL) {
    console.log("🛡️ Enabling secure SSL connection (Standard)");
    return baseSSLOptions;
  }

  // Default for local development
  console.log("🔓 Database SSL disabled for local connection");
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
