import mongoose from "mongoose";

const WithdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  accountHolderName: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
  },
  paymentGateway: {
    type: String,
    enum: ["easypaisa", "jazzcash", "bank"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "rejected"],
    default: "pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  rejectedAt: {
    type: Date,
  },
  adminNote: {
    type: String,
  },
  transactionId: {
    type: String,
  },
  // 24-hour withdrawal window
  availableForWithdrawalAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    },
  },
});

// Index for faster queries
WithdrawalSchema.index({ userId: 1, requestedAt: -1 });
WithdrawalSchema.index({ status: 1 });

const Withdrawal =
  mongoose.models.Withdrawal || mongoose.model("Withdrawal", WithdrawalSchema);

export default Withdrawal;
