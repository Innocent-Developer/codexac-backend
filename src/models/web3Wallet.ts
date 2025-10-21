// create a schma foir web 3 wallet create
import mongoose, { Document, Schema } from "mongoose";
export interface IUser extends Document {
  address: string;
  privateKey: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}
const UserSchema: Schema = new Schema(
  {
    address: { type: String, required: true, unique: true },
    privateKey: { type: String, required: true },
    balance: { type: Number, default: 0 },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);
export const User = mongoose.model<IUser>("User", UserSchema);
