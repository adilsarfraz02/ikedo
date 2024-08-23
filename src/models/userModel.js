import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide a username"],
    unique: true,
  },
  image: {
    type: String,
    required: [true, "Please provide a image"],
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
  },
  isVerfied: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,
  tReferralCount: { type: Number, default: 0 },
  tReferrals: { type: Array, default: [] },
  tReferralStatus: { type: String, default: "Pending" },
  ReferralUrl: {
    type: String,
    default: `${process.env.DOMAIN}/${Math.floor(Math.random(5) + 1)}`,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
  lastLoggedIn: Date,
});

const User = mongoose.models.users || mongoose.model("users", userSchema);

export default User;
