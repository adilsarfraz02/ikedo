import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Deposit from "@/models/Deposit";
import User from "@/models/userModel";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

connect();

// GET - Admin verify/reject deposit via email link
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const action = searchParams.get("action");

    if (!token || !action) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Request</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            .error { color: #ef4444; }
            h1 { margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ Invalid Request</h1>
            <p>Missing verification token or action parameter.</p>
          </div>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Action</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            .error { color: #ef4444; }
            h1 { margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ Invalid Action</h1>
            <p>Action must be either 'approve' or 'reject'.</p>
          </div>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Verify and decode token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Token</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            .error { color: #ef4444; }
            h1 { margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ Invalid or Expired Token</h1>
            <p>This verification link has expired or is invalid.</p>
          </div>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    const { depositId } = decoded;

    // Find deposit
    const deposit = await Deposit.findById(depositId);
    if (!deposit) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Deposit Not Found</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            .error { color: #ef4444; }
            h1 { margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ Deposit Not Found</h1>
            <p>The deposit request could not be found.</p>
          </div>
        </body>
        </html>
        `,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    if (deposit.status !== "pending") {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already Processed</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            .warning { color: #f59e0b; }
            h1 { margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="warning">⚠️ Already Processed</h1>
            <p>This deposit has already been ${deposit.status}.</p>
          </div>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Get user
    const user = await User.findById(deposit.userId);
    if (!user) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>User Not Found</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            .error { color: #ef4444; }
            h1 { margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ User Not Found</h1>
            <p>The user associated with this deposit could not be found.</p>
          </div>
        </body>
        </html>
        `,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    if (action === "approve") {
      // Update deposit status
      deposit.status = "verified";
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
          subject: "✅ Deposit Approved - Amount Credited to Your Wallet",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h2 style="color: white; margin: 0; font-size: 28px;">✅ Deposit Approved!</h2>
              </div>
              
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; color: #374151;">Hello <strong>${user.username}</strong>,</p>
                
                <p style="font-size: 16px; color: #374151;">Great news! Your deposit request has been approved and the amount has been credited to your wallet.</p>
                
                <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #10b981;">
                  <h3 style="margin-top: 0; color: #059669; font-size: 18px;">💰 Deposit Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; color: #6b7280; font-weight: 500;">Amount Credited:</td>
                      <td style="padding: 10px 0; color: #059669; font-weight: bold; font-size: 18px; text-align: right;">Rs ${deposit.amount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #6b7280; border-top: 1px solid #e5e7eb;">Transaction ID:</td>
                      <td style="padding: 10px 0; color: #374151; text-align: right; border-top: 1px solid #e5e7eb;">${deposit.transactionId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #6b7280; border-top: 1px solid #e5e7eb;">Approved Date:</td>
                      <td style="padding: 10px 0; color: #374151; text-align: right; border-top: 1px solid #e5e7eb;">${new Date().toLocaleString()}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
                  <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 500;">NEW WALLET BALANCE</p>
                  <p style="font-size: 36px; font-weight: bold; color: #059669; margin: 10px 0;">Rs ${user.walletBalance.toFixed(2)}</p>
                </div>
                
                <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                  <p style="margin: 0; color: #1e40af; font-size: 14px;">💡 <strong>What's Next?</strong> You can now use this balance for purchasing plans, making withdrawals, or other transactions on our platform.</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Dashboard</a>
                </div>
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 13px; text-align: center;">
                  Thank you for choosing IKedo! 🎉
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }

      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Deposit Approved</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 500px;
            }
            .success { color: #10b981; font-size: 60px; margin: 0; }
            h1 { color: #059669; margin: 20px 0; }
            .details {
              background: #f0fdf4;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
            }
            .details p {
              margin: 10px 0;
              color: #374151;
            }
            .details strong {
              color: #059669;
            }
            .balance {
              background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .balance-amount {
              font-size: 32px;
              font-weight: bold;
              color: #059669;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅</div>
            <h1>Deposit Approved Successfully!</h1>
            <p>The deposit has been verified and credited to the user's wallet.</p>
            <div class="details">
              <p><strong>User:</strong> ${user.username} (${user.email})</p>
              <p><strong>Amount:</strong> Rs ${deposit.amount.toFixed(2)}</p>
              <p><strong>Transaction ID:</strong> ${deposit.transactionId}</p>
            </div>
            <div class="balance">
              <p style="margin: 0; color: #065f46; font-size: 14px;">New Wallet Balance</p>
              <div class="balance-amount">Rs ${user.walletBalance.toFixed(2)}</div>
            </div>
            <p style="color: #6b7280; font-size: 14px;">User has been notified via email.</p>
          </div>
        </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }
      );
    } else if (action === "reject") {
      // Update deposit status
      deposit.status = "rejected";
      deposit.verifiedAt = new Date();
      deposit.rejectionReason = "Rejected by admin via email";
      await deposit.save();

      // Send rejection email to user
      try {
        await resend.emails.send({
          from: "IKedo Wallet <onboarding@resend.dev>",
          to: user.email,
          subject: "❌ Deposit Request Rejected",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h2 style="color: white; margin: 0; font-size: 28px;">❌ Deposit Rejected</h2>
              </div>
              
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; color: #374151;">Hello <strong>${user.username}</strong>,</p>
                
                <p style="font-size: 16px; color: #374151;">We regret to inform you that your deposit request has been rejected by our admin team.</p>
                
                <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #ef4444;">
                  <h3 style="margin-top: 0; color: #dc2626; font-size: 18px;">📋 Deposit Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; color: #6b7280;">Amount:</td>
                      <td style="padding: 10px 0; color: #374151; font-weight: bold; text-align: right;">Rs ${deposit.amount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #6b7280; border-top: 1px solid #e5e7eb;">Transaction ID:</td>
                      <td style="padding: 10px 0; color: #374151; text-align: right; border-top: 1px solid #e5e7eb;">${deposit.transactionId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #6b7280; border-top: 1px solid #e5e7eb;">Rejected Date:</td>
                      <td style="padding: 10px 0; color: #374151; text-align: right; border-top: 1px solid #e5e7eb;">${new Date().toLocaleString()}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="background: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 25px 0;">
                  <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>⚠️ Reason:</strong> ${deposit.rejectionReason}</p>
                </div>
                
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; color: #92400e; font-size: 14px;">💡 <strong>Need Help?</strong> If you believe this is an error or need clarification, please contact our support team with your transaction ID.</p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/contact" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Contact Support</a>
                </div>
                
                <p style="margin-top: 30px; color: #6b7280; font-size: 13px; text-align: center;">
                  Thank you for your understanding.
                </p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }

      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Deposit Rejected</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              text-align: center;
              max-width: 500px;
            }
            .error { color: #ef4444; font-size: 60px; margin: 0; }
            h1 { color: #dc2626; margin: 20px 0; }
            .details {
              background: #fef2f2;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
            }
            .details p {
              margin: 10px 0;
              color: #374151;
            }
            .details strong {
              color: #dc2626;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error">❌</div>
            <h1>Deposit Rejected</h1>
            <p>The deposit has been rejected and user has been notified.</p>
            <div class="details">
              <p><strong>User:</strong> ${user.username} (${user.email})</p>
              <p><strong>Amount:</strong> Rs ${deposit.amount.toFixed(2)}</p>
              <p><strong>Transaction ID:</strong> ${deposit.transactionId}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">User has been notified via email.</p>
          </div>
        </body>
        </html>
        `,
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }
      );
    }
  } catch (error) {
    console.error("Deposit email verification error:", error);
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
          }
          .error { color: #ef4444; }
          h1 { margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="error">⚠️ Server Error</h1>
          <p>An error occurred while processing the deposit verification.</p>
          <p style="color: #6b7280; font-size: 14px;">Please try again or contact support.</p>
        </div>
      </body>
      </html>
      `,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}
