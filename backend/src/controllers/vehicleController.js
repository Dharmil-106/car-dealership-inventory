const Vehicle = require("../models/Vehicle");
const Purchase = require("../models/Purchase");

exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    return res.status(201).json(vehicle);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getAllVehicles = async (_req, res) => {
  try {
    const vehicles = await Vehicle.find();
    return res.json(vehicles);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.searchVehicles = async (req, res) => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;
    const filter = {};

    if (make) filter.make = make;
    if (model) filter.model = model;
    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(filter);
    return res.json(vehicles);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    return res.json(vehicle);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    return res.json({ message: "Vehicle deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.purchaseVehicle = async (req, res) => {
  try {
    if (req.user && req.user.role === "admin") {
      return res.status(403).json({ error: "Admins cannot purchase vehicles" });
    }

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    if (vehicle.quantity <= 0) {
      return res.status(400).json({ error: "Vehicle out of stock" });
    }

    vehicle.quantity -= 1;
    await vehicle.save();

    await Purchase.create({
      user: req.user.id,
      vehicleId: vehicle._id,
      make: vehicle.make,
      model: vehicle.model,
      category: vehicle.category,
      price: vehicle.price,
    });

    return res.json({ id: vehicle._id, quantity: vehicle.quantity });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

exports.restockVehicle = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    vehicle.quantity += amount;
    await vehicle.save();

    return res.json({ id: vehicle._id, quantity: vehicle.quantity });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};
