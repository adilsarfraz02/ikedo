import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import Withdrawal from "@/models/Withdrawal";
import { NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { resend } from "@/lib/resend";

connect();

// GET - Fetch all withdrawal requests (Admin only)
export async function GET(request) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin
    const admin = await User.findById(userId);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId_filter = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const skip = parseInt(searchParams.get('skip')) || 0;

    // Build query
    let query = {};
    if (status) {
      query.status = status;
    }
    if (userId_filter) {
      query.userId = userId_filter;
    }

    // Fetch withdrawals with user details
    const withdrawals = await Withdrawal.find(query)
      .populate('userId', 'username email image walletBalance isWithdrawAmount')
      .sort({ requestedAt: -1 })
      .limit(limit)
      .skip(skip);

    // Get total count for pagination
    const totalCount = await Withdrawal.countDocuments(query);

    // Calculate statistics
    const stats = {
      total: await Withdrawal.countDocuments(),
      pending: await Withdrawal.countDocuments({ status: 'pending' }),
      processing: await Withdrawal.countDocuments({ status: 'processing' }),
      completed: await Withdrawal.countDocuments({ status: 'completed' }),
      rejected: await Withdrawal.countDocuments({ status: 'rejected' }),
      totalAmount: await Withdrawal.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      pendingAmount: await Withdrawal.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      completedAmount: await Withdrawal.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
    };

    return NextResponse.json({
      success: true,
      withdrawals,
      stats,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + withdrawals.length < totalCount
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Admin get withdrawals error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update withdrawal status (Admin only)
export async function PUT(request) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if user is admin
    const admin = await User.findById(userId);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const { withdrawalId, status, adminNote, transactionId } = await request.json();

    if (!withdrawalId || !status) {
      return NextResponse.json(
        { error: "Withdrawal ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Find withdrawal
    const withdrawal = await Withdrawal.findById(withdrawalId).populate('userId');
    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal not found" },
        { status: 404 }
      );
    }

    const user = withdrawal.userId;
    const previousStatus = withdrawal.status;

    // Update withdrawal status
    withdrawal.status = status;
    if (adminNote) withdrawal.adminNote = adminNote;
    if (transactionId) withdrawal.transactionId = transactionId;

    const now = new Date();

    // Handle status-specific updates
    if (status === 'processing') {
      withdrawal.processedAt = now;
    } else if (status === 'completed') {
      withdrawal.completedAt = now;
      
      // Deduct amount from user's wallet balance and isWithdrawAmount
      if (previousStatus !== 'completed') {
        user.walletBalance = (user.walletBalance || 0) - withdrawal.amount;
        user.isWithdrawAmount = (user.isWithdrawAmount || 0) - withdrawal.amount;
        user.isWithdraw = false; // Allow new withdrawal requests
        await user.save();

        console.log(`💰 Withdrawal completed: Deducted PKR ${withdrawal.amount} from user ${user.username}`);
        console.log(`📊 New balances - Wallet: PKR ${user.walletBalance}, Withdrawable: PKR ${user.isWithdrawAmount}`);
      }

      // Send completion email to user
      try {
        await resend.emails.send({
          from: "IKedo Wallet <onboarding@resend.dev>",
          to: user.email,
          subject: "✅ Withdrawal Completed - Funds Transferred",
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
                          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                            ✅ Withdrawal Completed!
                          </h1>
                          <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 14px;">
                            Your funds have been transferred
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
                            Great news! Your withdrawal request has been processed and the funds have been transferred to your account.
                          </p>

                          <!-- Payment Details -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 8px; margin-bottom: 30px;">
                            <tr>
                              <td style="padding: 25px;">
                                <h2 style="color: #065f46; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                                  💰 Payment Details
                                </h2>
                                
                                <table width="100%" cellpadding="8" cellspacing="0">
                                  <tr>
                                    <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">Amount Transferred:</td>
                                    <td style="color: #065f46; font-size: 20px; font-weight: bold; text-align: right; padding: 8px 0;">PKR ${withdrawal.amount.toFixed(2)}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">Account Holder:</td>
                                    <td style="color: #065f46; font-size: 14px; text-align: right; padding: 8px 0;">${withdrawal.accountHolderName}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">${withdrawal.paymentGateway === 'bank' ? 'Account Number:' : 'Mobile Number:'}</td>
                                    <td style="color: #065f46; font-size: 14px; text-align: right; padding: 8px 0;">${withdrawal.accountNumber}</td>
                                  </tr>
                                  ${withdrawal.bankName ? `
                                  <tr>
                                    <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">Bank Name:</td>
                                    <td style="color: #065f46; font-size: 14px; text-align: right; padding: 8px 0;">${withdrawal.bankName}</td>
                                  </tr>
                                  ` : ''}
                                  ${transactionId ? `
                                  <tr>
                                    <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">Transaction ID:</td>
                                    <td style="color: #065f46; font-size: 12px; font-family: monospace; text-align: right; padding: 8px 0;">${transactionId}</td>
                                  </tr>
                                  ` : ''}
                                  <tr>
                                    <td style="color: #064e3b; font-size: 14px; padding: 8px 0;">Status:</td>
                                    <td style="text-align: right; padding: 8px 0;">
                                      <span style="background-color: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                        ✅ COMPLETED
                                      </span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          <!-- Updated Balance -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; margin-bottom: 30px;">
                            <tr>
                              <td style="padding: 20px;">
                                <h3 style="color: #1e3a8a; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">
                                  💳 Updated Wallet Balance
                                </h3>
                                <p style="margin: 0; color: #1e40af; font-size: 24px; font-weight: bold;">
                                  PKR ${user.walletBalance.toFixed(2)}
                                </p>
                              </td>
                            </tr>
                          </table>

                          ${adminNote ? `
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                            <tr>
                              <td style="padding: 20px;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                  <strong>📝 Admin Note:</strong><br>
                                  ${adminNote}
                                </p>
                              </td>
                            </tr>
                          </table>
                          ` : ''}

                          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                            The funds should appear in your account within 1-3 business days depending on your payment method.
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
                            Withdrawal ID: ${withdrawal._id}<br>
                            Completed on: ${now.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
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
        console.log("✅ Completion email sent to user:", user.email);
      } catch (emailError) {
        console.error("❌ Failed to send completion email:", emailError);
      }

    } else if (status === 'rejected') {
      withdrawal.rejectedAt = now;
      
      // If previously was not rejected, allow user to make new withdrawal request
      if (previousStatus !== 'rejected') {
        user.isWithdraw = false;
        await user.save();
      }

      // Send rejection email to user
      try {
        await resend.emails.send({
          from: "IKedo Wallet <onboarding@resend.dev>",
          to: user.email,
          subject: "❌ Withdrawal Request Rejected",
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
                        <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
                            ❌ Withdrawal Rejected
                          </h1>
                          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 14px;">
                            Your withdrawal request could not be processed
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
                            We regret to inform you that your withdrawal request has been rejected.
                          </p>

                          <!-- Withdrawal Details -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 8px; margin-bottom: 30px;">
                            <tr>
                              <td style="padding: 25px;">
                                <h2 style="color: #991b1b; margin: 0 0 20px 0; font-size: 18px; font-weight: bold;">
                                  📋 Request Details
                                </h2>
                                
                                <table width="100%" cellpadding="8" cellspacing="0">
                                  <tr>
                                    <td style="color: #7f1d1d; font-size: 14px; padding: 8px 0;">Amount Requested:</td>
                                    <td style="color: #991b1b; font-size: 16px; font-weight: bold; text-align: right; padding: 8px 0;">PKR ${withdrawal.amount.toFixed(2)}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #7f1d1d; font-size: 14px; padding: 8px 0;">Status:</td>
                                    <td style="text-align: right; padding: 8px 0;">
                                      <span style="background-color: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                        ❌ REJECTED
                                      </span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>

                          ${adminNote ? `
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                            <tr>
                              <td style="padding: 20px;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                  <strong>📝 Reason for Rejection:</strong><br>
                                  ${adminNote}
                                </p>
                              </td>
                            </tr>
                          </table>
                          ` : ''}

                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 8px; margin-bottom: 30px;">
                            <tr>
                              <td style="padding: 20px;">
                                <h3 style="color: #15803d; margin: 0 0 12px 0; font-size: 16px; font-weight: bold;">
                                  💡 What's Next?
                                </h3>
                                <ul style="margin: 0; padding-left: 20px; color: #166534; font-size: 14px; line-height: 1.8;">
                                  <li>Your wallet balance remains unchanged (PKR ${user.walletBalance.toFixed(2)})</li>
                                  <li>You can submit a new withdrawal request</li>
                                  <li>Please ensure account details are correct</li>
                                  <li>Contact support if you have questions</li>
                                </ul>
                              </td>
                            </tr>
                          </table>

                          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                            If you believe this rejection was made in error or have questions, please contact our support team.
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
                            Withdrawal ID: ${withdrawal._id}<br>
                            Rejected on: ${now.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
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
        console.log("✅ Rejection email sent to user:", user.email);
      } catch (emailError) {
        console.error("❌ Failed to send rejection email:", emailError);
      }
    }

    await withdrawal.save();

    return NextResponse.json({
      success: true,
      message: `Withdrawal ${status} successfully`,
      withdrawal,
      userBalance: {
        walletBalance: user.walletBalance,
        isWithdrawAmount: user.isWithdrawAmount
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Admin update withdrawal error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
