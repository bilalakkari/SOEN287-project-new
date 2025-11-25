import pool from "../db.js";

// Admin creates a resource
export const createResource = async (req, res) => {
    try {
        const { name, description, location, capacity } = req.body;

        const result = await pool.query(
            `INSERT INTO tbl_resources (name, description, location, capacity)
             VALUES ($1,$2,$3,$4)
             RETURNING *`,
            [name, description, location, capacity]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to create resource" });
    }
};

// List all resources
export const getResources = async (req, res) => {
    const result = await pool.query("SELECT * FROM tbl_resources");
    res.json(result.rows);
};

// Admin adds availability (weekly schedule)
export const addAvailability = async (req, res) => {
    const { resource_id, day_of_week, start_time, end_time } = req.body;

    try {
        const conflict = await pool.query(
            `SELECT 1
             FROM tbl_resource_availability
             WHERE resource_id=$1
               AND day_of_week=$2
               AND ($3 < end_time AND $4 > start_time)`,
            [resource_id, day_of_week, start_time, end_time]
        );

        if (conflict.rowCount > 0)
            return res.status(400).json({ error: "Overlap detected" });

        const result = await pool.query(
            `INSERT INTO tbl_resource_availability (resource_id, day_of_week, start_time, end_time)
             VALUES ($1,$2,$3,$4)
             RETURNING *`,
            [resource_id, day_of_week, start_time, end_time]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to add availability" });
    }
};

// Admin adds blackout dates
export const addBlackout = async (req, res) => {
    const { resource_id, start_datetime, end_datetime, reason } = req.body;

    const result = await pool.query(
        `INSERT INTO tbl_resource_blackout (resource_id, start_datetime, end_datetime, reason)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
        [resource_id, start_datetime, end_datetime, reason]
    );

    res.json(result.rows[0]);
};

// GET weekly availability list
export const getAvailability = async (req, res) => {
    const resource_id = req.params.resource_id;

    const result = await pool.query(
        `SELECT day_of_week, start_time, end_time
         FROM tbl_resource_availability
         WHERE resource_id=$1
         ORDER BY 
           CASE day_of_week
               WHEN 'MON' THEN 1 WHEN 'TUE' THEN 2 WHEN 'WED' THEN 3
               WHEN 'THU' THEN 4 WHEN 'FRI' THEN 5 WHEN 'SAT' THEN 6 WHEN 'SUN' THEN 7
           END, start_time`,
        [resource_id]
    );

    res.json(result.rows);
};

// GET availability for specific date (with booked slots removed)
export async function getResourceAvailability(req, res) {
    try {
        const resource_id = req.params.resource_id;
        const date = req.query.date;

        if (!date)
            return res.status(400).json({ error: "Date is required" });

        // Fetch base schedule rules
        const base = await pool.query(
            `SELECT day_of_week, start_time, end_time
             FROM tbl_resource_availability
             WHERE resource_id = $1`,
            [resource_id]
        );

        if (base.rowCount === 0)
            return res.json([]);

        const weekday = new Date(date)
            .toLocaleString("en-us", { weekday: "short" })
            .toUpperCase();

        const rules = base.rows.filter(r => r.day_of_week === weekday);
        if (rules.length === 0)
            return res.json([]);

        // Fetch booked times
        const booked = await pool.query(
            `SELECT 
                 start_datetime::time AS start_time,
                 end_datetime::time AS end_time
             FROM tbl_bookings
             WHERE resource_id = $1
               AND start_datetime::date = $2
               AND status IN ('PENDING','APPROVED')`,
            [resource_id, date]
        );

        const bookedSlots = booked.rows;

        const slots = [];

        for (let r of rules) {
            // FIX: ensure we always get a clean HH:MM
            const startStr = r.start_time.toString().substring(0, 5);
            const endStr = r.end_time.toString().substring(0, 5);

            let startHour = parseInt(startStr.split(":")[0]);
            let endHour = parseInt(endStr.split(":")[0]);

            for (let hour = startHour; hour < endHour; hour++) {
                const slotStart = `${String(hour).padStart(2, "0")}:00`;
                const slotEnd = `${String(hour + 1).padStart(2, "0")}:00`;

                const isBooked = bookedSlots.some(b =>
                    b.start_time.toString().substring(0, 5) === slotStart &&
                    b.end_time.toString().substring(0, 5) === slotEnd
                );

                slots.push({
                    start: slotStart,
                    end: slotEnd,
                    available: !isBooked
                });
            }
        }

        res.json(slots);

    } catch (err) {
        console.error("Availability error:", err);
        res.status(500).json({
            error: "Failed to load availability",
            details: err.message,
        });
    }
}

export const getResourceCount = async (req, res) => {
    try {
        const q = await pool.query(
            `SELECT COUNT(*) AS count FROM tbl_resources`
        );

        res.json({ count: Number(q.rows[0].count) });

    } catch (err) {
        console.error("Resource Count Error:", err);
        res.status(500).json({ error: "Failed to load resource count" });
    }
};