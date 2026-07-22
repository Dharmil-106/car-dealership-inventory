const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const { createVehicle } = require("../controllers/vehicleController");

router.post("/", authMiddleware, adminMiddleware, createVehicle);

module.exports = router;
