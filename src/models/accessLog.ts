// src/models/accessLog.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IAccessLog extends Document {
  ip: string;
  method: string;
  path: string;
  status: number;
  latencyMs: number;
  timestamp: Date;
  userAgent?: string;
}

const AccessLogSchema = new Schema<IAccessLog>(
  {
    ip: { type: String, required: true },
    method: { type: String, required: true },
    path: { type: String, required: true },
    status: { type: Number, required: true },
    latencyMs: { type: Number, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    userAgent: { type: String },
  },
  { collection: "access_logs" }
);

const AccessLog = mongoose.models.AccessLog || mongoose.model<IAccessLog>("AccessLog", AccessLogSchema);
export default AccessLog;
