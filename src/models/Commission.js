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
  // Period identifier to prevent duplicate periodic rewards (numeric epoch segment)
  rewardPeriod: {
    type: Number,
  },
  commissionRate: {
    type: Number,
    default: 0.12, // Updated from 14% to 12% for referrals
  },
  // Adding these new fields to match updated API requirements
  type: {
    type: String,
    enum: ["plan", "referral"],
    default: "referral",
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PricingPlan",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  lastClaimTime: {
    type: Date,
  }
});

// Add virtual field for backward compatibility
CommissionSchema.virtual('user_id_virtual').get(function() {
  return this.userId || this.user_id;
});

// Index for faster queries
CommissionSchema.index({ userId: 1, createdAt: -1 });
CommissionSchema.index({ user_id: 1, createdAt: -1 });
CommissionSchema.index({ referredUserId: 1 });
// Unique index to prevent duplicate recurring rewards per period (sparse to allow older docs)
CommissionSchema.index({ userId: 1, commissionType: 1, rewardPeriod: 1 }, { unique: true, sparse: true });

const Commission =
  mongoose.models.Commission || mongoose.model("Commission", CommissionSchema);

export default Commission;
