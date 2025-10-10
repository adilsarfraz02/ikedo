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

    // Generate verification token for email links
    const verificationToken = jwt.sign(
      { depositId: deposit._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token valid for 7 days
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const approveUrl = `${baseUrl}/api/deposit/verify-email?token=${verificationToken}&action=approve`;
    const rejectUrl = `${baseUrl}/api/deposit/verify-email?token=${verificationToken}&action=reject`;

    // Send email to admin
    try {
      await resend.emails.send({
        from: "IKedo Wallet <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL || "admin@example.com",
        subject: "🔔 New Deposit Request - Action Required",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h2 style="color: white; margin: 0; font-size: 28px;">💰 New Deposit Request</h2>
              <p style="color: #e0e7ff; margin: 10px 0 0 0;">Action Required - Verify Payment</p>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
                <h3 style="margin-top: 0; color: #667eea; font-size: 18px;">👤 User Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Name:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: bold; text-align: right;">${user.username}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; border-top: 1px solid #e5e7eb;">Email:</td>
                    <td style="padding: 8px 0; color: #111827; text-align: right; border-top: 1px solid #e5e7eb;">${user.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; border-top: 1px solid #e5e7eb;">User ID:</td>
                    <td style="padding: 8px 0; color: #6b7280; text-align: right; border-top: 1px solid #e5e7eb; font-family: monospace; font-size: 12px;">${user._id}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #10b981;">
                <h3 style="margin-top: 0; color: #10b981; font-size: 18px;">💳 Deposit Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Amount:</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: bold; font-size: 20px; text-align: right;">Rs ${amount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; border-top: 1px solid #e5e7eb;">Payment Method:</td>
                    <td style="padding: 8px 0; color: #111827; text-align: right; border-top: 1px solid #e5e7eb; text-transform: capitalize;">${paymentMethod.replace('_', ' ')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; border-top: 1px solid #e5e7eb;">Transaction ID:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600; text-align: right; border-top: 1px solid #e5e7eb;">${transactionId}</td>
                  </tr>
                  ${remarks ? `
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; border-top: 1px solid #e5e7eb;">Remarks:</td>
                    <td style="padding: 8px 0; color: #111827; text-align: right; border-top: 1px solid #e5e7eb;">${remarks}</td>
                  </tr>
                  ` : ""}
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; border-top: 1px solid #e5e7eb;">Request Date:</td>
                    <td style="padding: 8px 0; color: #111827; text-align: right; border-top: 1px solid #e5e7eb;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              
              ${paymentProof ? `
              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b; text-align: center;">
                <h3 style="margin-top: 0; color: #f59e0b; font-size: 18px;">📄 Payment Proof</h3>
                <a href="${paymentProof}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                  🔍 View Payment Screenshot
                </a>
              </div>
              ` : ""}
              
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #92400e; font-weight: bold;">⚠️ ACTION REQUIRED</p>
                <p style="margin: 10px 0; color: #92400e;">Please verify the payment proof and take action:</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${approveUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 10px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                  ✅ Approve Deposit
                </a>
                <a href="${rejectUrl}" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 10px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);">
                  ❌ Reject Deposit
                </a>
              </div>
              
              <div style="background: #e0e7ff; padding: 15px; border-radius: 6px; margin-top: 25px; font-size: 13px; color: #4338ca;">
                <p style="margin: 0;"><strong>📌 Quick Tips:</strong></p>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Click "Approve" to credit Rs ${amount.toFixed(2)} to user's wallet</li>
                  <li>Click "Reject" if payment proof is invalid or unclear</li>
                  <li>User will be automatically notified via email</li>
                  <li>These links expire in 7 days</li>
                </ul>
              </div>
              
              <div style="margin-top: 25px; padding: 15px; background: #f3f4f6; border-radius: 6px; font-size: 12px; color: #6b7280;">
                <p style="margin: 0;"><strong>Deposit ID:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${deposit._id}</code></p>
              </div>
              
              <p style="margin-top: 30px; color: #9ca3af; font-size: 12px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                This is an automated email from IKedo Wallet System.<br>
                If you have any issues with these links, please log in to the admin panel to verify manually.
              </p>
            </div>
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
