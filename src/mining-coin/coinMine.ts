import { Request, Response } from "express";
import { User } from "../models/user.model";
import StoreIp from "../models/storeIp.model";

// 24 hours cooldown in milliseconds
const MINING_COOLDOWN = 24 * 60 * 60 * 1000;
const REWARD = Number(process.env.FixMiniingRate)||2 ; // fixed reward from env, fallback 10

export const mineCoin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const now = new Date();

    if (user.lastMiningTime) {
      const timeSinceLastMining = now.getTime() - user.lastMiningTime.getTime();

      if (timeSinceLastMining < MINING_COOLDOWN) {
        const remainingHours = Math.ceil(
          (MINING_COOLDOWN - timeSinceLastMining) / (1000 * 60 * 60)
        );
        res.status(429).json({
          message: `You can mine again in ${remainingHours} hour(s)`,
          nextMiningAvailableAt: new Date(user.lastMiningTime.getTime() + MINING_COOLDOWN),
        });
        return;
      }
    }

    //  Add reward & update mining info
    user.totalCoins += REWARD;
    user.lastMiningTime = now;
    user.lastIpAddress = req.ip || req.connection.remoteAddress || "unknown";

    await user.save();

    //  Log IP history
    await StoreIp.create({
      storeId: user.uid.toString(),
      ip: user.lastIpAddress,
    });

    res.status(200).json({
      message: "Mining successful",
      minedCoins: REWARD,
      totalCoins: user.totalCoins,
      lastMiningTime: user.lastMiningTime,
      lastIpAddress: user.lastIpAddress,
      nextMiningAvailableAt: new Date(now.getTime() + MINING_COOLDOWN),
    });
  } catch (error) {
    console.error("Error in mining:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
