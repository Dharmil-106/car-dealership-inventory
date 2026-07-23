const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (_req, res) => {
  res.json({
    message: "Car Dealership Inventory API",
    status: "online",
    healthCheck: "/api/health",
    documentation: "See README.md for endpoint documentation"
  });
});

// Health-check route
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Routes
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/purchases", purchaseRoutes);

module.exports = app;
