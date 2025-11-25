import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/user.routes.js";
import resourceRoutes from "./routes/resource.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import path from "path";

dotenv.config();


import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(express.json());

// Serve static HTML files
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html by default
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/bookings", bookingRoutes);

app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});