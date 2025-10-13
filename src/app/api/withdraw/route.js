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

    const { amount, accountNumber, paymentGateway, accountHolderName, bankName, accountType } = await request.json();
    const user = await User.findById({ _id: userId });

    // Check required fields
    if (!amount || !accountNumber || !paymentGateway || !accountHolderName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate bank name for bank accounts
    if (paymentGateway === 'bank' && !bankName) {
      return NextResponse.json(
        { error: "Bank name is required for bank account withdrawals" },
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

    // Check minimum withdrawal amount
    if (amount < 100) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is PKR 100" },
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
      accountType: accountType || "mobile_wallet",
      status: "pending",
    });
    await withdrawal.save();

    // Update user status
    user.isWithdraw = true;
    await user.save();

    // Determine payment method display name
    const paymentMethodDisplay = {
      'jazzcash': '📱 JazzCash',
      'easypaisa': '💳 Easypaisa',
      'bank': '🏦 Bank Account'
    }[paymentGateway] || paymentGateway.toUpperCase();

    // Send withdrawal confirmation email to user with bank details
    try {
      console.log("📧 Attempting to send user confirmation email to:", user.email);
      const userEmailResponse = await resend.emails.send({
        from: "IKedo Wallet <onboarding@resend.dev>",
        to: user.email,
    
      subject: "✅ Withdrawal Request Received - Processing Within 24 Hours",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                        🎉 Withdrawal Request Received
                      </h1>
                      <p style="color: #e9d5ff; margin: 10px 0 0 0; font-size: 14px;">
                        We're processing your withdrawal
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Dear <strong>${user.username}</strong>,
                      </p>
                      
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Your withdrawal request has been submitted successfully! Our admin team will review and process your request shortly.
                      </p>

                      <!-- Withdrawal Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 25px;">
                            <h2 style="color: #1e3a8a; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                              📋 Withdrawal Details
                            </h2>
                            
                            <table width="100%" cellpadding="8" cellspacing="0">
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Amount Requested:</td>
                                <td style="color: #1e293b; font-size: 16px; font-weight: bold; text-align: right; padding: 8px 0;">PKR ${amount.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Payment Method:</td>
                                <td style="color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${paymentMethodDisplay}</td>
                              </tr>
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Account Holder:</td>
                                <td style="color: #1e293b; font-size: 14px; text-align: right; padding: 8px 0;">${accountHolderName}</td>
                              </tr>
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">${paymentGateway === 'bank' ? 'Account Number:' : 'Mobile Number:'}</td>
                                <td style="color: #1e293b; font-size: 14px; text-align: right; padding: 8px 0;">${accountNumber}</td>
                              </tr>
                              ${bankName ? `
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Bank Name:</td>
                                <td style="color: #1e293b; font-size: 14px; text-align: right; padding: 8px 0;">${bankName}</td>
                              </tr>
                              ` : ''}
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Status:</td>
                                <td style="text-align: right; padding: 8px 0;">
                                  <span style="background-color: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                    ⏳ PENDING
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Processing Timeline -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border-left: 4px solid #fbbf24; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                              <strong>⏰ Processing Time:</strong><br>
                              Your withdrawal will be processed within <strong>24 hours</strong>. You will receive another email once the payment is completed.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- What's Next -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="color: #15803d; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">
                              ✨ What Happens Next?
                            </h3>
                            <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px; line-height: 1.8;">
                              <li>Admin will review your withdrawal request</li>
                              <li>Payment will be processed to your account</li>
                              <li>You'll receive a confirmation email</li>
                              <li>Funds should appear within 1-3 business days</li>
                            </ul>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                        If you have any questions or don't receive your payment within the specified time, please contact our support team.
                      </p>

                      <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
                        Best regards,<br>
                        <strong>The Ikedo Team</strong>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        Request ID: ${withdrawal._id}<br>
                        Requested on: ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

      console.log("✅ User confirmation email sent successfully to:", user.email);
    } catch (emailError) {
      console.error("❌ Failed to send user confirmation email:", emailError);
      // Continue execution even if email fails
    }

    // Send notification email to admin with bank details
    try {
      console.log("📧 Attempting to send admin notification email to:", process.env.ADMIN_EMAIL);
      const adminEmailResponse = await resend.emails.send({
        from: "IKedo Wallet <onboarding@resend.dev>",
        to: process.env.ADMIN_EMAIL || "admin@example.com",
      subject: `🔔 NEW WITHDRAWAL REQUEST - PKR ${amount} - Action Required`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                        🔔 NEW WITHDRAWAL REQUEST
                      </h1>
                      <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">
                        Immediate Action Required
                      </p>
                    </td>
                  </tr>

                  <!-- Urgent Notice -->
                  <tr>
                    <td style="padding: 30px 30px 0 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0; color: #92400e; font-size: 16px; font-weight: bold;">
                              ⏰ Processing Deadline: Within 24 Hours
                            </p>
                            <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
                              This withdrawal request must be processed and completed within 24 hours.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      
                      <!-- User Information -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 25px;">
                            <h2 style="color: #1e3a8a; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                              👤 User Information
                            </h2>
                            
                            <table width="100%" cellpadding="8" cellspacing="0">
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 8px 0; width: 40%;">Username:</td>
                                <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0;">${user.username}</td>
                              </tr>
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Email:</td>
                                <td style="color: #1e293b; font-size: 14px; font-weight: 600; padding: 8px 0;">${user.email}</td>
                              </tr>
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">User ID:</td>
                                <td style="color: #64748b; font-size: 12px; font-family: monospace; padding: 8px 0;">${user._id}</td>
                              </tr>
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 8px 0;">Wallet Balance:</td>
                                <td style="color: #059669; font-size: 14px; font-weight: 600; padding: 8px 0;">PKR ${user.walletBalance.toFixed(2)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Payment Details -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 8px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 25px;">
                            <h2 style="color: #065f46; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                              💰 Payment Details - SEND TO USER
                            </h2>
                            
                            <table width="100%" cellpadding="8" cellspacing="0">
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 8px 0; width: 40%;">Amount to Send:</td>
                                <td style="color: #065f46; font-size: 20px; font-weight: bold; padding: 8px 0;">PKR ${amount.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">Payment Method:</td>
                                <td style="color: #065f46; font-size: 16px; font-weight: 600; padding: 8px 0;">${paymentMethodDisplay}</td>
                              </tr>
                              <tr style="background-color: rgba(255,255,255,0.5);">
                                <td style="color: #064e3b; font-size: 14px; padding: 12px 8px; font-weight: bold;">Account Holder Name:</td>
                                <td style="color: #065f46; font-size: 16px; font-weight: bold; padding: 12px 8px;">${accountHolderName}</td>
                              </tr>
                              <tr style="background-color: rgba(255,255,255,0.5);">
                                <td style="color: #064e3b; font-size: 14px; padding: 12px 8px; font-weight: bold;">${paymentGateway === 'bank' ? 'Account Number (IBAN):' : 'Mobile Wallet Number:'}</td>
                                <td style="color: #065f46; font-size: 16px; font-weight: bold; padding: 12px 8px; font-family: monospace;">${accountNumber}</td>
                              </tr>
                              ${bankName ? `
                              <tr style="background-color: rgba(255,255,255,0.5);">
                                <td style="color: #064e3b; font-size: 14px; padding: 12px 8px; font-weight: bold;">Bank Name:</td>
                                <td style="color: #065f46; font-size: 16px; font-weight: bold; padding: 12px 8px;">${bankName}</td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Processing Instructions -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ede9fe; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="color: #5b21b6; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">
                              📝 Processing Instructions
                            </h3>
                            <ol style="margin: 0; padding-left: 20px; color: #5b21b6; font-size: 14px; line-height: 1.8;">
                              <li>Verify user balance and account details</li>
                              <li>Process payment to the user's ${paymentGateway === 'bank' ? 'bank account' : 'mobile wallet'}</li>
                              <li>Click the verification link below to complete</li>
                              <li>User will be notified automatically</li>
                            </ol>
                          </td>
                        </tr>
                      </table>

                      <!-- Action Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${process.env.DOMAIN || 'https://ikedo.live'}/withdraw/amount/${user._id}?amount=${amount}" 
                               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                              ✅ VERIFY & COMPLETE WITHDRAWAL
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-top: 15px;">
                            <p style="margin: 0; color: #64748b; font-size: 12px;">
                              Click this button after sending the payment to complete the process
                            </p>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        Withdrawal ID: ${withdrawal._id}<br>
                        Requested: ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}<br>
                        Must be completed by: ${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

      console.log("✅ Admin notification email sent successfully to:", process.env.ADMIN_EMAIL);
    } catch (emailError) {
      console.error("❌ Failed to send admin notification email:", emailError);
      // Continue execution even if email fails
    }

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
