const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const { createVehicle, getAllVehicles, searchVehicles } = require("../controllers/vehicleController");

router.get("/search", searchVehicles);
router.get("/", getAllVehicles);
router.post("/", authMiddleware, adminMiddleware, createVehicle);

module.exports = router;
