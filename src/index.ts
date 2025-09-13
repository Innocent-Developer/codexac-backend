import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/dbconnect.js";
import router from "./routers/router.js";
import cron from "node-cron";
import { applyDailyInterest } from "./stakeCoin/stakeCoins.js";

dotenv.config();

const PORT = Number(process.env.PORT || 4000);

const app = express();
connectDB();

app.use(express.json());
app.use("/api", router);

// ✅ Default route - show server running message on webpage
app.get("/", (req, res) => {
  res.send(`<h1>🚀 Server running on http://localhost:${PORT} — env=${process.env.NODE_ENV}</h1>`);
});

// stack method every midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily interest job...");
  await applyDailyInterest();
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT} — env=${process.env.NODE_ENV}`);
});
