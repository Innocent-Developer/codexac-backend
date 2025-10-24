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
    exists = !!found;
  } while (exists);

  return hash;
}

// fallback address to use when requested receiver doesn't exist
const FALLBACK_ADDRESS = "0xe33fb56a5e4b37d51dd7307e0133c1a6586a41a8";

export const sendCoin = async (req: Request, res: Response) => {
  // start session/transaction
  const session = await User.startSession();
  session.startTransaction();

  try {
    // be permissive about incoming types (number or numeric string)
    const body = req.body as {
      fromAddress?: string;
      toAddress?: string | number;
      amount?: number | string;
    };

    const fromAddress = String(body.fromAddress || "").trim();
    const rawToAddress = body.toAddress;
    const toAddressStr = String(rawToAddress ?? "").trim();
    const parsedAmount = Number(body.amount);

    // basic validation
    if (!fromAddress || !toAddressStr || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid input data" });
    }

    // don't allow sending to same address string
    if (fromAddress === toAddressStr) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Cannot send coins to the same address" });
    }

    // fetch sender within the session
    const sender = await User.findOne({ address: fromAddress }).session(session);
    if (!sender) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Sender address not found" });
    }

    // Determine whether toAddress is a numeric uid or an address.
    const isUid = /^\d+$/.test(toAddressStr);

    let receiver = null as (typeof sender) | null;
    let redirected = false;
    let deliveredTo = toAddressStr; // default log of what user requested

    if (isUid) {
      const uidNum = parseInt(toAddressStr, 10);
      receiver = await User.findOne({ uid: uidNum }).session(session);

      // If receiver exists, check it's not the same user as sender (by uid)
      if (receiver && sender.uid === receiver.uid) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Cannot send coins to the same user" });
      }
    } else {
      // treat as address string
      receiver = await User.findOne({ address: toAddressStr }).session(session);
      // if found and same user, disallow
      if (receiver && sender.uid === receiver.uid) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Cannot send coins to the same user" });
      }
    }

    // fallback to fallback-address user if receiver not found
    if (!receiver) {
      const fallback = await User.findOne({ address: FALLBACK_ADDRESS }).session(session);
      if (!fallback) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Receiver not found & fallback address missing" });
      }
      receiver = fallback;
      redirected = true;
      deliveredTo = FALLBACK_ADDRESS;
    } else {
      // ensure deliveredTo reflects receiver's real on-chain address (if available)
      deliveredTo = receiver.address || deliveredTo;
    }

    const amount = parsedAmount;

    // fee and balance check
    const fee = amount * 0.0001;
    const totalDeduction = amount + fee;

    if ((sender.totalCoins ?? 0) < totalDeduction) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    if (!sender.isVerification) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: "User is not verified" });
    }

    // daily tx limit (5 per day)
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

    // determine next block number
    const lastTx = await Transaction.findOne().sort({ blockNumber: -1 }).session(session);
    const currentBlockNumber = lastTx ? lastTx.blockNumber + 1 : 1;

    // apply transfer
    sender.totalCoins = (sender.totalCoins ?? 0) - totalDeduction;
    receiver.totalCoins = (receiver.totalCoins ?? 0) + amount;

    // save users with session
    await sender.save({ session });
    await receiver.save({ session });

    // unique transaction hash (uses original requested toAddress string for traceability)
    const transactionHash = await generateUniqueTransactionHash(fromAddress, String(rawToAddress), totalDeduction);

    const newTransaction = new Transaction({
      from: fromAddress,
      to: String(rawToAddress), // log original requested target (uid or address)
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
      redirected,
      deliveredTo,
    });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (e) {
      // ignore abort errors
    }
    session.endSession();
    console.error("Error during coin transfer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
