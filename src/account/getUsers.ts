import { Request, Response } from "express";
import { User } from "../models/user.model";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, { 
      _id: 0, 
      address: 1, 
      totalCoins: 1 ,
      ranks:1,
      lastTransactionDate:1
    }).lean();

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
