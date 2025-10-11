import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Commission from "@/models/Commission";
import { NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

// GET - Fetch daily rewards data
export async function GET(request) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all commissions where user is the referrer
    const allCommissions = await Commission.find({
      userId: userId,
      commissionType: { $in: ["plan_purchase", "referral"] },
    })
      .populate("referredUserId", "username email image plan planDetails")
      .sort({ createdAt: -1 });

    // Separate claimed and unclaimed rewards
    const claimedRewards = allCommissions.filter((comm) => comm.isClaimed);
    const unclaimedRewards = allCommissions.filter((comm) => !comm.isClaimed);

    // Check which rewards are ready to claim (24 hours passed)
    const now = new Date();
    const readyToClaim = [];
    const notReadyToClaim = [];

    unclaimedRewards.forEach((reward) => {
      const nextClaimTime = reward.nextClaimTime || reward.createdAt;
      if (now >= nextClaimTime) {
        readyToClaim.push({
          ...reward.toObject(),
          canClaim: true,
          timeRemaining: 0,
        });
      } else {
        const timeRemaining = nextClaimTime - now;
        notReadyToClaim.push({
          ...reward.toObject(),
          canClaim: false,
          timeRemaining: Math.ceil(timeRemaining / 1000), // in seconds
        });
      }
    });

    // Calculate total rewards
    const totalClaimedAmount = claimedRewards.reduce(
      (sum, comm) => sum + comm.amount,
      0
    );
    const totalPendingAmount = unclaimedRewards.reduce(
      (sum, comm) => sum + comm.amount,
      0
    );
    const totalReadyToClaimAmount = readyToClaim.reduce(
      (sum, comm) => sum + comm.amount,
      0
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          readyToClaim,
          notReadyToClaim,
          claimedRewards,
          stats: {
            totalClaimedAmount,
            totalPendingAmount,
            totalReadyToClaimAmount,
            totalRewards: allCommissions.length,
            claimedCount: claimedRewards.length,
            pendingCount: unclaimedRewards.length,
            readyToClaimCount: readyToClaim.length,
          },
          walletBalance: user.walletBalance,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get daily rewards error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Claim a reward
export async function POST(request) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { commissionId } = await request.json();

    if (!commissionId) {
      return NextResponse.json(
        { error: "Commission ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the commission
    const commission = await Commission.findOne({
      _id: commissionId,
      userId: userId,
    }).populate("referredUserId", "username email image");

    if (!commission) {
      return NextResponse.json(
        { error: "Commission not found" },
        { status: 404 }
      );
    }

    // Check if already claimed
    if (commission.isClaimed) {
      return NextResponse.json(
        { error: "This reward has already been claimed" },
        { status: 400 }
      );
    }

    // Check if 24 hours have passed
    const now = new Date();
    const nextClaimTime = commission.nextClaimTime || commission.createdAt;
    
    if (now < nextClaimTime) {
      const timeRemaining = Math.ceil((nextClaimTime - now) / 1000);
      return NextResponse.json(
        {
          error: "Cannot claim yet. Please wait for the cooldown period.",
          timeRemaining,
        },
        { status: 400 }
      );
    }

    // Update commission
    commission.isClaimed = true;
    commission.claimedAt = now;
    commission.status = "paid";
    await commission.save();

    // Update user's wallet
    user.walletBalance = (user.walletBalance || 0) + commission.amount;
    user.totalEarnings = (user.totalEarnings || 0) + commission.amount;
    user.isWithdrawAmount = (user.isWithdrawAmount || 0) + commission.amount;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Reward claimed successfully!",
        data: {
          commission,
          newWalletBalance: user.walletBalance,
          claimedAmount: commission.amount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Claim reward error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Claim all ready rewards
export async function PUT(request) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();

    // Find all unclaimed commissions that are ready to claim
    const readyCommissions = await Commission.find({
      userId: userId,
      isClaimed: false,
      $or: [
        { nextClaimTime: { $lte: now } },
        { nextClaimTime: { $exists: false }, createdAt: { $lte: now } },
      ],
    });

    if (readyCommissions.length === 0) {
      return NextResponse.json(
        { error: "No rewards ready to claim" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = readyCommissions.reduce(
      (sum, comm) => sum + comm.amount,
      0
    );

    // Update all commissions
    await Commission.updateMany(
      {
        _id: { $in: readyCommissions.map((c) => c._id) },
      },
      {
        $set: {
          isClaimed: true,
          claimedAt: now,
          status: "paid",
        },
      }
    );

    // Update user's wallet
    user.walletBalance = (user.walletBalance || 0) + totalAmount;
    user.totalEarnings = (user.totalEarnings || 0) + totalAmount;
    user.isWithdrawAmount = (user.isWithdrawAmount || 0) + totalAmount;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: `Successfully claimed ${readyCommissions.length} rewards!`,
        data: {
          claimedCount: readyCommissions.length,
          totalAmount,
          newWalletBalance: user.walletBalance,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Claim all rewards error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
