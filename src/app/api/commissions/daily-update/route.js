import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Commission from "@/models/Commission";
import { NextResponse } from "next/server";

connect();

// This API should be called by a cron job daily
export async function POST(request) {
  try {
    // Verify the request is from authorized source (cron job or admin)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "your-secret-key";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all users with active plans (not Free)
    const activeUsers = await User.find({
      plan: { $ne: "Free" },
      isVerified: true,
    });

    let updatedCount = 0;

    for (const user of activeUsers) {
      // Skip if already updated today
      if (
        user.lastDailyUpdate &&
        user.lastDailyUpdate >= today
      ) {
        continue;
      }

      // Calculate daily return based on plan
      let dailyReturn = 0;
      switch (user.plan) {
        case "Standard":
          dailyReturn = 50 * 0.05; // 5% daily return
          break;
        case "Pro":
          dailyReturn = 100 * 0.08; // 8% daily return
          break;
        case "Premium":
          dailyReturn = 500 * 0.1; // 10% daily return
          break;
      }

      if (dailyReturn > 0) {
        // Create commission record for daily bonus
        const commission = new Commission({
          userId: user._id,
          referredUserId: user._id,
          amount: dailyReturn,
          commissionType: "daily_bonus",
          planName: user.plan,
          status: "approved",
          description: `Daily return for ${user.plan} plan`,
        });
        await commission.save();

        // Update user wallet
        user.walletBalance += dailyReturn;
        user.isWithdrawAmount += dailyReturn;
        user.totalEarnings += dailyReturn;
        user.todayEarnings = dailyReturn;
        user.lastDailyUpdate = new Date();
        await user.save();

        updatedCount++;
      }
    }

    return NextResponse.json(
      {
        message: "Daily update completed",
        updatedUsers: updatedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Daily update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
