import http from "http";
import { Server as IOServer } from "socket.io";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

app.get("/", (req, res) => res.send("Socket Server Running ⚡"));

const PORT = process.env.SOCKET_PORT || 9000;
const server = http.createServer(app);

const io = new IOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

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

server.listen(PORT, () => {
  console.log(`⚡ Socket server running on port ${PORT}`);
});
