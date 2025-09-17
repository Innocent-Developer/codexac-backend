import express from "express";
import dotenv from "dotenv";
import {connectDB}  from "./db/dbconnect";
import router from "./routers/router";
import cron from "node-cron";
import { applyDailyInterest } from "./stakeCoin/stakeCoins";
import cors from "cors"; 
const PORT = Number(process.env.PORT || 4000);

dotenv.config();



const app = express();
connectDB();

// ✅ CORS must be before routes
app.use(cors({
  origin: ["http://localhost:3000", "https://codexac-crypto.vercel.app/login" ],  // allow React dev frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());
app.use("/api", router);

app.get("/", (req, res) => {
  res.send(`<h1>🚀 Server running on http://localhost:${PORT} — env=${process.env.NODE_ENV}</h1>`);
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily interest job...");
  await applyDailyInterest();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} — env=${process.env.NODE_ENV}`);
})