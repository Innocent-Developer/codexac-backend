// get user data by address
import { Request, Response } from "express";
import { User } from "../models/user.model";

export const getUserDataByAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    if (!address) {
      res.status(400).json({ message: "Address parameter is required" });
      return;
    }
    const user = await User.findOne({ address }, {
      _id: 0,
      uid: 1,
        address: 1,
        totalCoins: 1,
        ranks: 1,
        lastTransactionDate: 1,

    }).lean();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user);
  }
    catch (error) {
    console.error("Error fetching user by address:", error);
    res.status(500).json({ message: "Internal server error" });
  } 
};