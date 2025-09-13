import { Request, Response } from "express";
import { Transaction } from "../models/transaction.hash"; // ✅ make sure file name matches

export const getAllTransactionsByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userAddress } = req.params;

        if (!userAddress) {
            res.status(400).json({ message: "User address is required" });
            return;
        };
        const transactions = await Transaction.find({ 
            $or: [ { from: userAddress }, { to: userAddress } ] 
        }).sort({ createdAt: -1 }); //  Sort by most recent first
        res.status(200).json(transactions);

    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Server error" });
        
    }
}