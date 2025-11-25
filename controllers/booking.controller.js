import pool from "../db.js";

// CREATE BOOKING
export const createBooking = async (req, res) => {
    try {
        const user_id = req.user_id;
        const { resource_id, date, start_time, end_time, purpose } = req.body;

        // Build timestamps
        const start_datetime = `${date} ${start_time}:00`;
        const end_datetime = `${date} ${end_time}:00`;

        // Detect conflicts (overlapping bookings)
        const conflict = await pool.query(
            `SELECT 1 
             FROM tbl_bookings
             WHERE resource_id = $1
               AND status IN ('PENDING','APPROVED')
               AND (
                    $2 < end_datetime
                AND $3 > start_datetime
               )`,
            [resource_id, start_datetime, end_datetime]
        );

        if (conflict.rowCount > 0) {
            return res.status(400).json({ error: "This slot is already booked" });
        }

        // Insert booking
        await pool.query(
            `INSERT INTO tbl_bookings 
             (user_id, resource_id, start_datetime, end_datetime, purpose)
             VALUES ($1, $2, $3, $4, $5)`,
            [user_id, resource_id, start_datetime, end_datetime, purpose]
        );

        res.json({ success: true });

    } catch (err) {
        console.error("Create booking error:", err);
        res.status(500).json({
            error: "Failed to create booking",
            details: err.message
        });
    }
};


// USER’S BOOKINGS
export const getMyBookings = async (req, res) => {
    try {
        const user_id = req.user_id;

        const q = await pool.query(
            `SELECT 
                b.booking_id,
                r.name AS resource_name,
                r.location,
                b.start_datetime,
                b.end_datetime,
                b.purpose,
                b.status
             FROM tbl_bookings b
             JOIN tbl_resources r ON r.resource_id = b.resource_id
             WHERE b.user_id = $1
             ORDER BY b.start_datetime DESC`,
            [user_id]
        );

        res.json(q.rows);

    } catch (err) {
        console.error("Get bookings error:", err);
        res.status(500).json({ error: "Failed to load bookings" });
    }
};


// DELETE BOOKING
export const deleteBooking = async (req, res) => {
    try {
        const user_id = req.user_id;
        const booking_id = req.params.booking_id;

        const q = await pool.query(
            `DELETE FROM tbl_bookings
             WHERE booking_id = $1 AND user_id = $2`,
            [booking_id, user_id]
        );

        if (q.rowCount === 0)
            return res.status(400).json({ error: "Booking not found" });

        res.json({ success: true });

    } catch (err) {
        console.error("Delete booking error:", err);
        res.status(500).json({ error: "Failed to delete booking" });
    }
};

export const getNextBooking = async (req, res) => {
    try {
        const user_id = req.user_id;

        const query = `
            SELECT 
                b.booking_id,
                r.name AS resource_name,
                b.start_datetime,
                b.end_datetime,
                b.purpose
            FROM tbl_bookings b
            JOIN tbl_resources r ON r.resource_id = b.resource_id
            WHERE b.user_id = $1
              AND b.start_datetime >= NOW()
            ORDER BY b.start_datetime ASC
            LIMIT 1;
        `;

        const { rows } = await pool.query(query, [user_id]);

        if (rows.length === 0) {
            return res.json({ message: "No upcoming bookings" });
        }

        res.json(rows[0]);

    } catch (err) {
        console.error("Next Booking Error:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// APPROVE BOOKING
export const approveBooking = async (req, res) => {
    try {
        const booking_id = req.params.id;

        // Update booking status
        const q = await pool.query(
            `UPDATE tbl_bookings
             SET status = 'APPROVED'
             WHERE booking_id = $1
             RETURNING user_id, start_datetime`,
            [booking_id]
        );

        if (q.rowCount === 0)
            return res.status(404).json({ error: "Booking not found" });

        const { user_id, start_datetime } = q.rows[0];

        // Insert notification
        await pool.query(
            `INSERT INTO tbl_notifications (user_id, message, status)
             VALUES ($1, $2, 'UNREAD')`,
            [user_id, `Your booking on ${start_datetime} has been approved.`]
        );

        res.json({ success: true, message: "Booking approved" });

    } catch (err) {
        console.error("Approve booking error:", err);
        res.status(500).json({ error: "Failed to approve booking" });
    }
};


// DENY BOOKING
export const denyBooking = async (req, res) => {
    try {
        const booking_id = req.params.id;

        // Update booking status
        const q = await pool.query(
            `UPDATE tbl_bookings
             SET status = 'DENIED'
             WHERE booking_id = $1
             RETURNING user_id, start_datetime`,
            [booking_id]
        );

        if (q.rowCount === 0)
            return res.status(404).json({ error: "Booking not found" });

        const { user_id, start_datetime } = q.rows[0];

        // Insert notification
        await pool.query(
            `INSERT INTO tbl_notifications (user_id, message, status)
             VALUES ($1, $2, 'UNREAD')`,
            [user_id, `Your booking on ${start_datetime} has been denied.`]
        );

        res.json({ success: true, message: "Booking denied" });

    } catch (err) {
        console.error("Deny booking error:", err);
        res.status(500).json({ error: "Failed to deny booking" });
    }
};

// ADMIN - GET ALL PENDING BOOKING REQUESTS
export const getPendingRequests = async (req, res) => {
    try {
        const q = await pool.query(
            `SELECT 
                b.booking_id,
                b.user_id,
                b.start_datetime,
                b.end_datetime,
                b.purpose,
                b.status,
                u.full_name,
                u.email,
                r.name AS resource_name
             FROM tbl_bookings b
             JOIN tbl_user u ON u.user_id = b.user_id
             JOIN tbl_resources r ON r.resource_id = b.resource_id
             WHERE b.status = 'PENDING'
             ORDER BY b.start_datetime ASC`
        );

        res.json(q.rows);

    } catch (err) {
        console.error("Get Pending Requests Error:", err);
        res.status(500).json({ error: "Failed to load pending requests" });
    }
};

export const getRequestHistory = async (req, res) => {
    try {
        const q = await pool.query(`
            SELECT 
                b.booking_id,
                b.user_id,
                b.status,
                b.start_datetime,
                b.end_datetime,
                b.purpose,
                u.full_name,
                r.name AS resource_name
            FROM tbl_bookings b
            JOIN tbl_user u ON u.user_id = b.user_id
            JOIN tbl_resources r ON r.resource_id = b.resource_id
            WHERE b.status IN ('APPROVED', 'DENIED')
            ORDER BY b.start_datetime DESC
        `);

        res.json(q.rows);
    } catch (err) {
        console.error("History error:", err);
        res.status(500).json({ error: "Failed to load history" });
    }
};