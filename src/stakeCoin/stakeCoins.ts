import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Stack } from "../models/stack.model";

// Create a new stack
export const createStack = async (req: Request, res: Response) => {
  try {
    const { uid, amount, months, interestRate } = req.body;

    if (!uid || !amount || !months || !interestRate) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const user = await User.findOne({ uid });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.totalCoins < amount) {
      res.status(400).json({ message: "Insufficient balance" });
      return;
    }

    // Deduct staking amount
    user.totalCoins -= amount;
    await user.save();

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + months);

    const stack = new Stack({
      uid,
      amount,
      months,
      interestRate,
      startDate,
      endDate,
      isActive: true,
    });

    await stack.save();

    res.status(201).json({
      message: "Stack created successfully",
      stack,
      userBalance: user.totalCoins,
    });
  } catch (error) {
    console.error("Error creating stack:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Daily interest job
export const applyDailyInterest = async () => {
  try {
    const activeStacks = await Stack.find({ isActive: true });

    for (const stack of activeStacks) {
      const user = await User.findOne({ uid: stack.uid });
      if (!user) continue;

      const now = new Date();

      //  If staking period is over
      if (now >= stack.endDate) {
        stack.isActive = false;

        //  Return original staked amount back to user
        user.totalCoins += stack.amount;

        await stack.save();
        await user.save();

        console.log(
          `Stack ended for UID ${stack.uid}. Returned ${stack.amount} coins to user.`
        );
        continue;
      }

      //  Otherwise, apply daily interest
      const dailyInterest = (stack.amount * stack.interestRate) / 100;
      user.totalCoins += dailyInterest;

      await user.save();

      console.log(
        `Applied ${dailyInterest} coins as daily interest to UID ${stack.uid}.`
      );
    }

    console.log("Daily interest + end-of-stack updates applied successfully.");
  } catch (error) {
    console.error("Error applying daily interest:", error);
  }
};
