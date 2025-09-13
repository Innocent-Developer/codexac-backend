import { Request, Response } from "express";
import { Transaction } from "../models/transaction.hash"; // ✅ make sure file name matches

export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 }); //  Sort by newest first     
    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Server error" });
  } 
};