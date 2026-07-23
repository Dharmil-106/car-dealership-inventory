const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const { getUserPurchases, getAllPurchases } = require("../controllers/purchaseController");

router.get("/all", authMiddleware, adminMiddleware, getAllPurchases);
router.get("/", authMiddleware, getUserPurchases);

module.exports = router;
