import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import VerifyEmail from "@/components/emails/VerifyEmail";
export async function POST(request) {
  await connect();
  try {
    const reqBody = await request.json();
    const { email, paymentReceipt, username } = reqBody;

    if (!email || !paymentReceipt || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Log request data for debugging

    const user = await User.findOne({ email: email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.paymentReceipt = paymentReceipt;
    user.paymentStatus = "Processing"; // Mark as processing until admin reviews
    await user.save();

    const subject = "New Verification Request";

    await resend.emails.send({
      from: "contact@thebandbaja.live",
      to: "adilsarfr00@gmail.com",
      subject,
      react: (
        <VerifyEmail
          image={paymentReceipt}
          username={username}
          email={email}
          url={`${process.env.DOMAIN}/payment?paymentId=${paymentReceipt}`}
        />
      ),
    });

    return NextResponse.json({
      message: "Verification request submitted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
