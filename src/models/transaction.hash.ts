import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  from: string;
  to: string;
  amount: number;
  blockNumber: number;
  previousBlock:number;
  transactionHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
    previousBlock:{type:Number,required:true},
    blockNumber: { type: Number },
    transactionHash: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true, //  adds createdAt & updatedAt automatically
  }
);

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);
