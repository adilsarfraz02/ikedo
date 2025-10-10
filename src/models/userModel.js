import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

function generateReferralCode() {
  return uuidv4(); // Generates a unique UUID v4
}

// Generate username-based referral code (cleaned and URL-safe)
function generateUsernameReferralCode(username) {
  if (!username) return uuidv4();
  
  // Remove special characters and spaces, keep only alphanumeric and hyphens
  let cleaned = username
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  
  // Add a short unique identifier to avoid collisions
  const uniqueId = Math.random().toString(36).substring(2, 8);
  return `${cleaned}-${uniqueId}`;
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
  walletBalance: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  todayEarnings: {
    type: Number,
    default: 0,
  },
  lastDailyUpdate: {
    type: Date,
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
  accountHolderName: {
    type: String,
  },
  bankName: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Processing"],
    default: "Pending",
  },
  resetToken: String,
  resetTokenExpiry: Date,
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
      const referralCode = generateUsernameReferralCode(this.username);
      return `${process.env.DOMAIN}/auth/signup?ref=${referralCode}`;
    },
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
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
    default: "Free",
  },
  planDetails: {
    price: {
      type: Number,
      default: 0,
    },
    cashback: {
      type: String,
    },
    dailyReturn: {
      type: Number,
      default: 0,
    },
    purchaseDate: {
      type: Date,
    },
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

// Pre-save hook to hash password and generate referral code
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcryptjs.hash(this.password, 10);
  }
  
  // Generate referral code for new users
  if (this.isNew && !this.referralCode) {
    this.referralCode = generateUsernameReferralCode(this.username);
    this.ReferralUrl = `${process.env.DOMAIN}/auth/signup?ref=${this.referralCode}`;
  }
  
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcryptjs.compare(candidatePassword, this.password);
};

// Method to generate referral URL with username-based code
userSchema.methods.generateReferralUrl = function () {
  const referralCode = generateUsernameReferralCode(this.username);
  this.referralCode = referralCode;
  this.ReferralUrl = `${process.env.DOMAIN}/auth/signup?ref=${referralCode}`;
  return this.ReferralUrl;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
