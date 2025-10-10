import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Deposit from "@/models/Deposit";
import User from "@/models/userModel";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

connect();

// POST - Admin verify/reject deposit
export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminId = decoded.id;

    // Check if user is admin
    const admin = await User.findById(adminId);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { depositId, action, rejectionReason } = body;

    if (!depositId || !action) {
      return NextResponse.json(
        { error: "Deposit ID and action are required" },
        { status: 400 }
      );
    }

    if (!["verify", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'verify' or 'reject'" },
        { status: 400 }
      );
    }

    // Find deposit
    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return NextResponse.json(
        { error: "Deposit not found" },
        { status: 404 }
      );
    }

    if (deposit.status !== "pending") {
      return NextResponse.json(
        { error: "This deposit has already been processed" },
        { status: 400 }
      );
    }

    // Get user
    const user = await User.findById(deposit.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (action === "verify") {
      // Update deposit status
      deposit.status = "verified";
      deposit.verifiedBy = adminId;
      deposit.verifiedAt = new Date();
      await deposit.save();

      // Update user wallet balance
      user.walletBalance = (user.walletBalance || 0) + deposit.amount;
      await user.save();

      // Send success email to user
      try {
        await resend.emails.send({
          from: "IKedo Wallet <onboarding@resend.dev>",
          to: user.email,
          subject: "Deposit Verified - Amount Credited to Your Wallet",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Deposit Verified Successfully!</h2>
              
              <p>Hello ${user.username},</p>
              
              <p>Great news! Your deposit request has been verified and the amount has been credited to your wallet.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Deposit Details</h3>
                <p><strong>Amount:</strong> Rs ${deposit.amount.toFixed(2)}</p>
                <p><strong>Transaction ID:</strong> ${deposit.transactionId}</p>
                <p><strong>Verified Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #059669;">New Wallet Balance</h3>
                <p style="font-size: 24px; font-weight: bold; color: #059669; margin: 0;">
                  Rs ${user.walletBalance.toFixed(2)}
                </p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <p style="margin: 0;">You can now use this balance for purchasing plans or making withdrawals.</p>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                Thank you for choosing IKedo!
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }

      return NextResponse.json(
        {
          message: "Deposit verified successfully. User wallet updated.",
          deposit,
          newBalance: user.walletBalance,
        },
        { status: 200 }
      );
    } else if (action === "reject") {
      // Update deposit status
      deposit.status = "rejected";
      deposit.verifiedBy = adminId;
      deposit.verifiedAt = new Date();
      deposit.rejectionReason = rejectionReason || "No reason provided";
      await deposit.save();

      // Send rejection email to user
      try {
        await resend.emails.send({
          from: "IKedo Wallet <onboarding@resend.dev>",
          to: user.email,
          subject: "Deposit Request Rejected",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Deposit Request Rejected</h2>
              
              <p>Hello ${user.username},</p>
              
              <p>We regret to inform you that your deposit request has been rejected.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Deposit Details</h3>
                <p><strong>Amount:</strong> Rs ${deposit.amount.toFixed(2)}</p>
                <p><strong>Transaction ID:</strong> ${deposit.transactionId}</p>
                <p><strong>Rejected Date:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="margin-top: 0; color: #dc2626;">Rejection Reason</h3>
                <p style="margin: 0;">${deposit.rejectionReason}</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0;">If you believe this is an error or need clarification, please contact our support team with your transaction ID.</p>
              </div>
              
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                Thank you for your understanding.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }

      return NextResponse.json(
        {
          message: "Deposit rejected successfully.",
          deposit,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Deposit verification error:", error);
    return NextResponse.json(
      { error: "Failed to process deposit verification" },
      { status: 500 }
    );
  }
}
