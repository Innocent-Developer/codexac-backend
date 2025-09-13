import mongoose, { Document, Schema } from "mongoose";

export interface IStoreIp extends Document {
  storeId: string;   // e.g., userId or entityId
  ip: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreIpSchema: Schema = new Schema(
  {
    storeId: { type: String, required: true },
    ip: { type: String, required: true },
  },
  { timestamps: true } // ✅ auto adds createdAt & updatedAt
);

export default mongoose.model<IStoreIp>("StoreIp", StoreIpSchema);
