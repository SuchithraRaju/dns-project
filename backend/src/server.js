import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dnsRoutes from "./routes/dnsRoutes.js";
import { getHistory } from "./services/historyService.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((value) => value.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow server-to-server requests and local health checks without Origin.
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/+$/, "");
    if (allowedOrigins.includes(normalized)) return callback(null, true);
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.status(200).json({ success: true, message: "DNS Response Validation & Diagnostic System API is running" });
});

app.get("/api/health", (_req, res) => {
  const state = mongoose.connection.readyState;
  const database = ({ 0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting" })[state] || "unknown";
  res.status(200).json({
    status: "ok",
    service: "DNS Response Validation & Diagnostic System",
    api: "online",
    database,
    timestamp: new Date().toISOString()
  });
});

app.use("/api/dns", dnsRoutes);

app.get("/api/history", async (_req, res) => {
  try {
    res.status(200).json({
      success: true,
      database: mongoose.connection.readyState === 1 ? "mongodb" : "memory",
      data: await getHistory()
    });
  } catch (error) {
    console.error("History retrieval failed:", error.message);
    res.status(500).json({ success: false, message: "Unable to retrieve query history" });
  }
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled server error:", error);
  res.status(500).json({ success: false, message: "Unexpected server error" });
});

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI is not set; history will use temporary in-memory storage.");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "dnsDiagnosticDB",
      serverSelectionTimeoutMS: 15000
    });
    console.log("MongoDB Atlas connected: dnsDiagnosticDB");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DNS backend listening on port ${PORT}`);
});

connectDatabase();
