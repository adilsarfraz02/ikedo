import { connect } from "@/dbConfig/dbConfig";
import { resend } from "@/lib/resend";
import User from "@/models/userModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  await connect();

  try {
    const reqBody = await request.json();
    const { paymentReceipt, title, cashback, price, paymentMethod, email } =
      reqBody;

    // Validate input
    if (!paymentReceipt) {
      return NextResponse.json(
        { error: "Payment receipt is required" },
        { status: 400 },
      );
    }

    if (!title || !price || !paymentMethod || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Find user based on paymentReceipt
    const user = await User.findOne({ email: email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!email) {
      console.error("User does not have a registered email:", user);
      return NextResponse.json(
        { error: "User email is missing" },
        { status: 400 },
      );
    }

    // Update user details and set paymentStatus to "Processing"
    user.plan = title;
    user.paymentStatus = "Processing";
    user.updatedAt = new Date();

    // Save the updated user data
    const updatedUser = await user.save();

    // Generate the verification URL for admin
    const verificationUrl = `${process.env.DOMAIN}/auth/verifyPlan?ref=${user._id}`;

    // Send email to the user notifying them their account will be verified within 24 hours
    const userSubject = "Payment Received - Verification Pending";
    const userMessage = `
      <p>Thank you for your payment for the <strong>${title}</strong> plan. Your account is currently under review, and verification will be completed within 24 hours.</p>
      <p>Once verified, you will be able to refer others and start earning rewards.</p>
      <p>If you have any questions, feel free to contact support.</p>
    `;

    try {
      await resend.emails.send({
        from: "verify@thebandbaja.live",
        to: email,
        subject: userSubject,
        html: userMessage,
      });
      console.log("Verification pending email sent to:", email);
    } catch (emailError) {
      console.error("Failed to send verification pending email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification pending email" },
        { status: 500 },
      );
    }

    // Send email to admin with user details and verification link
    const adminSubject = `Payment Verification for User ${user._id}`;
    const adminMessage = `
      <h2>Payment Verification Required</h2>
      <p><strong>User ID:</strong> ${user._id}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Payment Receipt:</strong> <a href="${paymentReceipt}" target="_blank">View Receipt</a></p>
      <p><strong>Plan:</strong> ${title}</p>
      <p><strong>Cashback:</strong> ${cashback}</p>
      <p><strong>Price:</strong> ${price}</p>
      <p>Please verify the user's payment within 24 hours.</p>
      <p><a href="${verificationUrl}" target="_blank">Verify User</a></p>
    `;

    try {
      await resend.emails.send({
        from: "admin@thebandbaja.live",
        to: "adilsarfr00@gmail.com",
        subject: adminSubject,
        html: adminMessage,
      });
      console.log("Admin notification sent.");
    } catch (adminEmailError) {
      console.error(
        "Failed to send admin notification email:",
        adminEmailError,
      );
      return NextResponse.json(
        { error: "Failed to send admin notification email" },
        { status: 500 },
      );
    }

    // Send success response
    return NextResponse.json({
      message: "Payment received, awaiting verification",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
