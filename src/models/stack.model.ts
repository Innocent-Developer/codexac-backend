import mongoose, { Document, Schema } from "mongoose";

export interface IStack extends Document {
  uid: number;
  amount: number;
  months: number;
  interestRate: number; // daily interest in %
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

const StackSchema: Schema = new Schema({
  uid: { type: Number, required: true },
  amount: { type: Number, required: true },
  months: { type: Number, required: true },
  interestRate: { type: Number, required: true }, // % per day
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const Stack = mongoose.model<IStack>("Stack", StackSchema);
