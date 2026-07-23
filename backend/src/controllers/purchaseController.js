const Purchase = require("../models/Purchase");

exports.getUserPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json(purchases);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getAllPurchases = async (_req, res) => {
  try {
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    return res.json(purchases);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};
