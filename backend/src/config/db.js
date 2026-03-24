import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();
const cpath = path.resolve("./ca.pem");
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  port: 4000,
  connectionLimit: 10,
  ssl: {
    ca: fs.readFileSync(cpath),
  },
});

export default pool;
