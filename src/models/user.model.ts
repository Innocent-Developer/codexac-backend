import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  uid: number;
  address: string;
  totalCoins: number;
  ranks: number;
  lastMiningTime?: Date;
  createdAt: Date;
  lastIpAddress?: string;
  lastTransactionDate: Date;
  isVerification: boolean;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  uid: { type: Number, required: true, unique: true },
  address: { type: String, required: true },
  totalCoins: { type: Number, default: 0 },
  ranks: { type: Number, default: 0 },
  lastMiningTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
  lastIpAddress: { type: String, default: null },
  lastTransactionDate: { type: Date, default: null }, // Initialize to epoch start
  isVerification: { type: Boolean, default: false },
});
export const User = mongoose.model<IUser>("User", UserSchema);
