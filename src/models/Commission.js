import mongoose from "mongoose";

const CommissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  referredUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  commissionType: {
    type: String,
    enum: ["referral", "plan_purchase", "daily_bonus"],
    default: "referral",
  },
  planName: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "paid"],
    default: "approved",
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: {
    type: Date,
  },
  isClaimed: {
    type: Boolean,
    default: false,
  },
  claimedAt: {
    type: Date,
  },
  nextClaimTime: {
    type: Date,
  },
  commissionRate: {
    type: Number,
    default: 0.14, // 14% commission rate
  },
});

// Index for faster queries
CommissionSchema.index({ userId: 1, createdAt: -1 });
CommissionSchema.index({ referredUserId: 1 });

const Commission =
  mongoose.models.Commission || mongoose.model("Commission", CommissionSchema);

export default Commission;
