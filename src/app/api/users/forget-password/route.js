import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { resend } from "@/lib/resend";

export async function POST(request) {
  await connect();
  try {
    const { email } = await request.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate a password reset token
    const resetToken =
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 36000000; // Token expires in 1 hour

    await user.save();

    // Send password reset email using Resend
    const resetUrl = `${process.env.DOMAIN}/auth/reset-password?token=${user._id}`;

    const { data, error } = await resend.emails.send({
      from: "referrals@ikedo.live",
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        { error: "Failed to send reset password email" },
        { status: 500 }
      );
    }

    console.log("Reset password email sent:", data);

    return NextResponse.json({
      message: "Password reset link sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in forget password route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
