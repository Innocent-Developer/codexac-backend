import { Request, Response } from "express";
import { Transaction } from "../models/transaction.hash";

// Leaderboard: top users by total transaction volume
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const leaderboard = await Transaction.aggregate([
      {
        $group: {
          _id: "$from",
          totalSent: { $sum: "$amount" },
          txCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalSent: -1 } // sort by total sent (highest first)
      },
      {
        $limit: 10 // only top 10
      }
    ]);

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ message: "Server error" });
  }
};
