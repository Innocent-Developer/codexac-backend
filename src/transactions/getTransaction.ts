import { Request, Response } from "express";
import { Transaction } from "../models/transaction.hash"; // ✅ make sure file name matches

export const getTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { transactionHash } = req.params;

    if (!transactionHash) {
      res.status(400).json({ message: "Transaction hash is required" });
      return;
    }

    const transaction = await Transaction.findOne({ transactionHash });

    if (!transaction) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};
