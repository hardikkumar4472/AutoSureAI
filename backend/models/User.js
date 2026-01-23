import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    phone: String,
    vehicleNumber: { type: String, unique: true, sparse: true },
    googleId: { type: String, unique: true, sparse: true },
    avatar: String,
    password: { type: String, select: false },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },

    role: {
      type: String,
      enum: ["driver", "agent", "traffic", "admin"],
      default: "driver",
    },
    isAdmin: { type: Boolean, default: false },
    isAgent: { type: Boolean, default: false },
    isTraffic: { type: Boolean, default: false },

    assignedClaims: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Claim" }
    ],

    currentLoad: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);