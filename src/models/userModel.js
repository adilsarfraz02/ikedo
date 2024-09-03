import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
function generateReferralCode() {
  return uuidv4(); // Generates a unique UUID v4
}
const referralCode = generateReferralCode();
const url = `${process.env.DOMAIN}/auth/signup?ref=${referralCode}`;

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
  tReferralCount: { type: Number, default: 0 },
  // and save data of prev user refer in it
  tReferrals: {
    type: Array,
    default: [],
  },
  ReferralUrl: {
    type: String,
    default: url,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: Date,
  lastLoggedIn: Date,
  otp: { type: Number },
  otpExpires: Date,
  plan: {
    type: String,
    enum: ['Free', 'Standard', 'Pro', 'Premium'],
    default: 'Free',
  },
});

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;
