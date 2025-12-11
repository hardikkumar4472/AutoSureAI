import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: [
                "claim_created",
                "claim_assigned",
                "agent_assigned",
                "claim_reassigned",
                "claim_status_changed",
                "claim_approved",
                "claim_rejected",
                "claim_settled",
                "new_message",
                "traffic_verification",
                "admin_broadcast",
                "system_announcement"
            ],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        claimId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Claim",
            default: null
        },
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Accident",
            default: null
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },
        actionUrl: {
            type: String,
            default: null
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
