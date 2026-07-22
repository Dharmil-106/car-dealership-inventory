const bcrypt = require("bcrypt");
const User = require("../models/User");

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password and create user — role is always "customer"
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      email,
      password: hashedPassword,
      role: "customer",
    });

    return res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};
