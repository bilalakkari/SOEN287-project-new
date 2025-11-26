import pool from "../db.js";
import { sendEmail } from "../sendEmail.js";

export const sendBroadcastEmail = async (req, res) => {
    try {
        const { subject, message } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ error: "Subject and message required" });
        }

        // Get all emails
        const q = await pool.query(`SELECT email FROM tbl_user`);

        const emails = q.rows.map(r => r.email);

        // Send to all users
        for (const email of emails) {
            sendEmail(email, subject, message);
        }

        res.json({
            success: true,
            message: `Email sent to ${emails.length} users`
        });

    } catch (err) {
        console.error("Broadcast email error:", err);
        res.status(500).json({ error: "Failed to send broadcast email" });
    }
};