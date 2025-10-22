import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Transaction } from "../models/transaction.hash";
import crypto from "crypto";

// generate guaranteed unique transaction hash
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
    exists = !!found; // ensures it's boolean
  } while (exists);

  return hash;
}

// fallback address to use when requested receiver doesn't exist
const FALLBACK_ADDRESS = "0xe33fb56a5e4b37d51dd7307e0133c1a6586a41a8";

export const sendCoin = async (req: Request, res: Response) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const { fromAddress, toAddress, amount } = req.body;

    if (!fromAddress || !toAddress || !amount || amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid input data" });
    }

    if (fromAddress === toAddress) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Cannot send coins to the same address" });
    }

    const sender = await User.findOne({ address: fromAddress }).session(session);
    if (!sender) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Sender address not found" });
    }

    // Determine whether toAddress is a numeric uid or an address.
    // User uids are numbers (e.g. "12345" or 12345).
    let receiver = null;
    let redirected = false;
    let deliveredTo = String(toAddress); // by default, reflect original requested toAddress

    // Normalize toAddress to string for checking
    const toAddrStr = String(toAddress).trim();

    // Check if toAddress is a numeric uid (only digits). If so, look up by uid (number).
    const isUid = /^\d+$/.test(toAddrStr);

    if (isUid) {
      const uidNum = parseInt(toAddrStr, 10);
      receiver = await User.findOne({ uid: uidNum }).session(session);
    } else {
      // Not uid → treat as address string
      receiver = await User.findOne({ address: toAddrStr }).session(session);
    }

    if (!receiver) {
      // Receiver not found → fallback to the configured fallback address user
      const fallback = await User.findOne({ address: FALLBACK_ADDRESS }).session(session);
      if (!fallback) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          message: "Receiver not found & fallback address missing",
        });
      }
      receiver = fallback;
      redirected = true;
      deliveredTo = FALLBACK_ADDRESS;
    } else {
      // If receiver found by uid, set deliveredTo to their actual on-chain address
      // If found by address, deliveredTo should be that address (ensure consistent)
      deliveredTo = receiver.address || deliveredTo;
    }

    // Fee and balance check
    const fee = amount * 0.0001;
    const totalDeduction = amount + fee;

    if (sender.totalCoins < totalDeduction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    if (!sender.isVerification) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "User is not verified" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const txCountToday = await Transaction.countDocuments({
      from: fromAddress,
      createdAt: { $gte: today },
    }).session(session);

    if (txCountToday >= 5) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: "Daily transaction limit reached (5 per day)",
      });
    }

    const lastTx = await Transaction.findOne().sort({ blockNumber: -1 }).session(session);
    const currentBlockNumber = lastTx ? lastTx.blockNumber + 1 : 1;

    // Perform transfer (sender -> receiver)
    sender.totalCoins -= totalDeduction;
    receiver.totalCoins += amount;
    await sender.save({ session });
    await receiver.save({ session });

    const transactionHash = await generateUniqueTransactionHash(
      fromAddress,
      String(toAddress), // keep original requested value in hash for traceability
      totalDeduction
    );

    const newTransaction = new Transaction({
      from: fromAddress,
      to: String(toAddress), // always log the original requested address/uid string
      amount,
      fee,
      blockNumber: currentBlockNumber,
      previousBlock: lastTx ? lastTx.blockNumber : 0,
      transactionHash,
    });

    await newTransaction.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Transaction successful",
      transaction: newTransaction,
      redirected,    // returned only in response (NOT saved in DB)
      deliveredTo,   // actual address coins were credited to (NOT saved in DB)
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error during coin transfer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
