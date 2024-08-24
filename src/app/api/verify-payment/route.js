import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request) {
  await connect();

  try {
    const reqBody = await request.json();
    const { paymentReceipt } = reqBody;
    console.log("Received paymentReceipt:", paymentReceipt);

    if (!paymentReceipt) {
      return NextResponse.json(
        { error: "Missing payment receipt" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ paymentReceipt: paymentReceipt });
    console.log("Found user:", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update payment status and verify the user
    user.paymentStatus = "Approved";
    user.isVerified = true;
    user.updatedAt = new Date();

    const updatedUser = await user.save();

    return NextResponse.json({
      message: "Payment verified and user updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
