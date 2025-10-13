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
        if (now >= nextClaimTime || !lastPlanReward) { // Also create if no previous rewards
          // Calculate 7% of plan price as daily reward (updated from 12%)
          const rewardAmount = user.planDetails.price * 0.07;
          
          userPlanReward = new Commission({
            userId: userId,
            referredUserId: userId, // Self referral for plan rewards
            amount: rewardAmount,
            commissionType: "daily_bonus",
            planName: user.plan,
            status: "approved",
            description: `Daily 7% return on your ${user.plan} plan`,
            nextClaimTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next claim in 24 hours
            commissionRate: 0.07 // 7% daily return (updated from 12%)
          });
          
          await userPlanReward.save();
        }
      } else {
        userPlanReward = existingPlanReward;
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
            
            // Create a ONE-TIME commission record (referral bonus is not recurring)
            const newCommission = new Commission({
              userId: userId,
              referredUserId: referral._id,
              amount: commissionAmount,
              commissionType: "plan_purchase",
              planName: referredUser.plan,
              status: "approved",
              description: `One-time 12% commission from ${referredUser.username}'s ${referredUser.plan} plan purchase`,
              nextClaimTime: new Date(), // Make it immediately claimable since we're generating it late
              commissionRate: 0.12 // 12% ONE-TIME commission
            });
            
            await newCommission.save();
            console.log(`Generated ONE-TIME referral reward for ${referredUser.username}`);
            newRecordsCreated = true;
          } else {
            // Even if they don't have a plan yet, create a pending record
            // so they show up in the referrals list
            const pendingCommission = new Commission({
              userId: userId,
              referredUserId: referral._id,
              amount: 0, // No amount yet since they haven't purchased a plan
              commissionType: "referral", // Just a referral record, not a purchase yet
              status: "pending",
              description: `Pending referral - waiting for ${referral.username || 'user'} to purchase a plan (One-time 12% commission)`,
              // Set nextClaimTime far in future until they purchase a plan
              nextClaimTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              commissionRate: 0.12 // 12% ONE-TIME commission rate for when they do purchase
            });
            
            await pendingCommission.save();
            console.log(`Generated pending referral record for ${referral.username || referral._id}`);
            newRecordsCreated = true;
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
    
    // ONLY create a new reward if this was a PLAN reward (daily_bonus)
    // Referral rewards are ONE-TIME ONLY and should NOT be recreated
    if (commission.commissionType === "daily_bonus" && user.plan && user.plan !== "Free" && user.planDetails) {
      // Create a new plan reward for the next 24 hours (RECURRING)
      const newReward = new Commission({
        userId: userId,
        referredUserId: userId, // Self referral for plan rewards
        amount: user.planDetails.price * 0.07, // 7% daily return
        commissionType: "daily_bonus",
        planName: user.plan,
        status: "approved",
        description: `Daily 7% return on your ${user.plan} plan`,
        nextClaimTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next claim in 24 hours
        commissionRate: 0.07 // 7% daily return
      });
      
      await newReward.save();
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
    
    // Check if any claimed commissions were plan rewards (daily_bonus)
    const hasPlanRewards = readyCommissions.some(commission => commission.commissionType === "daily_bonus");
    
    // ONLY create a new reward if plan rewards were claimed (daily_bonus is RECURRING)
    // Referral rewards are ONE-TIME ONLY and should NOT be recreated
    if (hasPlanRewards && user.plan && user.plan !== "Free" && user.planDetails) {
      // Create a new plan reward for the next 24 hours (RECURRING)
      const newReward = new Commission({
        userId: userId,
        referredUserId: userId, // Self referral for plan rewards
        amount: user.planDetails.price * 0.07, // 7% daily return
        commissionType: "daily_bonus",
        planName: user.plan,
        status: "approved",
        description: `Daily 7% return on your ${user.plan} plan`,
        nextClaimTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next claim in 24 hours
        commissionRate: 0.07 // 7% daily return
      });
      
      await newReward.save();
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
