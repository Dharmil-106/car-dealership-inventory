const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const { createVehicle, getAllVehicles, searchVehicles, updateVehicle, deleteVehicle, purchaseVehicle, restockVehicle } = require("../controllers/vehicleController");

router.get("/search", searchVehicles);
router.get("/", getAllVehicles);
router.post("/", authMiddleware, adminMiddleware, createVehicle);
router.put("/:id", authMiddleware, adminMiddleware, updateVehicle);
router.delete("/:id", authMiddleware, adminMiddleware, deleteVehicle);
router.post("/:id/purchase", authMiddleware, purchaseVehicle);
router.post("/:id/restock", authMiddleware, adminMiddleware, restockVehicle);

module.exports = router;
