import Notification from "../models/Notification.js";

let ioInstance = null;

export const setIO = (io) => {
  ioInstance = io;
};

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  claimId = null,
  reportId = null,
  metadata = {},
  priority = "medium",
  actionUrl = null
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      claimId,
      reportId,
      metadata,
      priority,
      actionUrl
    });

    const populatedNotification = await notification.populate([
      { path: "claimId", select: "status severity estimatedCost" },
      { path: "reportId", select: "prediction location" }
    ]);

    if (ioInstance) {
      ioInstance.to(`user_${userId}`).emit("new_notification", {
        notification: populatedNotification
      });
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const createBulkNotifications = async (notifications) => {
  try {
    const created = await Notification.insertMany(notifications);
    
    if (ioInstance) {
      created.forEach(notification => {
        ioInstance.to(`user_${notification.userId}`).emit("new_notification", {
          notification
        });
      });
    }

    return created;
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    throw error;
  }
};

export const notifyClaimCreated = async (claim, driver) => {
  await createNotification({
    userId: driver._id,
    type: "claim_created",
    title: "Claim Created Successfully",
    message: `Your insurance claim for ${claim.severity} damage has been created and is pending review.`,
    claimId: claim._id,
    reportId: claim.reportId,
    metadata: {
      severity: claim.severity,
      estimatedCost: claim.estimatedCost
    },
    priority: "high",
    actionUrl: `/claim/${claim._id}`
  });
};

export const notifyClaimAssigned = async (claim, agent, driver) => {
  await createNotification({
    userId: agent._id,
    type: "claim_assigned",
    title: "New Claim Assigned",
    message: `You have been assigned a new ${claim.severity} severity claim from ${driver.name}.`,
    claimId: claim._id,
    metadata: {
      driverName: driver.name,
      severity: claim.severity,
      estimatedCost: claim.estimatedCost
    },
    priority: "high",
    actionUrl: `/agent/claim/${claim._id}`
  });

  await createNotification({
    userId: driver._id,
    type: "agent_assigned",
    title: "Agent Assigned to Your Claim",
    message: `Agent ${agent.name} has been assigned to review your claim.`,
    claimId: claim._id,
    metadata: {
      agentName: agent.name
    },
    priority: "medium",
    actionUrl: `/claim/${claim._id}`
  });
};

export const notifyClaimReassigned = async (claim, oldAgent, newAgent, driver) => {
  if (oldAgent) {
    await createNotification({
      userId: oldAgent._id,
      type: "claim_reassigned",
      title: "Claim Reassigned",
      message: `Claim from ${driver.name} has been reassigned to ${newAgent.name}.`,
      claimId: claim._id,
      metadata: {
        newAgentName: newAgent.name
      },
      priority: "medium"
    });
  }

  await createNotification({
    userId: newAgent._id,
    type: "claim_assigned",
    title: "Claim Reassigned to You",
    message: `A ${claim.severity} severity claim from ${driver.name} has been reassigned to you.`,
    claimId: claim._id,
    metadata: {
      driverName: driver.name,
      severity: claim.severity,
      estimatedCost: claim.estimatedCost
    },
    priority: "high",
    actionUrl: `/agent/claim/${claim._id}`
  });

  await createNotification({
    userId: driver._id,
    type: "claim_reassigned",
    title: "Your Claim Has Been Reassigned",
    message: `Your claim is now being handled by Agent ${newAgent.name}.`,
    claimId: claim._id,
    metadata: {
      agentName: newAgent.name
    },
    priority: "medium",
    actionUrl: `/claim/${claim._id}`
  });
};

export const notifyClaimStatusChanged = async (claim, oldStatus, newStatus, driver, agent) => {
  const statusMessages = {
    in_review: "Your claim is now under review",
    approved: "Great news! Your claim has been approved",
    rejected: "Your claim has been rejected",
    settled: "Your claim has been settled"
  };

  const priorities = {
    in_review: "medium",
    approved: "high",
    rejected: "high",
    settled: "urgent"
  };

  await createNotification({
    userId: driver._id,
    type: "claim_status_changed",
    title: `Claim Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
    message: statusMessages[newStatus] || `Your claim status has changed to ${newStatus}`,
    claimId: claim._id,
    metadata: {
      oldStatus,
      newStatus,
      agentName: agent?.name
    },
    priority: priorities[newStatus] || "medium",
    actionUrl: `/claim/${claim._id}`
  });

  if (agent && newStatus === "settled") {
    await createNotification({
      userId: agent._id,
      type: "claim_settled",
      title: "Claim Settled Successfully",
      message: `Claim from ${driver.name} has been settled. Great work!`,
      claimId: claim._id,
      metadata: {
        driverName: driver.name,
        amount: claim.settlementInfo?.amount
      },
      priority: "medium"
    });
  }
};

export const notifyClaimApproved = async (claim, driver, agent) => {
  await createNotification({
    userId: driver._id,
    type: "claim_approved",
    title: "🎉 Claim Approved!",
    message: `Your claim has been approved by ${agent.name}. Settlement will be processed soon.`,
    claimId: claim._id,
    metadata: {
      agentName: agent.name,
      estimatedCost: claim.estimatedCost
    },
    priority: "high",
    actionUrl: `/claim/${claim._id}`
  });
};

export const notifyClaimRejected = async (claim, driver, agent, remarks) => {
  await createNotification({
    userId: driver._id,
    type: "claim_rejected",
    title: "Claim Rejected",
    message: `Your claim has been rejected by ${agent.name}. Reason: ${remarks}`,
    claimId: claim._id,
    metadata: {
      agentName: agent.name,
      remarks
    },
    priority: "high",
    actionUrl: `/claim/${claim._id}`
  });
};

export const notifyClaimSettled = async (claim, driver, settlement) => {
  await createNotification({
    userId: driver._id,
    type: "claim_settled",
    title: "💰 Claim Settled!",
    message: `Your claim has been settled. Amount: $${settlement.amount.toLocaleString()} via ${settlement.method.replace('_', ' ')}.`,
    claimId: claim._id,
    metadata: {
      amount: settlement.amount,
      method: settlement.method,
      reference: settlement.reference
    },
    priority: "urgent",
    actionUrl: `/claim/${claim._id}`
  });
};

export const notifyNewMessage = async (senderId, receiverId, claimId, message) => {
  await createNotification({
    userId: receiverId,
    type: "new_message",
    title: "New Message",
    message: `You have a new message regarding your claim.`,
    claimId,
    metadata: {
      senderId,
      preview: message.substring(0, 50)
    },
    priority: "medium",
    actionUrl: `/claim/${claimId}`
  });
};

export const notifyTrafficVerification = async (report, driver, status) => {
  const statusMessages = {
    verified: "Your accident report has been verified by traffic authorities",
    rejected: "Your accident report verification was rejected",
    pending: "Your accident report is pending traffic verification"
  };

  await createNotification({
    userId: driver._id,
    type: "traffic_verification",
    title: `Traffic Verification: ${status.toUpperCase()}`,
    message: statusMessages[status] || `Traffic verification status: ${status}`,
    reportId: report._id,
    metadata: {
      status,
      location: report.location?.address
    },
    priority: status === "verified" ? "high" : "medium",
    actionUrl: `/my-reports`
  });
};

export const notifyAdminBroadcast = async (userIds, title, message) => {
  const notifications = userIds.map(userId => ({
    userId,
    type: "admin_broadcast",
    title,
    message,
    priority: "high"
  }));

  await createBulkNotifications(notifications);
};

export const notifySystemAnnouncement = async (title, message, userRole = null) => {
  try {
    const User = (await import("../models/User.js")).default;
    const query = userRole ? { role: userRole } : {};
    const users = await User.find(query).select("_id");
    
    const notifications = users.map(user => ({
      userId: user._id,
      type: "system_announcement",
      title,
      message,
      priority: "medium"
    }));

    await createBulkNotifications(notifications);
  } catch (error) {
    console.error("Error creating system announcement:", error);
  }
};

export default {
  createNotification,
  createBulkNotifications,
  notifyClaimCreated,
  notifyClaimAssigned,
  notifyClaimReassigned,
  notifyClaimStatusChanged,
  notifyClaimApproved,
  notifyClaimRejected,
  notifyClaimSettled,
  notifyNewMessage,
  notifyTrafficVerification,
  notifyAdminBroadcast,
  notifySystemAnnouncement
};
