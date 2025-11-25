import pool from "../db.js";

export const getMyNotifications = async (req, res) => {
    try {
        const user_id = req.user_id;

        const q = await pool.query(
            `SELECT notification_id, message, status, created_at
             FROM tbl_notifications
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [user_id]
        );

        res.json(q.rows);

    } catch (err) {
        console.error("Notification Error:", err);
        res.status(500).json({ error: "Failed to load notifications" });
    }
};