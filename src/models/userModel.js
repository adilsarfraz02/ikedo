import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

function generateReferralCode() {
  return uuidv4(); // Generates a unique UUID v4
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
  },
  image: {
    type: String,
    required: [true, "Please provide an image"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isWithdraw: {
    type: Boolean,
    default: false,
  },
  isWithdrawAmount: {
    type: Number,
    default: 0,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  paymentReceipt: {
    type: String,
  },
  bankAccount: {
    type: String,
    required: [true, "Please provide a bank account"],
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Processing"],
    default: "Pending",
  },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,
  tReferralCount: {
    type: Number,
    default: 0,
  },
  tReferrals: {
    type: Array,
    default: [],
  },
  ReferralUrl: {
    type: String,
    default: function () {
      const referralCode = generateReferralCode();
      return `${process.env.DOMAIN}/auth/signup?ref=${referralCode}`;
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
  lastLoggedIn: Date,
  otp: {
    type: Number,
  },
  otpExpires: Date,
  plan: {
    type: String,
    enum: ["Free", "Standard", "Pro", "Premium"],
    default: "Free",
  },
  withdrawalRequests: [
    {
      amount: Number,
      accountNumber: String,
      paymentGateway: String,
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      createdAt: Date,
    },
  ],
});

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcryptjs.hash(this.password, 10);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcryptjs.compare(candidatePassword, this.password);
};

// Method to generate referral URL
userSchema.methods.generateReferralUrl = function () {
  const referralCode = generateReferralCode();
  this.ReferralUrl = `${process.env.DOMAIN}/auth/signup?ref=${referralCode}`;
  return this.ReferralUrl;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
