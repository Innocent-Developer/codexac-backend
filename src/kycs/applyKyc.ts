import { Request, Response } from "express";
import { Kyc } from "../models/Kyc.mode";
import { User } from "../models/user.model";

export const applyKyc = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      fullName,
      dateOfBirth,
      address,
      idNumber,
      idType,
      idDocumentUrl,
      livePhotoUrl,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !fullName ||
      !dateOfBirth ||
      !address ||
      !idNumber ||
      !idType ||
      !idDocumentUrl
    ) {
      res.status(400).json({ message: "All required fields must be provided" });
      return;
    }

    // Check if user exists
    const user = await User.findOne({uid:userId});
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Check if KYC already exists for this user
    const existingKyc = await Kyc.findOne({ userId });
    if (existingKyc) {
      res.status(400).json({ message: "KYC application already exists" });
      return;
    }

    // Create new KYC record
    const newKyc = new Kyc({
      userId,
      fullName,
      dateOfBirth,
      address,
      idNumber,
      idType,
      idDocumentUrl,
      livePhotoUrl,
      status: "pending",
    });

    await newKyc.save();

    res
      .status(201)
      .json({ message: "KYC application submitted successfully", kyc: newKyc });
  } catch (error) {
    console.error("Error applying for KYC:", error);
    res.status(500).json({ message: "Server error" });
  }
};
