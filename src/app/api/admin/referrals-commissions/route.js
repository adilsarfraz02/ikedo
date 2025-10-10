import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Commission from "@/models/Commission";
import { NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

export async function GET(request) {
  try {
    // Check if user is admin
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const adminUser = await User.findById(userId);
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    // Get all users with their referral and commission data
    const users = await User.find({ isAdmin: false })
      .select('username email image referralCode ReferralUrl tReferralCount tReferrals walletBalance totalEarnings todayEarnings createdAt isVerified plan')
      .sort({ tReferralCount: -1 });

    // Get all commissions
    const allCommissions = await Commission.find({ status: "approved" })
      .populate("userId", "username email image")
      .populate("referredUserId", "username email image")
      .sort({ createdAt: -1 });

    // Calculate stats
    const totalReferrals = users.reduce((sum, user) => sum + (user.tReferralCount || 0), 0);
    const totalCommissionsPaid = allCommissions.reduce((sum, comm) => sum + comm.amount, 0);
    const totalWalletBalance = users.reduce((sum, user) => sum + (user.walletBalance || 0), 0);
    const activeReferrers = users.filter(user => user.tReferralCount > 0).length;

    // Get today's commissions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCommissions = allCommissions.filter(
      comm => new Date(comm.createdAt) >= today
    );
    const todayEarnings = todayCommissions.reduce((sum, comm) => sum + comm.amount, 0);

    // Get top referrers (top 10)
    const topReferrers = users
      .filter(user => user.tReferralCount > 0)
      .slice(0, 10)
      .map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        referralCount: user.tReferralCount,
        totalEarnings: user.totalEarnings || 0,
        walletBalance: user.walletBalance || 0,
        referralCode: user.referralCode,
      }));

    // Get commission breakdown by type
    const commissionByType = {
      referral: allCommissions.filter(c => c.commissionType === "referral").reduce((sum, c) => sum + c.amount, 0),
      plan_purchase: allCommissions.filter(c => c.commissionType === "plan_purchase").reduce((sum, c) => sum + c.amount, 0),
      daily_bonus: allCommissions.filter(c => c.commissionType === "daily_bonus").reduce((sum, c) => sum + c.amount, 0),
    };

    // Get commission timeline (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayCommissions = allCommissions.filter(
        comm => new Date(comm.createdAt) >= date && new Date(comm.createdAt) < nextDate
      );
      
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: dayCommissions.reduce((sum, comm) => sum + comm.amount, 0),
        count: dayCommissions.length,
      });
    }

    // Group commissions by user for detailed view
    const userCommissions = {};
    allCommissions.forEach(comm => {
      const userId = comm.userId._id.toString();
      if (!userCommissions[userId]) {
        userCommissions[userId] = {
          user: comm.userId,
          commissions: [],
          totalAmount: 0,
          todayAmount: 0,
        };
      }
      userCommissions[userId].commissions.push(comm);
      userCommissions[userId].totalAmount += comm.amount;
      
      if (new Date(comm.createdAt) >= today) {
        userCommissions[userId].todayAmount += comm.amount;
      }
    });

    // Convert to array and sort by total amount
    const userCommissionsArray = Object.values(userCommissions).sort(
      (a, b) => b.totalAmount - a.totalAmount
    );

    return NextResponse.json({
      stats: {
        totalReferrals,
        totalCommissionsPaid,
        totalWalletBalance,
        activeReferrers,
        todayEarnings,
        todayCommissionsCount: todayCommissions.length,
      },
      topReferrers,
      commissionByType,
      commissionTimeline: last7Days,
      userCommissions: userCommissionsArray,
      allUsers: users,
      recentCommissions: allCommissions.slice(0, 50), // Last 50 commissions
    }, { status: 200 });

  } catch (error) {
    console.error("Admin referrals-commissions error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
