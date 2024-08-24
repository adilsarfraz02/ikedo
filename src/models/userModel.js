import mongoose from "mongoose";

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
  isAdmin: {
    type: Boolean,
    default: false,
  },
  paymentReceipt: {
    type: String,
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
  tReferrals: { type: Array, default: [] },
  ReferralUrl: {
    type: String,
default: function randomUrl() {
      return `${process.env.DOMAIN}/${User._id}`;
    },    
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
