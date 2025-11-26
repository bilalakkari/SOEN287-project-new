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

export const statistics = async (req, res) => {
    try {
        const totalBookings = await pool.query(`
            SELECT COUNT(*) AS total 
            FROM tbl_bookings;
        `);

        const totalUsers = await pool.query(`
            SELECT COUNT(*) AS total 
            FROM tbl_user;
        `);

        const totalResources = await pool.query(`
            SELECT COUNT(*) AS total 
            FROM tbl_resources;
        `);

        const mostUsed = await pool.query(`
            SELECT r.name, COUNT(*) AS count
            FROM tbl_bookings b
            INNER JOIN tbl_resources r ON b.resource_id = r.resource_id
            GROUP BY r.name
            ORDER BY count DESC
            LIMIT 1;
        `);

        const topResources = await pool.query(`
            SELECT r.name, COUNT(*) AS count
            FROM tbl_bookings b
            INNER JOIN tbl_resources r ON b.resource_id = r.resource_id
            GROUP BY r.name
            ORDER BY count DESC
            LIMIT 5;
        `);

        res.json({
            total_bookings: Number(totalBookings.rows[0].total),
            total_users: Number(totalUsers.rows[0].total),
            total_resources: Number(totalResources.rows[0].total),
            most_used_resource: mostUsed.rows[0]?.name || "No bookings yet",
            most_used_count: Number(mostUsed.rows[0]?.count || 0),
            top_resources: topResources.rows || []
        });

    } catch (err) {
        console.error("Statistics Error:", err);
        res.status(500).json({ error: "Failed to load statistics" });
    }
};
