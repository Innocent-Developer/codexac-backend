import { User } from "../models/user.model";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { generateCode } from "../unilte/generateCode";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, referralCode } = req.body;

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
    }
    //check username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // check referral code
    if (referralCode) {
      const refUser = await User.findOne({ inviteCode: referralCode });
      if (!refUser) {
        return res.status(400).json({ message: "Invalid referral code" });
      }
      // add 10 coins to refUser
      refUser.totalCoins += 10;
      await refUser.save();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate random 6-digit UID
    const uid = generateCode();

    // Generate wallet  address
    const address = "0x" + crypto.randomBytes(20).toString("hex");
    // generate invite code
    let inviteCode = generateCode();
    // ensure invite code is unique
    while (await User.findOne({ inviteCode })) {
      inviteCode = generateCode();
    }
    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      uid,
      inviteCode,
      address,
    });

    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id ,
      uid: newUser.uid,
      address: newUser.address,
      totalCoins: newUser.totalCoins,
      isVerification: newUser.isVerification,
      createdAt: newUser.createdAt
      },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: "7d",
      }
    );

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
