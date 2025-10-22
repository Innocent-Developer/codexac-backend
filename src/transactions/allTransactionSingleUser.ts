// create a code that are use to get all transaction for sender and reciver
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Transaction } from "../models/transaction.hash";

export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { address } = req.params;
        if (!address) {
            res.status(400).json({ message: "Address is required" });
            return;
        }
        const transactions = await Transaction.find({
            $or: [ { from: address }, { to: address } ] 
        }).sort({ createdAt: -1 }); //  Sort by most recent first
        res.status(200).json(transactions); 
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Server error" });
    }
}