import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Withdrawal from "@/models/Withdrawal";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { resend } from "@/lib/resend";

connect();

export async function POST(request) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { amount, accountNumber, paymentGateway, accountHolderName, bankName } = await request.json();
    const user = await User.findById({ _id: userId });

    // Check required fields
    if (!amount || !accountNumber || !paymentGateway || !accountHolderName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

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

    // Check if user already has a pending withdrawal
    if (user.isWithdraw) {
      return NextResponse.json(
        { error: "You already have a pending withdrawal request" },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      userId: user._id,
      amount,
      accountNumber,
      accountHolderName,
      bankName: bankName || "",
      paymentGateway,
      status: "pending",
    });
    await withdrawal.save();

    // Update user status
    user.isWithdraw = true;
    await user.save();

    // Send withdrawal confirmation email to user with bank details
    await resend.emails.send({
      from: "withdraw@ikedo.live",
      to: user.email,
      subject: "Withdrawal Request Submitted - 24 Hour Processing",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Withdrawal Request Submitted Successfully</h2>
          <p>Dear ${user.username},</p>
          <p>Your withdrawal request has been submitted successfully and is under review.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Withdrawal Details:</h3>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Payment Gateway:</strong> ${paymentGateway.toUpperCase()}</p>
            <p><strong>Account Holder Name:</strong> ${accountHolderName}</p>
            <p><strong>Account Number:</strong> ${accountNumber}</p>
            ${bankName ? `<p><strong>Bank Name:</strong> ${bankName}</p>` : ''}
            <p><strong>Status:</strong> Pending</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0;"><strong>⏰ Processing Time:</strong> Your withdrawal will be processed within 24 hours.</p>
          </div>
          
          <p>You will receive another email once your withdrawal is processed.</p>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>Ikedo Team</p>
        </div>
      `,
    });

    // Send notification email to admin with bank details
    await resend.emails.send({
      from: "withdraw@ikedo.live",
      to: process.env.ADMIN_EMAIL,
      subject: "New Withdrawal Request - Action Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d32f2f;">New Withdrawal Request</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">User Information:</h3>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>User ID:</strong> ${user._id}</p>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Bank Details:</h3>
            <p><strong>Amount:</strong> $${amount}</p>
            <p><strong>Payment Gateway:</strong> ${paymentGateway.toUpperCase()}</p>
            <p><strong>Account Holder Name:</strong> ${accountHolderName}</p>
            <p><strong>Account Number:</strong> ${accountNumber}</p>
            ${bankName ? `<p><strong>Bank Name:</strong> ${bankName}</p>` : ''}
          </div>
          
          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0;"><strong>⏰ Please process within 24 hours</strong></p>
          </div>
          
          <div style="margin: 30px 0;">
            <a href="${process.env.DOMAIN}/withdraw/amount/${user._id}?amount=${amount}" 
               style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify & Process Withdrawal
            </a>
          </div>
          
          <p style="color: #666; font-size: 12px;">Withdrawal ID: ${withdrawal._id}</p>
        </div>
      `,
    });

    return NextResponse.json(
      { 
        message: "Withdrawal request submitted successfully. You will receive payment within 24 hours.",
        withdrawalId: withdrawal._id 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Withdrawal request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch withdrawal history
export async function GET(request) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const withdrawals = await Withdrawal.find({ userId })
      .sort({ requestedAt: -1 })
      .limit(50);

    return NextResponse.json({ withdrawals }, { status: 200 });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
