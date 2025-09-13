import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in environment");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      // options are inferred by mongoose 7+, no need to pass many options
    } as mongoose.ConnectOptions);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
