import jwt from "jsonwebtoken";

export function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = header.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Missing token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Set useful properties
        req.user_id = decoded.user_id;
        req.role = decoded.role;

        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

export const authAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader) return res.status(401).json({ error: "Missing token" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden – Admins only" });
        }

        req.user_id = decoded.user_id;
        req.role = "ADMIN";

        next();

    } catch (err) {
        console.error("authAdmin Error:", err);
        res.status(401).json({ error: "Unauthorized" });
    }
};