import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    console.log("Fetching notifications for user:", req.user?.id);
    
    if (!req.user?.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = { userId: req.user.id };
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate("claimId", "status severity estimatedCost")
      .populate("reportId", "prediction location")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });

    console.log(`Found ${notifications.length} notifications, ${unreadCount} unread`);

    res.json({
      success: true,
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        unreadCount
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteAllRead = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user.id,
      isRead: true
    });

    res.json({ 
      success: true, 
      message: `${result.deletedCount} notifications deleted` 
    });
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    res.status(500).json({ message: error.message });
  }
};

export const sendBroadcast = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const { notifyAdminBroadcast, notifySystemAnnouncement } = await import("../services/notificationService.js");
    
    if (targetRole && targetRole !== "all") {
      await notifySystemAnnouncement(title, message, targetRole);
    } else {
      await notifySystemAnnouncement(title, message);
    }

    res.json({ 
      success: true, 
      message: "Broadcast notification sent successfully" 
    });
  } catch (error) {
    console.error("Error sending broadcast:", error);
    res.status(500).json({ message: error.message });
  }
};

export const testNotification = async (req, res) => {
  try {
    const { createNotification } = await import("../services/notificationService.js");
    
    await createNotification({
      userId: req.user.id,
      type: "system_announcement",
      title: "Test Notification",
      message: "This is a test notification to verify the system is working correctly.",
      priority: "medium"
    });

    res.json({ 
      success: true, 
      message: "Test notification sent successfully" 
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  sendBroadcast,
  testNotification
};
