import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import missionRoutes from "./routes/missions.js";
import droneRoutes from "./routes/drones.js";
import reportRoutes from "./routes/reports.js";
import { connectDB } from "./database/connect.js";
import rateLimit from "express-rate-limit";
import { chatbotHandler } from "./services/chatbotService.js";
import winston from "winston";

dotenv.config();

// Logger setup
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "server.log" }),
  ],
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // 100 requests per IP
    message: "Too many requests from this IP, please try again later.",
  })
);

// Routes
app.use("/api/missions", missionRoutes);
app.use("/api/drones", droneRoutes);
app.use("/api/reports", reportRoutes);

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.stack}`);
  res.status(500).json({ message: "Internal server error" });
});

// Socket.IO
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on("join-mission", (missionId) => {
    socket.join(`mission-${missionId}`);
    logger.info(`Client ${socket.id} joined mission-${missionId}`);
  });

  socket.on("drone-update", (data) => {
    try {
      io.to(`mission-${data.missionId}`).emit("drone-position", data);
      logger.info(`Drone update sent for mission-${data.missionId}`);
    } catch (error) {
      logger.error(`Drone update error: ${error.message}`);
    }
  });

  // Chatbot
  socket.on("chat-message", async (msg) => {
    try {
      await chatbotHandler(socket, msg);
      logger.info(`Chat message processed: ${msg}`);
    } catch (error) {
      logger.error(`Chatbot error: ${error.message}`);
      if (error.message.includes("quota")) {
        socket.emit(
          "chat-response",
          "Chatbot quota exceeded. Please try again later."
        );
      } else {
        socket.emit(
          "chat-response",
          "Sorry, something went wrong with the chatbot."
        );
      }
    }
  });

  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  socket.on("error", (error) => {
    logger.error(`Socket error: ${error.message}`);
  });
});

// Start server
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  });
