import { User } from "../models/user.model";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Validate inputs
    if (!username || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    };
    //check username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate random 6-digit UID
    const uid = Math.floor(100000 + Math.random() * 900000);

    // Generate random crypto address (simulating wallet address)
    const address = "0x" + crypto.randomBytes(20).toString("hex");

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      uid,
      address,
    });

    await newUser.save();

    // Create JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        uid: newUser.uid,
        address: newUser.address,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
