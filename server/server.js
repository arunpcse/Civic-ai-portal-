const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const staffRoutes = require("./routes/staffRoutes");
const aiRoutes = require("./routes/aiRoutes");
const seedRoutes = require("./routes/seedRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const locationRoutes = require("./routes/locationRoutes");

console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);

const app = express();

// Enable CORS for all origins and headers (needed for Vercel -> Render cross-origin calls)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/locations", locationRoutes);

connectDB();

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CivicAI Tamil Nadu Government API is running",
    endpoints: {
      auth: "/api/auth",
      complaints: "/api/complaints",
      departments: "/api/departments",
      staff: "/api/staff",
      locations: "/api/locations",
      ai: "/api/ai",
      seed: "/api/seed",
    },
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});