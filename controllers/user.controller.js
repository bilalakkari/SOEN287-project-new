import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        const exists = await pool.query(
            `SELECT 1 FROM tbl_user WHERE email=$1`,
            [email]
        );
        if (exists.rowCount > 0)
            return res.status(400).json({ error: "Email already used" });

        const hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO tbl_user (full_name, email, password_hash)
             VALUES ($1,$2,$3)
             RETURNING user_id, full_name, email, role`,
            [full_name, email, hash]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Registration failed" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            `SELECT * FROM tbl_user WHERE email=$1`,
            [email]
        );

        if (result.rowCount === 0)
            return res.status(404).json({ error: "User not found" });

        const user = result.rows[0];

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const user_id = req.user_id

        const result = await pool.query(
            `SELECT user_id, full_name, email, phone, gender, role, created_at
             FROM tbl_user
             WHERE user_id = $1`,
            [user_id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Could not load profile" });
    }
};

export const updateMyProfile = async (req, res) => {
    try {
        const user_id = req.user_id
        const { full_name, email, phone, gender } = req.body;

        const result = await pool.query(
            `UPDATE tbl_user
             SET full_name=$1, email=$2, phone=$3, gender=$4, updated_at=NOW()
             WHERE user_id=$5
             RETURNING user_id, full_name, email, phone, gender, role`,
            [full_name, email, phone, gender, user_id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to update profile" });
    }
};