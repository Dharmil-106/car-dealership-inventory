const Vehicle = require("../models/Vehicle");

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

