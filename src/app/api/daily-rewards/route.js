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

    const user = await User.findById(userId).populate('planDetails');
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Check if the user has an active plan with daily return
    let userPlanReward = null;
    const now = new Date();
    
    if (user.plan && user.plan !== "Free" && user.planDetails) {
      // Get or create today's plan daily reward in an atomic/upsert way to prevent duplicates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const rewardDay = today.toISOString().slice(0, 10); // YYYY-MM-DD

      // Find last plan reward to determine base date
      const lastPlanReward = await Commission.findOne({
        userId: userId,
        referredUserId: userId,
        commissionType: "daily_bonus"
      }).sort({ createdAt: -1 });

      let baseDate = user.planDetails.purchaseDate || user.createdAt || new Date();
      if (lastPlanReward && lastPlanReward.claimedAt) {
        baseDate = lastPlanReward.claimedAt;
      }

      const nextClaimTimeFromBase = new Date(baseDate);
      nextClaimTimeFromBase.setDate(nextClaimTimeFromBase.getDate() + 1);

      // Only create today's reward if the cooldown passed
      if (now >= nextClaimTimeFromBase || !lastPlanReward) {
        const rewardAmount = user.planDetails.price * 0.07;

        // Atomic upsert: create only if a reward for this user and rewardDay doesn't exist
        userPlanReward = await Commission.findOneAndUpdate(
          {
            userId: userId,
            referredUserId: userId,
            commissionType: "daily_bonus",
            rewardDay: rewardDay,
          },
          {
            $setOnInsert: {
              userId: userId,
              referredUserId: userId,
              amount: rewardAmount,
              commissionType: "daily_bonus",
              planName: user.plan,
              status: "approved",
              description: `Daily 7% return on your ${user.plan} plan`,
              nextClaimTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
              commissionRate: 0.07,
              rewardDay: rewardDay,
            },
          },
          { new: true, upsert: true }
        );
      } else {
        // If cooldown hasn't passed, don't create; but still try to fetch today's reward if exists
        const todayReward = await Commission.findOne({
          userId: userId,
          referredUserId: userId,
          commissionType: "daily_bonus",
          rewardDay: rewardDay,
        });
        userPlanReward = todayReward || null;
      }
    }

    // Get all commissions where user is the referrer
    let allCommissions = await Commission.find({
      userId: userId,
      commissionType: { $in: ["plan_purchase", "referral", "daily_bonus"] },
    })
      .populate("referredUserId", "username email image plan planDetails")
      .sort({ createdAt: -1 });
    
    // Refresh referral commissions if user has referrals but no commission records
    if (user.tReferrals?.length > 0 && allCommissions.filter(c => c.commissionType !== "daily_bonus").length === 0) {
      console.log(`User has ${user.tReferrals.length} referrals but no commission records. Refreshing...`);
      
      // Handle referrals later in code
      // This will be re-fetched after handling missing referrals
    }

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
    
    // Calculate referral stats - Use the actual referral count from user data
    const totalReferralEarnings = [...referralReadyToClaim, ...referralNotReadyToClaim, ...referralClaimedRewards].reduce(
      (sum, comm) => sum + comm.amount,
      0
    );
    
    // Use the actual tReferralCount from user data instead of just counting commissions
    // This ensures we show the same number as the dashboard
    const totalReferrals = user.tReferralCount || 0;
    
    // Check if we need to generate new referral rewards (ONE-TIME ONLY)
    // Get unique referred user IDs from commissions to avoid duplicates
    const existingReferredUserIds = new Set([
      ...referralReadyToClaim.map(r => r.referredUserId?._id?.toString()), 
      ...referralNotReadyToClaim.map(r => r.referredUserId?._id?.toString()),
      ...referralClaimedRewards.map(r => r.referredUserId?._id?.toString())
    ].filter(Boolean));
    
    // Compare with the user's actual referrals to find missing ones
    if (user.tReferrals && user.tReferrals.length > 0) {
      const missingReferrals = user.tReferrals.filter(ref => 
        ref._id && !existingReferredUserIds.has(ref._id.toString())
      );
      
      let newRecordsCreated = false;
      
      // Generate ONE-TIME referral rewards for missing referrals
      for (const referral of missingReferrals) {
        try {
          // Find the referred user to get their plan details
          const referredUser = await User.findById(referral._id).populate('planDetails');
          
          if (referredUser && referredUser.plan && referredUser.plan !== "Free" && referredUser.planDetails) {
            // Calculate ONE-TIME commission (12% of plan price)
            const commissionAmount = referredUser.planDetails.price * 0.12;
            
            // Use findOneAndUpdate with upsert to avoid duplicates (one-time only)
            const oneTime = await Commission.findOneAndUpdate(
              {
                userId: userId,
                referredUserId: referral._id,
                commissionType: "plan_purchase",
              },
              {
                $setOnInsert: {
                  userId: userId,
                  referredUserId: referral._id,
                  amount: commissionAmount,
                  commissionType: "plan_purchase",
                  planName: referredUser.plan,
                  status: "approved",
                  description: `One-time 12% commission from ${referredUser.username}'s ${referredUser.plan} plan purchase`,
                  nextClaimTime: new Date(),
                  commissionRate: 0.12,
                },
              },
              { new: true, upsert: true }
            );

            if (oneTime) {
              console.log(`Ensured ONE-TIME referral reward for ${referredUser.username}`);
              newRecordsCreated = true;
            }
          } else {
            // Even if they don't have a plan yet, create a pending record using upsert to avoid duplicates
            const pending = await Commission.findOneAndUpdate(
              {
                userId: userId,
                referredUserId: referral._id,
                commissionType: "referral",
              },
              {
                $setOnInsert: {
                  userId: userId,
                  referredUserId: referral._id,
                  amount: 0,
                  commissionType: "referral",
                  status: "pending",
                  description: `Pending referral - waiting for ${referral.username || 'user'} to purchase a plan (One-time 12% commission)`,
                  nextClaimTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                  commissionRate: 0.12,
                },
              },
              { new: true, upsert: true }
            );

            if (pending) {
              console.log(`Ensured pending referral record for ${referral.username || referral._id}`);
              newRecordsCreated = true;
            }
          }
        } catch (error) {
          console.error(`Error generating reward for referral ${referral._id}:`, error);
        }
      }
      
      // If we created new records, refresh the commissions data
      if (newRecordsCreated || missingReferrals.length > 0) {
        // Re-fetch all commissions to include the newly created ones
        allCommissions = await Commission.find({
          userId: userId,
          commissionType: { $in: ["plan_purchase", "referral", "daily_bonus"] },
        })
          .populate("referredUserId", "username email image plan planDetails")
          .sort({ createdAt: -1 });
          
        // Re-process the categorization
        // Separate claimed and unclaimed rewards
        const claimedRewards = allCommissions.filter((comm) => comm.isClaimed);
        const unclaimedRewards = allCommissions.filter((comm) => !comm.isClaimed);
    
        // Re-check which rewards are ready to claim (24 hours passed)
        readyToClaim.length = 0; // Clear the array
        notReadyToClaim.length = 0; // Clear the array
    
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
        
        // Re-split rewards by type
        planReadyToClaim.length = 0;
        referralReadyToClaim.length = 0;
        planNotReadyToClaim.length = 0;
        referralNotReadyToClaim.length = 0;
        planClaimedRewards.length = 0;
        referralClaimedRewards.length = 0;
        
        readyToClaim.forEach(reward => {
          if (reward.commissionType === "daily_bonus") {
            planReadyToClaim.push(reward);
          } else {
            referralReadyToClaim.push(reward);
          }
        });
        
        notReadyToClaim.forEach(reward => {
          if (reward.commissionType === "daily_bonus") {
            planNotReadyToClaim.push(reward);
          } else {
            referralNotReadyToClaim.push(reward);
          }
        });
        
        claimedRewards.forEach(reward => {
          if (reward.commissionType === "daily_bonus") {
            planClaimedRewards.push(reward);
          } else {
            referralClaimedRewards.push(reward);
          }
        });
      }
    }
    
    // Check if user has an active plan with daily return
    const hasPlanWithDailyReturn = user.plan !== "Free" && user.planDetails;
    const dailyReturnRate = 7; // Fixed at 7% daily return
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
            planPendingCount: planNotReadyToClaim.length + (planNotReadyToClaim.length === 0 && hasPlanWithDailyReturn ? 1 : 0), // Add 1 if user has a plan but no pending rewards
            planClaimedCount: planClaimedRewards.length,
            
            // Referral stats
            totalReferralEarnings,
            totalReferrals,
            referralReadyToClaimCount: referralReadyToClaim.length,
            referralPendingCount: referralNotReadyToClaim.length,
            referralClaimedCount: referralClaimedRewards.length,
            referralCommissionRate: 12, // 12% for referrals
            
            // Plan info
            hasPlanWithDailyReturn,
            dailyReturnRate,
            dailyReturnAmount,
            userPlan: user.plan,
            planPrice: user.planDetails?.price || 0,
          },
          walletBalance: user.walletBalance || 0,
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

    // Attempt to atomically claim the commission only if it's ready and not yet claimed
    const now = new Date();

    const commission = await Commission.findOneAndUpdate(
      {
        _id: commissionId,
        userId: userId,
        isClaimed: false,
        $or: [
          { nextClaimTime: { $lte: now } },
          { nextClaimTime: { $exists: false }, createdAt: { $lte: now } },
        ],
      },
      {
        $set: {
          isClaimed: true,
          claimedAt: now,
          status: "paid",
        },
      },
      { new: true }
    ).populate("referredUserId", "username email image");

    if (!commission) {
      return NextResponse.json(
        { error: "Commission not found, already claimed, or not ready to claim" },
        { status: 400 }
      );
    }

    // Atomically increment user's wallet and earnings
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          walletBalance: commission.amount || 0,
          totalEarnings: commission.amount || 0,
          isWithdrawAmount: commission.amount || 0,
        },
      },
      { new: true }
    );
    
    // ONLY create a new reward if this was a PLAN reward (daily_bonus)
    // Referral rewards are ONE-TIME ONLY and should NOT be recreated
    if (commission.commissionType === "daily_bonus" && user.plan && user.plan !== "Free" && user.planDetails) {
      // Create a new plan reward for the next 24 hours (RECURRING)
      const nextDay = new Date(now);
      nextDay.setDate(nextDay.getDate() + 0); // current day identifier for rewardDay of the created reward
      const rewardDay = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0,10); // next day's YYYY-MM-DD

      // Use upsert to avoid duplicate reward documents for the same rewardDay
      await Commission.findOneAndUpdate(
        {
          userId: userId,
          referredUserId: userId,
          commissionType: "daily_bonus",
          rewardDay: rewardDay,
        },
        {
          $setOnInsert: {
            userId: userId,
            referredUserId: userId,
            amount: user.planDetails.price * 0.07,
            commissionType: "daily_bonus",
            planName: user.plan,
            status: "approved",
            description: `Daily 7% return on your ${user.plan} plan`,
            nextClaimTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            commissionRate: 0.07,
            rewardDay: rewardDay,
          }
        },
        { new: true, upsert: true }
      );
    }
    // NOTE: Referral rewards (plan_purchase/referral types) are NOT recreated
    // They are ONE-TIME commissions only

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

    // Atomically claim each commission one-by-one to avoid double-claim races
    const actuallyClaimed = [];

    for (const comm of readyCommissions) {
      const updated = await Commission.findOneAndUpdate(
        {
          _id: comm._id,
          isClaimed: false,
        },
        {
          $set: {
            isClaimed: true,
            claimedAt: now,
            status: "paid",
          },
        },
        { new: true }
      );

      if (updated) {
        actuallyClaimed.push(updated);
      }
    }

    const totalActuallyClaimed = actuallyClaimed.reduce((s, c) => s + (c.amount || 0), 0);

    // Atomically increment user's wallet and totals only once
    if (totalActuallyClaimed > 0) {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            walletBalance: totalActuallyClaimed,
            totalEarnings: totalActuallyClaimed,
            isWithdrawAmount: totalActuallyClaimed,
          },
        },
        { new: true }
      );

      // Replace user variable for downstream checks
      user.walletBalance = updatedUser.walletBalance;
      user.totalEarnings = updatedUser.totalEarnings;
      user.isWithdrawAmount = updatedUser.isWithdrawAmount;
    }
    
    // Check if any claimed commissions were plan rewards (daily_bonus)
    const hasPlanRewards = readyCommissions.some(commission => commission.commissionType === "daily_bonus");
    
    // ONLY create a new reward if plan rewards were claimed (daily_bonus is RECURRING)
    // Referral rewards are ONE-TIME ONLY and should NOT be recreated
    if (hasPlanRewards && user.plan && user.plan !== "Free" && user.planDetails) {
      const rewardDay = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0,10);
      await Commission.findOneAndUpdate(
        {
          userId: userId,
          referredUserId: userId,
          commissionType: "daily_bonus",
          rewardDay: rewardDay,
        },
        {
          $setOnInsert: {
            userId: userId,
            referredUserId: userId,
            amount: user.planDetails.price * 0.07,
            commissionType: "daily_bonus",
            planName: user.plan,
            status: "approved",
            description: `Daily 7% return on your ${user.plan} plan`,
            nextClaimTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            commissionRate: 0.07,
            rewardDay: rewardDay,
          }
        },
        { new: true, upsert: true }
      );
    }
    // NOTE: Referral rewards (plan_purchase/referral types) are NOT recreated
    // They are ONE-TIME commissions only

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
