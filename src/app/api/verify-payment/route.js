import { connect } from "@/dbConfig/dbConfig";
import { resend } from "@/lib/resend";
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

    if (user.paymentStatus === "Approved") {
      return NextResponse.json({ error: "Payment already verified" }, { status: 400 });
    }
    // email the user that their payment has been verified
    const email = user.email;
    const subject = "Payment Verified";
    const message = "Your payment has been verified. You can now Referr Some and earn Money.";
    await resend.emails.send({
      from: "verify@thebandbaja.com",
      to: email,
      subject: subject,
      html: message,
    });

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
