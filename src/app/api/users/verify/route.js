import { connect } from "@/dbConfig/dbConfig";
import { resend } from "@/lib/resend";
import User from "@/models/userModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  await connect();

  try {
    const reqBody = await request.json();
    const { url } = reqBody;
    console.log("Received url:", url);

    if (!url) {
      return NextResponse.json(
        { error: "Missing payment receipt" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ image: url });
    console.log("Found user:", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email = user.email;
    if (!email) {
      console.error("Email not found for the user:", user);
      return NextResponse.json(
        { error: "Email not found for user" },
        { status: 400 },
      );
    }

    const subject = "Account Verified";
    const message = `<p>
        Your Account has been verified. You can now Referr Some and earn
        Money.
      </p>`;

    try {
      const mail = await resend.emails.send({
        from: "verify@thebandbaja.live",
        to: email,
        cc: "ra2228621@gmail.com",
        subject: subject,
        html: message,
      });
      console.log("Email sent successfully to:", email);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 },
      );
    }

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
