import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Transaction } from "../models/transaction.hash";
import crypto from "crypto";

// / Helper: generate guaranteed unique transaction hash
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
    exists = !!found; //  ensures it's boolean
  } while (exists);

  return hash;
}


export const sendCoin = async (req: Request, res: Response) => {
  try {
    const { fromAddress, toAddress, amount } = req.body;

    if (!fromAddress || !toAddress || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    if (fromAddress === toAddress) {
      return res
        .status(400)
        .json({ message: "Cannot send coins to the same address" });
    }

    const sender = await User.findOne({ address: fromAddress });
    const receiver = await User.findOne({ address: toAddress });

    if (!sender) {
      return res.status(404).json({ message: "Sender address not found" });
    }

    if (!receiver) {
      return res.status(404).json({ message: "Receiver address not found" });
    }

    if (sender.totalCoins < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // / Enforce 5 transactions per day limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const txCountToday = await Transaction.countDocuments({
      from: fromAddress,
      createdAt: { $gte: today },
    });

    if (txCountToday >= 5) {
      return res.status(403).json({
        message: "Daily transaction limit reached (5 per day)",
      });
    }

    // / Get next block number
    const lastTx = await Transaction.findOne().sort({ blockNumber: -1 });
    const currentBlockNumber = lastTx ? lastTx.blockNumber + 1 : 1;

    // / Perform transfer
    sender.totalCoins -= amount;
    receiver.totalCoins += amount;
    await sender.save();
    await receiver.save();

    // / Generate unique hash
    const transactionHash = await generateUniqueTransactionHash(
      fromAddress,
      toAddress,
      amount
    );

    // / Save transaction
    const newTransaction = new Transaction({
      from: fromAddress,
      to: toAddress,
      amount,
      blockNumber: currentBlockNumber,
      transactionHash,
    });

    await newTransaction.save();

    return res.status(200).json({
      message: "Transaction successful",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error("Error during coin transfer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
