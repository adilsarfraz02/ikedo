import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Commission from "@/models/Commission";
import Deposit from "@/models/Deposit";
import Withdrawal from "@/models/Withdrawal";
import PricingPlan from "@/models/PricingPlan";
import { NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

export async function GET(request) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all data in parallel
    const [
      allUsers,
      allCommissions,
      allDeposits,
      allWithdrawals,
      allPlans,
    ] = await Promise.all([
      User.find({}).select("-password").lean(),
      Commission.find({}).populate("userId referredUserId", "username email").lean(),
      Deposit.find({}).populate("userId", "username email").lean(),
      Withdrawal.find({}).populate("userId", "username email").lean(),
      PricingPlan.find({}).lean(),
    ]);

    // ========== USER STATISTICS ==========
    const totalUsers = allUsers.length;
    const verifiedUsers = allUsers.filter(u => u.isVerified).length;
    const unverifiedUsers = totalUsers - verifiedUsers;
    const adminUsers = allUsers.filter(u => u.isAdmin).length;
    
    // Users by plan
    const usersByPlan = allUsers.reduce((acc, user) => {
      const plan = user.plan || "Free";
      acc[plan] = (acc[plan] || 0) + 1;
      return acc;
    }, {});

    // Users with active investments (paid plans)
    const usersWithInvestments = allUsers.filter(
      u => u.plan && u.plan !== "Free" && u.planDetails?.price > 0
    );

    // ========== INVESTMENT STATISTICS ==========
    const totalInvested = usersWithInvestments.reduce(
      (sum, user) => sum + (user.planDetails?.price || 0),
      0
    );

    const investmentsByPlan = usersWithInvestments.reduce((acc, user) => {
      const plan = user.plan;
      if (!acc[plan]) {
        acc[plan] = {
          count: 0,
          totalAmount: 0,
          users: [],
        };
      }
      acc[plan].count++;
      acc[plan].totalAmount += user.planDetails?.price || 0;
      acc[plan].users.push({
        id: user._id,
        username: user.username,
        email: user.email,
        amount: user.planDetails?.price || 0,
        purchaseDate: user.planDetails?.purchaseDate,
        dailyReturn: user.planDetails?.dailyReturn || 0,
      });
      return acc;
    }, {});

    // ========== WALLET & EARNINGS STATISTICS ==========
    const totalWalletBalance = allUsers.reduce(
      (sum, user) => sum + (user.walletBalance || 0),
      0
    );

    const totalWithdrawableAmount = allUsers.reduce(
      (sum, user) => sum + (user.isWithdrawAmount || 0),
      0
    );

    const totalEarnings = allUsers.reduce(
      (sum, user) => sum + (user.totalEarnings || 0),
      0
    );

    // ========== COMMISSION STATISTICS ==========
    const totalCommissions = allCommissions.length;
    const claimedCommissions = allCommissions.filter(c => c.isClaimed).length;
    const unclaimedCommissions = totalCommissions - claimedCommissions;
    
    const totalCommissionAmount = allCommissions.reduce(
      (sum, comm) => sum + (comm.amount || 0),
      0
    );

    const claimedCommissionAmount = allCommissions
      .filter(c => c.isClaimed)
      .reduce((sum, comm) => sum + (comm.amount || 0), 0);

    const unclaimedCommissionAmount = allCommissions
      .filter(c => !c.isClaimed)
      .reduce((sum, comm) => sum + (comm.amount || 0), 0);

    const commissionsByType = allCommissions.reduce((acc, comm) => {
      const type = comm.commissionType || "unknown";
      if (!acc[type]) {
        acc[type] = { count: 0, amount: 0 };
      }
      acc[type].count++;
      acc[type].amount += comm.amount || 0;
      return acc;
    }, {});

    // ========== DEPOSIT STATISTICS ==========
    const totalDeposits = allDeposits.length;
    const pendingDeposits = allDeposits.filter(d => d.status === "pending").length;
    const verifiedDeposits = allDeposits.filter(d => d.status === "verified").length;
    const rejectedDeposits = allDeposits.filter(d => d.status === "rejected").length;

    const totalDepositAmount = allDeposits.reduce(
      (sum, deposit) => sum + (deposit.amount || 0),
      0
    );

    const verifiedDepositAmount = allDeposits
      .filter(d => d.status === "verified")
      .reduce((sum, deposit) => sum + (deposit.amount || 0), 0);

    const pendingDepositAmount = allDeposits
      .filter(d => d.status === "pending")
      .reduce((sum, deposit) => sum + (deposit.amount || 0), 0);

    // ========== WITHDRAWAL STATISTICS ==========
    const totalWithdrawals = allWithdrawals.length;
    const pendingWithdrawals = allWithdrawals.filter(w => w.status === "pending").length;
    const completedWithdrawals = allWithdrawals.filter(w => w.status === "completed").length;
    const rejectedWithdrawals = allWithdrawals.filter(w => w.status === "rejected").length;
    const processingWithdrawals = allWithdrawals.filter(w => w.status === "processing").length;

    const totalWithdrawalAmount = allWithdrawals.reduce(
      (sum, withdrawal) => sum + (withdrawal.amount || 0),
      0
    );

    const completedWithdrawalAmount = allWithdrawals
      .filter(w => w.status === "completed")
      .reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);

    const pendingWithdrawalAmount = allWithdrawals
      .filter(w => w.status === "pending")
      .reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);

    // ========== REFERRAL STATISTICS ==========
    const totalReferrals = allUsers.reduce(
      (sum, user) => sum + (user.tReferralCount || 0),
      0
    );

    const usersWithReferrals = allUsers.filter(u => u.tReferralCount > 0).length;

    const topReferrers = allUsers
      .filter(u => u.tReferralCount > 0)
      .sort((a, b) => b.tReferralCount - a.tReferralCount)
      .slice(0, 10)
      .map(u => ({
        id: u._id,
        username: u.username,
        email: u.email,
        referralCount: u.tReferralCount,
        totalEarnings: u.totalEarnings || 0,
      }));

    // ========== FINANCIAL OVERVIEW ==========
    const platformRevenue = totalInvested; // Total money received from plan purchases
    const platformLiability = totalWithdrawableAmount; // Money owed to users
    const platformProfit = platformRevenue - completedWithdrawalAmount - claimedCommissionAmount;
    const pendingLiability = pendingWithdrawalAmount + unclaimedCommissionAmount;

    // ========== RECENT ACTIVITIES ==========
    const recentInvestments = usersWithInvestments
      .filter(u => u.planDetails?.purchaseDate)
      .sort((a, b) => new Date(b.planDetails.purchaseDate) - new Date(a.planDetails.purchaseDate))
      .slice(0, 10)
      .map(u => ({
        username: u.username,
        email: u.email,
        plan: u.plan,
        amount: u.planDetails.price,
        date: u.planDetails.purchaseDate,
      }));

    const recentCommissions = allCommissions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(c => ({
        userId: c.userId?._id,
        username: c.userId?.username,
        referredUser: c.referredUserId?.username,
        amount: c.amount,
        type: c.commissionType,
        isClaimed: c.isClaimed,
        date: c.createdAt,
      }));

    // ========== DETAILED USER INVESTMENTS ==========
    const detailedInvestments = usersWithInvestments.map(user => ({
      userId: user._id,
      username: user.username,
      email: user.email,
      image: user.image,
      plan: user.plan,
      investmentAmount: user.planDetails?.price || 0,
      purchaseDate: user.planDetails?.purchaseDate,
      dailyReturn: user.planDetails?.dailyReturn || 0,
      cashback: user.planDetails?.cashback,
      walletBalance: user.walletBalance || 0,
      withdrawableAmount: user.isWithdrawAmount || 0,
      totalEarnings: user.totalEarnings || 0,
      referralCount: user.tReferralCount || 0,
      isVerified: user.isVerified,
      accountStatus: user.paymentStatus,
    }));

    // ========== RESPONSE ==========
    return NextResponse.json(
      {
        success: true,
        data: {
          // User Statistics
          users: {
            total: totalUsers,
            verified: verifiedUsers,
            unverified: unverifiedUsers,
            admins: adminUsers,
            byPlan: usersByPlan,
            withInvestments: usersWithInvestments.length,
            withReferrals: usersWithReferrals,
          },

          // Investment Statistics
          investments: {
            total: totalInvested,
            byPlan: investmentsByPlan,
            count: usersWithInvestments.length,
            detailed: detailedInvestments,
            recent: recentInvestments,
          },

          // Wallet & Earnings
          wallets: {
            totalBalance: totalWalletBalance,
            totalWithdrawable: totalWithdrawableAmount,
            totalEarnings: totalEarnings,
          },

          // Commission Statistics
          commissions: {
            total: totalCommissions,
            claimed: claimedCommissions,
            unclaimed: unclaimedCommissions,
            totalAmount: totalCommissionAmount,
            claimedAmount: claimedCommissionAmount,
            unclaimedAmount: unclaimedCommissionAmount,
            byType: commissionsByType,
            recent: recentCommissions,
          },

          // Deposit Statistics
          deposits: {
            total: totalDeposits,
            pending: pendingDeposits,
            verified: verifiedDeposits,
            rejected: rejectedDeposits,
            totalAmount: totalDepositAmount,
            verifiedAmount: verifiedDepositAmount,
            pendingAmount: pendingDepositAmount,
          },

          // Withdrawal Statistics
          withdrawals: {
            total: totalWithdrawals,
            pending: pendingWithdrawals,
            processing: processingWithdrawals,
            completed: completedWithdrawals,
            rejected: rejectedWithdrawals,
            totalAmount: totalWithdrawalAmount,
            completedAmount: completedWithdrawalAmount,
            pendingAmount: pendingWithdrawalAmount,
          },

          // Referral Statistics
          referrals: {
            total: totalReferrals,
            usersWithReferrals: usersWithReferrals,
            topReferrers: topReferrers,
          },

          // Financial Overview
          financial: {
            revenue: platformRevenue,
            liability: platformLiability,
            profit: platformProfit,
            pendingLiability: pendingLiability,
            completedPayouts: completedWithdrawalAmount,
          },

          // Plans
          plans: allPlans,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
