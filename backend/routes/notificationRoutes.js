import express from "express";
import protect from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  sendBroadcast,
  testNotification
} from "../controllers/notificationController.js";

const router = express.Router();

// User routes
router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.put("/:id/read", protect, markAsRead);
router.put("/mark-all-read", protect, markAllAsRead);
router.delete("/:id", protect, deleteNotification);
router.delete("/read/all", protect, deleteAllRead);
router.post("/test", protect, testNotification);

// Admin routes
router.post("/broadcast", adminAuth, sendBroadcast);

export default router;
