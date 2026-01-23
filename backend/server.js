import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import accidentRoutes from "./routes/accidentRoutes.js";
import http from "http";
import { Server as IOServer } from "socket.io";
import agentRoutes from "./routes/agentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoute.js"
import auditRoutes from "./routes/auditRoutes.js";
import broadcastRoutes from "./routes/brodcastRoutes.js"
import trafficEvidenceRoutes from "./routes/trafficFIRroutes.js";
import adminTrafficRoutes from "./routes/adminTrafficRoutes.js";
import claimSettlementRoutes from "./routes/settlementRoutes.js";
import hotspotRoutes from "./routes/hotspotRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { authLimiter ,uploadLimiter} from "./middleware/rateLimiter.js";
import trafficRoutes from "./routes/trafficRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import helmet from "helmet";

import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import "./config/passport.js";

connectDB();

// Production Environment Validation
if (process.env.NODE_ENV === "production") {
  const requiredEnv = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "BACKEND_URL", "SESSION_SECRET"];
  requiredEnv.forEach(env => {
    if (!process.env[env]) {
      console.warn(`⚠️ Warning: ${env} is missing in production environment!`);
    }
  });
}

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "https://autosureml.onrender.com", "https://autosureai.onrender.com"], 
  credentials: true,
  exposedHeaders: ["X-Cache"]
}));

app.set("trust proxy", 1);

app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || "fallback_secret_for_dev",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        collectionName: "sessions"
    }),
    cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: false, // Disabling CSP temporarily to debug 500 error, can be refined later
}));

app.use("/api/auth", authRoutes);
app.use("/api/accidents", accidentRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/audit-logs", auditRoutes);
app.use("/api/admin/broadcast", broadcastRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/traffic-evidence", uploadLimiter,trafficEvidenceRoutes); 
app.use("/api/admin", adminTrafficRoutes); 
app.use("/api/settlement", claimSettlementRoutes);
app.use("/api/admin/hotspots", hotspotRoutes); 
app.use("/api/admin/export", exportRoutes);
app.use("/api/traffic",trafficRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => res.send("AutoSureAI Backend Running 🚗"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "AutoSureAI API is running",
    timestamp: new Date().toISOString(),
    routes: {
      notifications: "/api/notifications",
      auth: "/api/auth",
      accidents: "/api/accidents"
    }
  });
});

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

export const io = new IOServer(server, {
  cors: { origin: "*" },
});

import { setIO } from "./services/notificationService.js";
setIO(io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });

  socket.on("join_claim", (claimId) => {
    if (claimId) socket.join(`claim_${claimId}`);
  });

  socket.on("send_chat", (msg) => {
    if (msg && msg.claimId) {
      io.to(`claim_${msg.claimId}`).emit("receive_chat", msg);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
