import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import VerifyEmail from "@/components/emails/VerifyEmail";

export async function POST(request) {
  await connect();

  try {
    const reqBody = await request.json();
    const { email, paymentReceipt, username, selectedMethod } = reqBody;

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

    // Update user with payment receipt and status
    user.paymentReceipt = paymentReceipt;
    user.paymentStatus = "Processing"; // Mark as processing until admin reviews
    await user.save();

    const adminSubject = "New Verification Request";

    // Send email to admin with payment receipt details
    await resend.emails.send({
      from: "verify@thebandbaja.live",
      to: "adilsarfr00@gmail.com", // Replace with admin email
      subject: adminSubject,
      react: (
        <VerifyEmail
          image={paymentReceipt}
          username={username}
          email={email}
          method={selectedMethod}
          url={`${process.env.DOMAIN}/payment?paymentId=${paymentReceipt}`}
        />
      ),
    });

    // Send email to user notifying them that verification is pending
    await resend.emails.send({
      from: "verify@thebandbaja.live",
      to: email,
      subject: "Account Verification Pending",
      react: (
        <div>
          <p>Dear {username},</p>
          <p>
            Your payment has been received and is currently under review by our
            admin team. You will be notified once the verification process is
            completed.
          </p>
          <p>Thank you for your patience.</p>
        </div>
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
