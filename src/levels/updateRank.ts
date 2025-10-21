import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Document, Model } from 'mongoose';

// Interface for User document
interface IUser {
  totalCoin: number;
  ranks: number;
}

// Interface for User model
interface IUserDocument extends IUser, Document {
  save(): Promise<IUserDocument>;
}

// Import User model with proper type
import { User } from '../models/user.model';

export const updateUserRanks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all users sorted by totalCoin in descending order
    const users: IUserDocument[] = await User.find().sort({ totalCoin: -1 });
    
    // Update each user's rank based on their position in the sorted list
    for (let i = 0; i < users.length; i++) {
      users[i].ranks = i + 1; // Rank starts from 1
      await users[i].save();
    }
    
    res.status(200).json({ message: "User ranks updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user ranks", error });
  }
});

// auto update user rank function
export const autoUpdateUserRanks = async (): Promise<void> => {
  try {
    const users: IUserDocument[] = await User.find().sort({ totalCoin: -1 });
    
    for (let i = 0; i < users.length; i++) {
      users[i].ranks = i + 1;
      await users[i].save();
    }
    
    console.log("User ranks updated successfully");
  } catch (error) {
    console.error("Error updating user ranks:", error);
  }
};