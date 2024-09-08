import { NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

export async function GET() {
  try {
    await connect();

    const users = await User.find({});

    const totalUsers = users.length;
    const totalVerifiedUsers = users.filter((user) => user.isVerified).length;
    const totalWithdrawAmount = users.reduce(
      (sum, user) => sum + (user.isWithdrawAmount || 0),
      0,
    );
    const totalReferrals = users.reduce(
      (sum, user) => sum + (user.tReferralCount || 0),
      0,
    );

    return NextResponse.json({
      totalUsers,
      totalVerifiedUsers,
      totalWithdrawAmount,
      totalReferrals,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
