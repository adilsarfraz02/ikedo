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

    // Determine payment method display name
    const paymentMethodDisplay = {
      'jazzcash': '📱 JazzCash',
      'easypaisa': '💳 Easypaisa',
      'bank': '🏦 Bank Account'
    }[withdrawal.paymentGateway] || withdrawal.paymentGateway.toUpperCase();

    // Send withdrawal completion email to the user with bank details
    await resend.emails.send({
      from: "withdraw@ikedo.live",
      to: user.email,
      subject: "✅ Withdrawal Completed - Payment Sent Successfully!",
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
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                      <div style="font-size: 60px; margin-bottom: 10px;">✅</div>
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                        Payment Sent Successfully!
                      </h1>
                      <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 14px;">
                        Your withdrawal has been completed
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
                        Great news! Your withdrawal request has been processed successfully, and the payment has been sent to your account.
                      </p>

                      <!-- Payment Confirmation Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 25px;">
                            <h2 style="color: #065f46; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                              💰 Payment Details
                            </h2>
                            
                            <table width="100%" cellpadding="8" cellspacing="0">
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">Amount Sent:</td>
                                <td style="color: #065f46; font-size: 20px; font-weight: bold; text-align: right; padding: 8px 0;">PKR ${amount.toFixed(2)}</td>
                              </tr>
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">Payment Method:</td>
                                <td style="color: #065f46; font-size: 14px; font-weight: 600; text-align: right; padding: 8px 0;">${paymentMethodDisplay}</td>
                              </tr>
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">Account Holder:</td>
                                <td style="color: #065f46; font-size: 14px; text-align: right; padding: 8px 0;">${withdrawal.accountHolderName}</td>
                              </tr>
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">${withdrawal.paymentGateway === 'bank' ? 'Account Number:' : 'Mobile Number:'}</td>
                                <td style="color: #065f46; font-size: 14px; font-family: monospace; text-align: right; padding: 8px 0;">${withdrawal.accountNumber}</td>
                              </tr>
                              ${withdrawal.bankName ? `
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">Bank Name:</td>
                                <td style="color: #065f46; font-size: 14px; text-align: right; padding: 8px 0;">${withdrawal.bankName}</td>
                              </tr>
                              ` : ''}
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">Transaction Date:</td>
                                <td style="color: #065f46; font-size: 14px; text-align: right; padding: 8px 0;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                              </tr>
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">Status:</td>
                                <td style="text-align: right; padding: 8px 0;">
                                  <span style="background-color: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                    ✓ COMPLETED
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Account Update -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">
                              💼 Updated Wallet Balance
                            </h3>
                            <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                              Your current wallet balance: <strong style="font-size: 18px;">PKR ${user.walletBalance.toFixed(2)}</strong>
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Important Information -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                              <strong>⏰ Processing Time:</strong><br>
                              Please allow 1-3 business days for the amount to reflect in your ${withdrawal.paymentGateway === 'bank' ? 'bank account' : 'mobile wallet'}. Processing times may vary depending on your financial institution.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- What to do if payment not received -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="color: #991b1b; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">
                              ❓ Didn't Receive Payment?
                            </h3>
                            <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                              If you don't receive the payment within 3 business days, please:
                            </p>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #991b1b; font-size: 14px; line-height: 1.8;">
                              <li>Check your account statement</li>
                              <li>Verify the account details you provided</li>
                              <li>Contact our support team with your transaction ID</li>
                            </ul>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                        Thank you for using our service. We appreciate your business!
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
                        Transaction ID: ${withdrawal._id}<br>
                        Completed: ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}<br>
                        Need help? Contact support@ikedo.live
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

    // Send notification email to admin
    await resend.emails.send({
      from: "withdraw@ikedo.live",
      to: process.env.ADMIN_EMAIL,
      subject: `✅ Withdrawal Completed - PKR ${amount} - ${user.username}`,
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
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
                      <div style="font-size: 50px; margin-bottom: 10px;">✅</div>
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
                        Withdrawal Completed
                      </h1>
                      <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 14px;">
                        Payment successfully processed
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                        A withdrawal of <strong style="color: #059669; font-size: 18px;">PKR ${amount.toFixed(2)}</strong> has been successfully completed for <strong>${user.email}</strong>.
                      </p>

                      <!-- Transaction Summary -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">
                              📊 Transaction Summary
                            </h3>
                            
                            <table width="100%" cellpadding="6" cellspacing="0">
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 6px 0;">Username:</td>
                                <td style="color: #1e293b; font-size: 14px; font-weight: 600; text-align: right; padding: 6px 0;">${user.username}</td>
                              </tr>
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 6px 0;">Email:</td>
                                <td style="color: #1e293b; font-size: 14px; text-align: right; padding: 6px 0;">${user.email}</td>
                              </tr>
                              <tr>
                                <td style="color: #64748b; font-size: 14px; padding: 6px 0;">Amount Paid:</td>
                                <td style="color: #059669; font-size: 16px; font-weight: bold; text-align: right; padding: 6px 0;">PKR ${amount.toFixed(2)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Payment Details -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ecfdf5; border-radius: 8px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 16px; font-weight: bold;">
                              💳 Payment Details
                            </h3>
                            
                            <table width="100%" cellpadding="6" cellspacing="0">
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 6px 0;">Account Holder:</td>
                                <td style="color: #065f46; font-size: 14px; font-weight: 600; text-align: right; padding: 6px 0;">${withdrawal.accountHolderName}</td>
                              </tr>
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 6px 0;">${withdrawal.paymentGateway === 'bank' ? 'Account Number:' : 'Mobile Number:'}</td>
                                <td style="color: #065f46; font-size: 14px; font-family: monospace; text-align: right; padding: 6px 0;">${withdrawal.accountNumber}</td>
                              </tr>
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 6px 0;">Payment Gateway:</td>
                                <td style="color: #065f46; font-size: 14px; font-weight: 600; text-align: right; padding: 6px 0;">${withdrawal.paymentGateway.toUpperCase()}</td>
                              </tr>
                              ${withdrawal.bankName ? `
                              <tr>
                                <td style="color: #064e3b; font-size: 14px; padding: 6px 0;">Bank Name:</td>
                                <td style="color: #065f46; font-size: 14px; font-weight: 600; text-align: right; padding: 6px 0;">${withdrawal.bankName}</td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Status Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d1fae5; border-radius: 8px; margin-bottom: 20px;">
                        <tr>
                          <td style="padding: 15px; text-align: center;">
                            <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">
                              ✓ User has been notified via email
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #64748b; font-size: 12px; margin: 20px 0 0 0; text-align: center;">
                        Withdrawal ID: ${withdrawal._id}<br>
                        Completed: ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 15px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                        This is an automated confirmation email from the withdrawal system
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
