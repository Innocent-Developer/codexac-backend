// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import os from "os";
import requestIp from "request-ip";
import cors from "cors";
import cron from "node-cron";

import { connectDB } from "./db/dbconnect";
import router from "./routers/router";
import { applyDailyInterest } from "./stakeCoin/stakeCoins";
// Optional model; safe-guarded at runtime
import AccessLog from "./models/accessLog";

dotenv.config();

const PORT = Number(process.env.PORT || 4000);
const app = express();

connectDB();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://codexac-crypto.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.set("trust proxy", true);
app.use(requestIp.mw());
app.use(express.json());

/**
 * Safely extract a single client IP string from multiple possible sources.
 * Guarantees a string (never undefined) and normalizes ::ffff: IPv4-mapped addresses.
 */
function getClientIp(req: Request): string {
  // Sources that may be present:
  // (req as any).clientIp -> set by request-ip middleware (string|undefined)
  // req.headers['x-forwarded-for'] -> string | string[] | undefined
  // req.headers['x-real-ip'] -> string | undefined (some proxies)
  // req.socket?.remoteAddress -> string | undefined
  const clientIpFromReq: unknown =
    // Cloudflare header (if behind CF)
    req.headers["cf-connecting-ip"] ??
    // Common proxy headers (note: often a CSV for x-forwarded-for)
    req.headers["x-forwarded-for"] ??
    req.headers["x-real-ip"] ??
    // Express-computed IPs (honors trust proxy)
    (Array.isArray((req as any).ips) && (req as any).ips.length > 0 ? (req as any).ips[0] : undefined) ??
    (req as any).ip ??
    // request-ip middleware (fallback)
    (req as any).clientIp ??
    // Fallback to socket
    req.socket?.remoteAddress ??
    "Unknown";

  // Normalize to string safely
  let ipStr: string;
  if (typeof clientIpFromReq === "string") {
    ipStr = clientIpFromReq;
  } else if (Array.isArray(clientIpFromReq) && clientIpFromReq.length > 0) {
    ipStr = String(clientIpFromReq[0]);
  } else {
    ipStr = String(clientIpFromReq ?? "Unknown");
  }

  ipStr = ipStr.trim();

  // if it's a CSV (x-forwarded-for), take the first value
  if (ipStr.includes(",")) {
    ipStr = (ipStr.split(",")[0] ?? "").trim();
  }

  // Normalize IPv6-mapped IPv4 e.g. "::ffff:127.0.0.1"
  if (ipStr.startsWith("::ffff:")) {
    ipStr = ipStr.replace("::ffff:", "");
  }

  // Normalize local IPv6 loopback for readability in dev
  if (ipStr === "::1") {
    ipStr = "127.0.0.1";
  }

  // final fallback
  if (!ipStr) return "Unknown";
  return ipStr;
}

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - start;
    const ip = getClientIp(req);

    const logEntry = {
      ip,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      latencyMs: duration,
      timestamp: new Date(),
      userAgent: req.headers["user-agent"] ?? "",
    };

    console.log(`🌐 ${logEntry.ip} - ${logEntry.method} ${logEntry.path} - ${logEntry.status} - ${logEntry.latencyMs}ms`);

    // OPTIONAL: save to DB (guarded)
    try {
      // if (AccessLog && typeof (AccessLog as any).create === "function") {
      //   await (AccessLog as any).create(logEntry as any);
      // }
    } catch (err) {
      console.error("Failed to save access log:", err);
    }
  });

  next();
});

// /network-info route
app.get("/network-info", async (req: Request, res: Response) => {
  const ip = getClientIp(req);

  // Server-side latency estimation (not a real bandwidth test)
  const start = Date.now();
  await new Promise((r) => setTimeout(r, 50));
  const latency = Date.now() - start;

  let speedEstimate = "Slow";
  if (latency < 100) speedEstimate = "Fast";
  else if (latency < 300) speedEstimate = "Moderate";

  const payload = {
    message: "Network information",
    ip,
    approximateLatencyMs: latency,
    speedEstimate,
    server: {
      host: os.hostname(),
      platform: os.platform(),
    },
  };

  return res.json(payload);
});

app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.send(
    `<h1>🚀 Server running on http://localhost:${PORT} — env=${process.env.NODE_ENV}</h1>
     `
  );
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily interest job...");
  try {
    await applyDailyInterest();
  } catch (err) {
    console.error("applyDailyInterest error:", err);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT} — env=${process.env.NODE_ENV}`);
});
