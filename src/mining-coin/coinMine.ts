import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/user.model";
import StoreIp from "../models/storeIp.model";
import { Transaction } from "../models/transaction.hash";
import crypto from "crypto";

async function generateUniqueTransactionHash(
  from: string,
  to: string,
  amount: number
): Promise<string> {
  let hash: string;
  let exists = true;
  do {
    hash = crypto
      .createHash("sha256")
      .update(
        `${from}-${to}-${amount}-${Date.now()}-${Math.random()}-${crypto.randomUUID()}`
      )
      .digest("hex");

    const found = await Transaction.exists({ transactionHash: hash });
    exists = !!found;
  } while (exists);

  return hash;
}

// Cooldown: 24 hours
const MINING_COOLDOWN = 24 * 60 * 60 * 1000;
const REWARD = Number(process.env.FixMiniingRate) || 2;

export const mineCoin = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, ipaddress } = req.body;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const now = new Date();

    // check mining cooldown
    if (user.lastMiningTime) {
      const timeSinceLastMining = now.getTime() - user.lastMiningTime.getTime();
      if (timeSinceLastMining < MINING_COOLDOWN) {
        const remainingHours = Math.ceil(
          (MINING_COOLDOWN - timeSinceLastMining) / (1000 * 60 * 60)
        );
        res.status(429).json({
          message: `You can mine again in ${remainingHours} hour(s)`,
          nextMiningAvailableAt: new Date(
            user.lastMiningTime.getTime() + MINING_COOLDOWN
          ),
        });
        return;
      }
    }

    // determine block number
    const lastTx = await Transaction.findOne()
      .sort({ blockNumber: -1 })
      .session(session);

    const previousBlock = lastTx ? lastTx.blockNumber : 0;
    const blockNumber = previousBlock + 1;

    // update user
    user.totalCoins += REWARD;
    user.lastMiningTime = now;
    user.lastIpAddress = req.ip || ipaddress || "unknown";

    // generate transaction hash
    const transactionHash = await generateUniqueTransactionHash(
      "SYSTEM",
      user.uid.toString(),
      REWARD
    );

    // create transaction record
    const transaction = new Transaction({
      from: "SYSTEM",
      to: user.uid.toString(),
      amount: REWARD,
      transactionHash,
      blockNumber,
      previousBlock,
      timestamp: now,
      fee: 0,
    });

    try {
      console.log("📌 Saving transaction:", transaction);
      await transaction.save({ session });
      console.log("✅ Transaction saved successfully");
    } catch (err: any) {
      console.error("❌ Transaction save failed:", {
        message: err.message,
        name: err.name,
        code: err.code,
        stack: err.stack,
        errors: err.errors,
      });
      throw err;
    }

    // save user
    await user.save({ session });

    // log ip history
    try {
      await StoreIp.create(
        [
          {
            storeId: user.uid.toString(),
            ip: user.lastIpAddress,
          },
        ],
        { session }
      );
      console.log("✅ StoreIp saved successfully");
    } catch (err: any) {
      console.error("❌ StoreIp save failed:", {
        message: err.message,
        name: err.name,
        code: err.code,
        stack: err.stack,
        errors: err.errors,
      });
      throw err;
    }

    // commit transaction
    await session.commitTransaction();

    res.status(200).json({
      message: "Mining successful",
      minedCoins: REWARD,
      totalCoins: user.totalCoins,
      lastMiningTime: user.lastMiningTime,
      lastIpAddress: user.lastIpAddress,
      nextMiningAvailableAt: new Date(now.getTime() + MINING_COOLDOWN),
    });
  } catch (error) {
    console.error("❌ Error in mining:", error);
    await session.abortTransaction();
    res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};
