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
    
    // Check if the user has an active plan with daily return
    let userPlanReward = null;
    const now = new Date();
    
    if (user.plan && user.plan !== "Free" && user.planDetails?.dailyReturn > 0 && user.planDetails?.purchaseDate) {
      // Get or create today's plan daily reward
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if plan reward for today exists
      const existingPlanReward = await Commission.findOne({
        userId: userId,
        referredUserId: userId, // Self referral for plan rewards
        commissionType: "daily_bonus",
        createdAt: { $gte: today }
      });
      
      if (!existingPlanReward) {
        // Calculate when the next claim should be available (24 hours from purchase time or last claim)
        let baseDate = user.planDetails.purchaseDate;
        const lastPlanReward = await Commission.findOne({
          userId: userId,
          referredUserId: userId,
          commissionType: "daily_bonus"
        }).sort({ createdAt: -1 });
        
        if (lastPlanReward && lastPlanReward.claimedAt) {
          baseDate = lastPlanReward.claimedAt;
        }
        
        const nextClaimTime = new Date(baseDate);
        nextClaimTime.setDate(nextClaimTime.getDate() + 1);
        
        // If 24 hours have passed since purchase or last claim, create a new reward
        if (now >= nextClaimTime) {
          // Calculate 12% of plan price as daily reward
          const rewardAmount = user.planDetails.price * 0.12;
          
          userPlanReward = new Commission({
            userId: userId,
            referredUserId: userId, // Self referral for plan rewards
            amount: rewardAmount,
            commissionType: "daily_bonus",
            planName: user.plan,
            status: "approved",
            description: `Daily 12% return on your ${user.plan} plan`,
            nextClaimTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next claim in 24 hours
            commissionRate: 0.12 // 12% daily return
          });
          
          await userPlanReward.save();
        }
      } else {
        userPlanReward = existingPlanReward;
      }
    }

    // Get all commissions where user is the referrer
    const allCommissions = await Commission.find({
      userId: userId,
      commissionType: { $in: ["plan_purchase", "referral", "daily_bonus"] },
    })
      .populate("referredUserId", "username email image plan planDetails")
      .sort({ createdAt: -1 });

    // Separate claimed and unclaimed rewards
    const claimedRewards = allCommissions.filter((comm) => comm.isClaimed);
    const unclaimedRewards = allCommissions.filter((comm) => !comm.isClaimed);

    // Check which rewards are ready to claim (24 hours passed)
    // Using the existing 'now' variable defined above
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

    // Split rewards by type for the frontend
    const planReadyToClaim = readyToClaim.filter(reward => reward.commissionType === "daily_bonus");
    const referralReadyToClaim = readyToClaim.filter(reward => reward.commissionType !== "daily_bonus");
    
    const planNotReadyToClaim = notReadyToClaim.filter(reward => reward.commissionType === "daily_bonus");
    const referralNotReadyToClaim = notReadyToClaim.filter(reward => reward.commissionType !== "daily_bonus");
    
    const planClaimedRewards = claimedRewards.filter(reward => reward.commissionType === "daily_bonus");
    const referralClaimedRewards = claimedRewards.filter(reward => reward.commissionType !== "daily_bonus");
    
    // Calculate plan-specific stats
    const totalPlanClaimedAmount = planClaimedRewards.reduce(
      (sum, comm) => sum + comm.amount,
      0
    );
    const totalPlanPendingAmount = [...planReadyToClaim, ...planNotReadyToClaim].reduce(
      (sum, comm) => sum + comm.amount,
      0
    );
    const totalPlanReadyToClaimAmount = planReadyToClaim.reduce(
      (sum, comm) => sum + comm.amount,
      0
    );
    
    // Check if user has an active plan with daily return
    const hasPlanWithDailyReturn = user.plan !== "Free" && user.planDetails?.dailyReturn > 0;
    const dailyReturnRate = hasPlanWithDailyReturn ? (user.planDetails?.dailyReturn || 12) : 0;
    const dailyReturnAmount = hasPlanWithDailyReturn ? (user.planDetails?.price * dailyReturnRate / 100) : 0;
    
    return NextResponse.json(
      {
        success: true,
        data: {
          readyToClaim,
          notReadyToClaim,
          claimedRewards,
          planReadyToClaim,
          planNotReadyToClaim,
          planClaimedRewards,
          referralReadyToClaim,
          referralNotReadyToClaim,
          referralClaimedRewards,
          stats: {
            totalClaimedAmount,
            totalPendingAmount,
            totalReadyToClaimAmount,
            totalRewards: allCommissions.length,
            claimedCount: claimedRewards.length,
            pendingCount: unclaimedRewards.length,
            readyToClaimCount: readyToClaim.length,
            
            // Plan-specific stats
            totalPlanClaimedAmount,
            totalPlanPendingAmount,
            totalPlanReadyToClaimAmount,
            planReadyToClaimCount: planReadyToClaim.length,
            planPendingCount: planNotReadyToClaim.length,
            planClaimedCount: planClaimedRewards.length,
            
            // Plan info
            hasPlanWithDailyReturn,
            dailyReturnRate,
            dailyReturnAmount,
            userPlan: user.plan,
            planPrice: user.planDetails?.price || 0,
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
