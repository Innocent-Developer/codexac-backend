import { Request, Response } from "express";
import { User } from "../models/user.model";

export const getUserByUid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uid } = req.params;

    if (!uid) {
      res.status(400).json({ message: "UID is required" });
      return;
    }

    const user = await User.findOne({ uid: Number(uid) }).select("-password"); // exclude password

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error fetching user by UID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
