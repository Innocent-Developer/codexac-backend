import mongoose, { Document, Schema } from "mongoose";

export interface IKyc extends Document {
  userId: string;
  fullName: string;
  dateOfBirth: Date;
  address: string;
  idNumber: string;
  idType: string;
  idDocumentUrl: string;
  livePhotoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
};

const KycSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
    idNumber: { type: String, required: true },
    idType: { type: String, required: true },
    idDocumentUrl: { type: String, required: true },
    livePhotoUrl: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
    {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

export const Kyc = mongoose.model<IKyc>("Kyc", KycSchema);