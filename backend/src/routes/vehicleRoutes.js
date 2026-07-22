const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const { createVehicle, getAllVehicles, searchVehicles, updateVehicle, deleteVehicle, purchaseVehicle } = require("../controllers/vehicleController");

router.get("/search", searchVehicles);
router.get("/", getAllVehicles);
router.post("/", authMiddleware, adminMiddleware, createVehicle);
router.put("/:id", authMiddleware, adminMiddleware, updateVehicle);
router.delete("/:id", authMiddleware, adminMiddleware, deleteVehicle);
router.post("/:id/purchase", authMiddleware, purchaseVehicle);

module.exports = router;

