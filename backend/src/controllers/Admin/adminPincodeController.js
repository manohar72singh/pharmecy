import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getPincodes = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM serviceable_pincodes ORDER BY pincode ASC");
        return success(res, rows, "Pincodes retrieved successfully.");
    } catch (err) {
        console.error(err);
        return error(res, "Failed to retrieve pincodes.", 500);
    }
};

export const addPincode = async (req, res) => {
    try {
        const { pincode, city_name } = req.body;
        if (!pincode) return error(res, "Pincode is required.", 400);

        await pool.query("INSERT INTO serviceable_pincodes (pincode, city_name) VALUES (?, ?)", [pincode, city_name || null]);
        return success(res, null, "Pincode added successfully.", 201);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return error(res, "This pincode is already in the list.", 409);
        }
        console.error(err);
        return error(res, "Failed to add pincode.", 500);
    }
};

export const deletePincode = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM serviceable_pincodes WHERE id = ?", [id]);
        return success(res, null, "Pincode removed successfully.");
    } catch (err) {
        console.error(err);
        return error(res, "Failed to remove pincode.", 500);
    }
};

export const togglePincodeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query("SELECT is_active FROM serviceable_pincodes WHERE id = ?", [id]);
        if (rows.length === 0) return error(res, "Pincode not found.", 404);

        const newStatus = rows[0].is_active ? 0 : 1;
        await pool.query("UPDATE serviceable_pincodes SET is_active = ? WHERE id = ?", [newStatus, id]);
        return success(res, { is_active: newStatus }, "Status updated successfully.");
    } catch (err) {
        console.error(err);
        return error(res, "Failed to update status.", 500);
    }
};
