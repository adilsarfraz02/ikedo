// pages/api/users/verify.js
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { awardPlanPurchaseCommission } from "@/helpers/commissionHelper";
import { resend } from "@/lib/resend";

export async function POST(req) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is missing" }, { status: 400 });
    }

    const userId = url; // Assuming the URL is passed correctly in the body as ref

    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connect(); // Connect to the database
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Verifying plan for user:", user.email);

    // Update user's payment verification status
    user.isVerified = true;
    user.paymentStatus = "Approved";
    user.updatedAt = new Date();

    const updatedUser = await user.save();
    console.log("✅ User plan verified successfully:", user.email);

    // Get plan price from stored plan details or use default mapping
    let planPrice = user.planDetails?.price || 0;
    
    // Fallback to default prices if not stored
    if (!planPrice) {
      const planPrices = {
        "Plan 1": 590,
        "Plan 2": 1190,
        "Plan 3": 2790,
        "Plan 4": 5990,
        "Plan 5": 11990,
        "Plan 6": 17990,
        "Plan 7": 26990,
        "Plan 8": 47990,
        Standard: 50,
        Pro: 100,
        Premium: 500,
        Free: 0,
      };
      planPrice = planPrices[user.plan] || 0;
    }

    // Award commission to referrer if exists
    if (user.tReferrals && user.tReferrals.length > 0) {
      const referralInfo = user.tReferrals[0];
      
      if (referralInfo && referralInfo.referrerId) {
        if (planPrice > 0) {
          console.log(`Awarding commission to referrer: ${referralInfo.referrerId}`);
          try {
            // Award commission (12% of plan price)
            await awardPlanPurchaseCommission(
              referralInfo.referrerId,
              user._id,
              user.plan,
              planPrice,
              0.12 // 12% commission
            );
            console.log("✅ Commission awarded successfully");
          } catch (commissionError) {
            console.error("❌ Failed to award commission:", commissionError);
          }
        }
      }
    }

    // Send professional verification email to user
    try {
      const dailyCashback = user.planDetails?.cashback || "Daily returns";
      
      await resend.emails.send({
        from: "Ikedo Live <verify@ikedo.live>",
        to: user.email,
        subject: "✅ Payment Verified - Account Activated!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; font-size: 32px; }
              .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.95; }
              .content { background: #ffffff; padding: 30px; }
              .success-badge { background: #d1fae5; color: #065f46; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 18px; font-weight: bold; }
              .info-box { background: #f9fafb; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
              .info-box h3 { margin-top: 0; color: #10b981; font-size: 20px; }
              .info-row { padding: 12px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
              .info-row:last-child { border-bottom: none; }
              .info-label { font-weight: bold; color: #6b7280; }
              .info-value { color: #111827; font-weight: 600; }
              .benefits { background: #ecfdf5; padding: 25px; border-radius: 8px; margin: 20px 0; }
              .benefits h3 { margin-top: 0; color: #059669; }
              .benefits ul { margin: 10px 0; padding-left: 20px; }
              .benefits li { margin: 10px 0; color: #065f46; }
              .referral-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 8px; margin: 25px 0; }
              .referral-box h3 { margin-top: 0; color: #92400e; }
              .referral-link { background: white; padding: 15px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 14px; margin: 15px 0; border: 2px dashed #f59e0b; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 25px 0; text-align: center; }
              .cta-button:hover { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
              .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 10px 10px; }
              .emoji { font-size: 24px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">🎉</div>
                <h1>Payment Verified!</h1>
                <p>Your account is now active and ready to earn</p>
              </div>
              
              <div class="content">
                <div class="success-badge">
                  ✅ Your ${user.plan} plan is now ACTIVE!
                </div>
                
                <p>Dear <strong>${user.username}</strong>,</p>
                
                <p>Congratulations! Your payment has been successfully verified and your account is now fully activated. You can start earning today!</p>
                
                <div class="info-box">
                  <h3>📋 Your Plan Details</h3>
                  <div class="info-row">
                    <span class="info-label">Plan:</span>
                    <span class="info-value">${user.plan}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Investment:</span>
                    <span class="info-value">${planPrice} PKR</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Daily Returns:</span>
                    <span class="info-value">${dailyCashback}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value" style="color: #10b981;">✅ Active</span>
                  </div>
                </div>
                
                <div class="benefits">
                  <h3>🎁 Your Active Benefits:</h3>
                  <ul>
                    <li><strong>Daily Returns:</strong> Start receiving ${dailyCashback} automatically</li>
                    <li><strong>Referral Commissions:</strong> Earn 12% on every friend's plan purchase</li>
                    <li><strong>Instant Withdrawals:</strong> Withdraw your earnings anytime</li>
                    <li><strong>Unlimited Referrals:</strong> No limit on how much you can earn</li>
                  </ul>
                </div>
                
                <div class="referral-box">
                  <h3>💰 Start Earning With Referrals</h3>
                  <p><strong>Share your unique referral link and earn 12% commission:</strong></p>
                  <div class="referral-link">${user.ReferralUrl || `${process.env.DOMAIN}/auth/signup?ref=${user.referralCode}`}</div>
                  <p style="margin-bottom: 0; font-size: 14px; color: #92400e;">
                    <strong>How it works:</strong> When someone signs up using your link and purchases a plan, you instantly earn 12% commission!
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.DOMAIN}/dashboard" class="cta-button">
                    🚀 Go to Dashboard
                  </a>
                </div>
                
                <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                  <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Share your referral link on social media, WhatsApp groups, or with friends to maximize your earnings!</p>
                </div>
                
                <p style="margin-top: 30px;">If you have any questions or need assistance, feel free to contact our support team.</p>
                
                <p style="margin-top: 25px;">
                  Best regards,<br>
                  <strong>The Ikedo Live Team</strong>
                </p>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Ikedo Live. All rights reserved.</p>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 5px;">This is an automated notification email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log("✅ Verification success email sent to:", user.email);
    } catch (emailError) {
      console.error("❌ Failed to send verification email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { 
        message: "Payment verified successfully", 
        success: true,
        user: {
          email: updatedUser.email,
          username: updatedUser.username,
          plan: updatedUser.plan,
          paymentStatus: updatedUser.paymentStatus,
          isVerified: updatedUser.isVerified,
        }
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Verification failed:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "Failed to verify payment. Please try again or contact support."
      },
      { status: 500 },
    );
  }
}
