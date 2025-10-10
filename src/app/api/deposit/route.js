import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Deposit from "@/models/Deposit";
import User from "@/models/userModel";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

connect();

// POST - Create deposit request
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
    const userId = decoded.id;

    const body = await request.json();
    const { amount, paymentMethod, transactionId, paymentProof, remarks } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    if (!transactionId) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create deposit record
    const deposit = await Deposit.create({
      userId,
      amount,
      paymentMethod,
      transactionId,
      paymentProof,
      remarks,
      status: "pending",
    });

    // Send email to admin
    try {
      await resend.emails.send({
        from: "IKedo Wallet <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL || "admin@example.com",
        subject: "New Deposit Request - Verification Required",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">New Deposit Request</h2>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">User Information</h3>
              <p><strong>Name:</strong> ${user.username}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>User ID:</strong> ${user._id}</p>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Deposit Details</h3>
              <p><strong>Amount:</strong> Rs ${amount.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ""}
              <p><strong>Request Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            ${paymentProof ? `
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Payment Proof</h3>
                <p><a href="${paymentProof}" style="color: #7c3aed;">View Payment Slip</a></p>
              </div>
            ` : ""}
            
            <div style="margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px;">
              <p style="margin: 0;"><strong>Action Required:</strong></p>
              <p style="margin: 10px 0 0 0;">Please verify this deposit and approve/reject it from the admin panel.</p>
              <p style="margin: 10px 0 0 0;"><strong>Deposit ID:</strong> ${deposit._id}</p>
            </div>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              This is an automated email from IKedo Wallet System.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send admin email:", emailError);
    }

    // Send confirmation email to user
    try {
      await resend.emails.send({
        from: "IKedo Wallet <onboarding@resend.dev>",
        to: user.email,
        subject: "Deposit Request Received - Pending Verification",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Deposit Request Received</h2>
            
            <p>Hello ${user.username},</p>
            
            <p>We have received your deposit request and it is currently being verified by our admin team.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Request Details</h3>
              <p><strong>Amount:</strong> Rs ${amount.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Status:</strong> Pending Verification</p>
              <p><strong>Request Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <p style="margin: 0;"><strong>Note:</strong> Your deposit will be credited to your wallet once it is verified by our admin team. This usually takes 24-48 hours.</p>
            </div>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send user email:", emailError);
    }

    return NextResponse.json(
      {
        message: "Deposit request submitted successfully. Awaiting admin verification.",
        deposit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Deposit submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit deposit request" },
      { status: 500 }
    );
  }
}

// GET - Get user's deposit history
export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const deposits = await Deposit.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ deposits }, { status: 200 });
  } catch (error) {
    console.error("Get deposits error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deposits" },
      { status: 500 }
    );
  }
}
