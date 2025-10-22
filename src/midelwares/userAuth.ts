import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {User} from "../models/user.model"; // <-- FIX: default import if you exported default User model

interface AuthRequest extends Request {
  user?: any;
  token?: string;
}

const userAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided, please authenticate." });
      return;
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("❌ JWT_SECRET is missing in environment variables.");
      res.status(500).json({ error: "Server configuration error." });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Depending on how you signed your JWT:
    // If you used jwt.sign({ id: user._id }, secret)
    // use decoded.id
    // If you used jwt.sign({ _id: user._id }, secret)
    // use decoded._id
    // If you used jwt.sign({ userId: user._id }, secret)
    // use decoded.userId

    const userId = decoded.id || decoded._id || decoded.userId;
    if (!userId) {
      res.status(401).json({ error: "Invalid token payload." });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(401).json({ error: "User not found, please authenticate." });
      return;
    }

    req.token = token;
    req.user = user;

    next(); // ✅ pass control to next middleware/route
  } catch (error: any) {
    console.error("❌ Auth error:", error.message);
    res.status(401).json({ error: "Authentication failed, please login again." });
  }
};

export default userAuth;
