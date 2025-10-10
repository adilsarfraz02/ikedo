import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Withdrawal from "@/models/Withdrawal";
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";

connect();

export async function POST(request) {
  try {
    const { userId, amount } = await request.json();

    // Check if userId is provided
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch user from database
    const user = await User.findById({ _id: userId });

    // Validate input: user, amount, and userId
    if (!amount || !userId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has sufficient balance
    if (user.walletBalance < amount || user.isWithdrawAmount < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Find the pending withdrawal
    const withdrawal = await Withdrawal.findOne({
      userId: user._id,
      amount: amount,
      status: "pending",
    }).sort({ requestedAt: -1 });

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    // Process withdrawal
    user.isWithdraw = false;
    user.isWithdrawAmount -= amount; // Deduct the amount
    user.walletBalance -= amount; // Deduct from wallet
    await user.save(); // Save the updated user info

    // Update withdrawal status
    withdrawal.status = "completed";
    withdrawal.completedAt = new Date();
    await withdrawal.save();

    // Send withdrawal completion email to the user with bank details
    await resend.emails.send({
      from: "withdraw@ikedo.live",
      to: user.email,
      subject: "Withdrawal Completed Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">✅ Withdrawal Completed!</h2>
          <p>Dear ${user.username},</p>
          <p>Your withdrawal request has been processed successfully.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Payment Details:</h3>
            <p><strong>Amount Sent:</strong> $${amount}</p>
            <p><strong>Payment Method:</strong> ${withdrawal.paymentGateway.toUpperCase()}</p>
            <p><strong>Account Holder:</strong> ${withdrawal.accountHolderName}</p>
            <p><strong>Account Number:</strong> ${withdrawal.accountNumber}</p>
            ${withdrawal.bankName ? `<p><strong>Bank Name:</strong> ${withdrawal.bankName}</p>` : ''}
            <p><strong>Transaction Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <p style="margin: 0;"><strong>✓ Payment has been sent to your account</strong></p>
            <p style="margin: 10px 0 0 0;">Please allow 1-3 business days for the amount to reflect in your account.</p>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Current Wallet Balance:</strong> $${user.walletBalance.toFixed(2)}</p>
          </div>
          
          <p>If you don't receive the payment within 3 business days, please contact our support team.</p>
          
          <p>Thank you for using our service!</p>
          
          <p>Best regards,<br>Ikedo Team</p>
        </div>
      `,
    });

    // Send notification email to admin
    await resend.emails.send({
      from: "withdraw@ikedo.live",
      to: process.env.ADMIN_EMAIL,
      subject: "Withdrawal Completed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Withdrawal Processed</h2>
          
          <p>A withdrawal of <strong>$${amount}</strong> has been completed for <strong>${user.email}</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Payment Details:</h3>
            <p><strong>Account Holder:</strong> ${withdrawal.accountHolderName}</p>
            <p><strong>Account Number:</strong> ${withdrawal.accountNumber}</p>
            <p><strong>Payment Gateway:</strong> ${withdrawal.paymentGateway.toUpperCase()}</p>
            ${withdrawal.bankName ? `<p><strong>Bank Name:</strong> ${withdrawal.bankName}</p>` : ''}
          </div>
          
          <p>Withdrawal ID: ${withdrawal._id}</p>
        </div>
      `,
    });

    // Return success response
    return NextResponse.json(
      { message: "Withdrawal completed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Withdrawal verification error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
