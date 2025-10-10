import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Commission from "@/models/Commission";
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
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get commissions for today
    const todayCommissions = await Commission.find({
      userId: userId,
      createdAt: { $gte: today },
      status: "approved",
    })
      .populate("referredUserId", "username email image")
      .sort({ createdAt: -1 });

    // Get all commissions
    const allCommissions = await Commission.find({
      userId: userId,
      status: "approved",
    })
      .populate("referredUserId", "username email image")
      .sort({ createdAt: -1 })
      .limit(100);

    // Calculate today's earnings
    const todayEarnings = todayCommissions.reduce(
      (sum, comm) => sum + comm.amount,
      0
    );

    // Calculate total earnings
    const totalEarnings = allCommissions.reduce(
      (sum, comm) => sum + comm.amount,
      0
    );

    return NextResponse.json(
      {
        todayCommissions,
        allCommissions,
        todayEarnings,
        totalEarnings,
        walletBalance: user.walletBalance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get commissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
