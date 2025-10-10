import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["bank_transfer", "card", "other"],
    },
    transactionId: {
      type: String,
      required: true,
    },
    paymentProof: {
      type: String, // URL to uploaded payment slip/screenshot
      required: true, // Now required with UploadThing integration
    },
    remarks: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
depositSchema.index({ userId: 1, createdAt: -1 });
depositSchema.index({ status: 1 });

const Deposit =
  mongoose.models.Deposit || mongoose.model("Deposit", depositSchema);

export default Deposit;
