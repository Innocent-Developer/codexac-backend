import { Request, Response } from "express";
import { Kyc } from "../models/Kyc.mode";
import { User } from "../models/user.model";

export const getKycStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Check if user exists by uid
    const user = await User.findOne({ uid: userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Find KYC record for this uid
    const kycRecord = await Kyc.findOne({ userId });
    if (!kycRecord) {
      res.status(404).json({ message: "KYC record not found" });
      return;
    }

    res.status(200).json({ status: kycRecord.status });
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
