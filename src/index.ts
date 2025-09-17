import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/dbconnect";
import router from "./routers/router";
import cron from "node-cron";
import { applyDailyInterest } from "./stakeCoin/stakeCoins";
import cors from "cors";

// Load environment variables
dotenv.config();

const PORT = Number(process.env.PORT || 4000);

const app = express();

// Connect Database
connectDB();

// ✅ Enable CORS
app.use(cors({
  origin: [
    "http://localhost:3000",              // local frontend
    "https://codexac-crypto.vercel.app"  // deployed frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// ✅ Handle preflight requests globally
app.options("*", cors());

// Middleware
app.use(express.json());

// Routes
app.use("/api", router);

app.get("/", (req, res) => {
  res.send(`<h1>🚀 Server running on http://localhost:${PORT} — env=${process.env.NODE_ENV}</h1>`);
});

// Cron job (runs every midnight)
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily interest job...");
  await applyDailyInterest();
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT} — env=${process.env.NODE_ENV}`);
});
