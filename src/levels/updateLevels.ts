// create a code that auto update ranks for user depands on totalCoin etc  
import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Types } from "mongoose"; // Add this import

// Update interface with correct _id type
interface BulkWriteOperation {
    updateOne: {
        filter: { _id: Types.ObjectId };
        update: { $set: { ranks: number } };
    }
}

export const updateUserRanks = async (req: Request, res: Response) => {
    try {
        // Get all users sorted by total coins in descending order
        const users = await User.find({}).sort({ totalCoins: -1 });
        const updates: BulkWriteOperation[] = [];

        // Assign ranks based on position (1 is highest)
        users.forEach((user, index) => {
            const newRank = index + 1;
            if (user.ranks !== newRank) {
                updates.push({
                    updateOne: {
                        filter: { _id: user._id },
                        update: { $set: { ranks: newRank } }
                    }
                });
            }
        });

        // Perform bulk update if there are changes
        if (updates.length > 0) {
            await User.bulkWrite(updates);
            return res.status(200).json({
                success: true,
                message: `Updated ranks for ${updates.length} users`,
                updatedCount: updates.length
            });
        }

        return res.status(200).json({
            success: true,
            message: "No rank updates needed",
            updatedCount: 0
        });

    } catch (error) {
        console.error("Error updating ranks:", error);
        return res.status(500).json({
            success: false,
            message: "Error updating user ranks",
            error: (error as Error).message
        });
    }
};

// Function to get user rank and position
export const getUserRankInfo = async (userId: string) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const position = await User.countDocuments({
            totalCoins: { $gt: user.totalCoins }
        });

        return {
            rank: position + 1,
            totalCoins: user.totalCoins,
            totalUsers: await User.countDocuments()
        };
    } catch (error) {
        console.error("Error getting rank info:", error);
        return null;
    }
};

// Automated rank update function (run periodically)
export const autoUpdateRanks = async (): Promise<void> => {
    try {
        const users = await User.find({}).sort({ totalCoins: -1 });
        const updates: BulkWriteOperation[] = [];

        users.forEach((user, index) => {
            const newRank = index + 1;
            if (user.ranks !== newRank) {
                updates.push({
                    updateOne: {
                        filter: { _id: user._id },
                        update: { $set: { ranks: newRank } }
                    }
                });
            }
        });

        if (updates.length > 0) {
            await User.bulkWrite(updates);
            console.log(`Auto rank update completed. Updated ${updates.length} users.`);
        }
    } catch (error) {
        console.error("Error in auto rank update:", error);
    }
};

