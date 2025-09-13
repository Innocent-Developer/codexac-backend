import express from "express";
import dotenv from "dotenv";
import {connectDB}  from "./db/dbconnect";
import router from "./routers/router";
import cron from "node-cron";
import { applyDailyInterest } from "./stakeCoin/stakeCoins";
const PORT = Number(process.env.PORT || 4000);

dotenv.config();



const app = express();
connectDB();

app.use(express.json());
app.use("/api", router);



//stack method every midnight
cron.schedule("0 0 * * *", async () => {
  console.log(" Running daily interest job...");
  await applyDailyInterest();
});
app.listen(PORT, () => {
  
  console.log(`Server running on http://localhost:${PORT} — env=${process.env.NODE_ENV}`);
})