import User from "../models/User.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!req.body || !name || !email || !password) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    const token = generateToken(newUser._id);
    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!req.body || !email || !password) {
      return res.status(400).json({ msg: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};
