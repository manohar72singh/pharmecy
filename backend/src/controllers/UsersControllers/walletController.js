import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getWallet = async (req, res) => {
  try {
    // Get or create wallet
    let [wallets] = await pool.query(
      "SELECT * FROM wallets WHERE user_id = ?",
      [req.user.id],
    );

    if (!wallets.length) {
      await pool.query("INSERT INTO wallets (user_id, balance) VALUES (?, 0)", [
        req.user.id,
      ]);
      [wallets] = await pool.query("SELECT * FROM wallets WHERE user_id = ?", [
        req.user.id,
      ]);
    }

    // Transactions
    const [txns] = await pool.query(
      `SELECT * FROM wallet_transactions 
       WHERE user_id = ? ORDER BY id DESC LIMIT 20`,
      [req.user.id],
    );

    return success(
      res,
      {
        wallet: wallets[0],
        transactions: txns,
      },
      "Wallet fetched.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};
