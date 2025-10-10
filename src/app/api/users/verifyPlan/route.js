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

    // Update user's payment verification status
    user.verified = true;
    user.paymentStatus = "Approved";
    user.updatedAt = new Date();

    const updatedUser = await user.save();

    // Award commission to referrer if exists
    if (user.tReferrals && user.tReferrals.length > 0) {
      // Get the referrer (the person who referred this user)
      // This assumes you track who referred whom in your signup process
      // You may need to adjust this based on your referral tracking implementation
      const referralInfo = user.tReferrals[0]; // Adjust based on your data structure
      
      if (referralInfo && referralInfo.referrerId) {
        // Get plan price
        const planPrices = {
          Standard: 50,
          Pro: 100,
          Premium: 500,
          Free: 0,
        };

        const planPrice = planPrices[user.plan] || 0;

        if (planPrice > 0) {
          // Award commission (12% of plan price)
          await awardPlanPurchaseCommission(
            referralInfo.referrerId,
            user._id,
            user.plan,
            planPrice,
            0.12 // 12% commission
          );
        }
      }
    }

    // Send verification email to user
    try {
      await resend.emails.send({
        from: "verify@ikedo.live",
        to: user.email,
        subject: "Payment Verified - Account Activated",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">✅ Payment Verified Successfully!</h2>
            <p>Dear ${user.username},</p>
            <p>Your payment has been verified and your <strong>${user.plan}</strong> plan is now active!</p>
            
            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Your Account Benefits:</h3>
              <ul>
                <li>✓ Daily returns on your plan</li>
                <li>✓ Referral commissions enabled</li>
                <li>✓ Withdraw earnings anytime</li>
                <li>✓ Share your referral link and earn more</li>
              </ul>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">Start Earning Today:</h3>
              <p><strong>Your Referral Link:</strong></p>
              <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                ${user.ReferralUrl}
              </p>
              <p style="margin-top: 15px;">Share this link with friends and earn 12% commission on their plan purchases!</p>
            </div>
            
            <div style="margin: 30px 0;">
              <a href="${process.env.DOMAIN}/dashboard" 
                 style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            
            <p>Thank you for choosing us!</p>
            
            <p>Best regards,<br>Ikedo Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return NextResponse.json(
      { message: "Payment verified successfully", user: updatedUser },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verification failed", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
