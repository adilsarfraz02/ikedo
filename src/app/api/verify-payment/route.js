import { connect } from "@/dbConfig/dbConfig";
import { resend } from "@/lib/resend";
import User from "@/models/userModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connect();

    const reqBody = await request.json();
    const { paymentReceipt, title, cashback, price, paymentMethod, email } =
      reqBody;

    console.log("Payment verification request received:", {
      email,
      title,
      price,
      paymentMethod,
      hasReceipt: !!paymentReceipt,
    });

    // Validate all required fields
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!paymentReceipt) {
      return NextResponse.json(
        { error: "Payment receipt is required" },
        { status: 400 }
      );
    }

    if (!title || !price || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields: title, price, or paymentMethod" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email });

    if (!user) {
      console.error("User not found with email:", email);
      return NextResponse.json(
        { error: "User not found. Please register first." },
        { status: 404 }
      );
    }

    console.log("User found:", user.email);

    // Update user details and set paymentStatus to "Processing"
    user.plan = title;
    user.paymentStatus = "Processing";
    user.paymentReceipt = paymentReceipt;
    user.updatedAt = new Date();
    
    // Store plan details
    user.planDetails = {
      price: price,
      cashback: cashback,
      purchaseDate: new Date(),
    };

    // Save the updated user data
    const updatedUser = await user.save();
    console.log("User updated successfully:", updatedUser.email);

    // Generate the verification URL for admin
    const verificationUrl = `${process.env.DOMAIN}/auth/verifyPlan?ref=${user._id}`;

    // Professional user email template
    const userSubject = "✅ Payment Received - Verification Pending";
    const userMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; color: #666; }
          .info-value { color: #333; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .highlight { color: #667eea; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Payment Received Successfully!</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${user.username}</strong>,</p>
            
            <p>Thank you for your payment! We have received your payment receipt and your account is now under review.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #667eea;">📋 Payment Details</h3>
              <div class="info-row">
                <span class="info-label">Plan:</span>
                <span class="info-value">${title}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Amount:</span>
                <span class="info-value">${price} PKR</span>
              </div>
              <div class="info-row">
                <span class="info-label">Daily Cashback:</span>
                <span class="info-value">${cashback}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span class="info-value">${paymentMethod.toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value" style="color: #f59e0b; font-weight: bold;">⏳ Processing</span>
              </div>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>⏰ Verification Timeline:</strong></p>
              <p style="margin: 5px 0 0 0;">Your account will be verified within <span class="highlight">24 hours</span>. Once verified, you can start referring others and earning rewards!</p>
            </div>
            
            <p>If you have any questions or concerns, please don't hesitate to contact our support team.</p>
            
            <p style="margin-top: 30px;">Best regards,<br><strong>Ikedo Live Team</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Ikedo Live. All rights reserved.</p>
            <p style="font-size: 12px; color: #999;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to user
    try {
      await resend.emails.send({
        from: "Ikedo Live <verify@ikedo.live>",
        to: email,
        subject: userSubject,
        html: userMessage,
      });
      console.log("✅ Verification pending email sent to:", email);
    } catch (emailError) {
      console.error("❌ Failed to send verification pending email:", emailError);
      // Don't return error, continue with admin email
    }

    // Professional admin email template
    const adminSubject = `🔔 New Payment Verification Required - ${email}`;
    const adminMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .user-info { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; color: #666; flex: 0 0 40%; }
          .info-value { color: #333; flex: 1; text-align: right; }
          .receipt-section { margin: 25px 0; padding: 20px; background: white; border-radius: 8px; text-align: center; }
          .receipt-img { max-width: 100%; height: auto; border: 2px solid #e5e7eb; border-radius: 8px; margin-top: 15px; }
          .verify-btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 25px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .verify-btn:hover { background: linear-gradient(135deg, #059669 0%, #047857 100%); }
          .warning-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Payment Verification Required</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Action needed within 24 hours</p>
          </div>
          <div class="content">
            <p><strong>Admin Alert:</strong> A new user has submitted a payment for verification.</p>
            
            <div class="user-info">
              <h3 style="margin-top: 0; color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">👤 User Information</h3>
              <div class="info-row">
                <span class="info-label">👤 Username:</span>
                <span class="info-value">${user.username}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📧 Email:</span>
                <span class="info-value">${email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🆔 User ID:</span>
                <span class="info-value">${user._id}</span>
              </div>
            </div>
            
            <div class="user-info">
              <h3 style="margin-top: 0; color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">💳 Payment Details</h3>
              <div class="info-row">
                <span class="info-label">📦 Plan:</span>
                <span class="info-value"><strong>${title}</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">💰 Price:</span>
                <span class="info-value"><strong>${price} PKR</strong></span>
              </div>
              <div class="info-row">
                <span class="info-label">🎁 Daily Cashback:</span>
                <span class="info-value">${cashback}</span>
              </div>
              <div class="info-row">
                <span class="info-label">💳 Payment Method:</span>
                <span class="info-value">${paymentMethod.toUpperCase()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Submission Date:</span>
                <span class="info-value">${new Date().toLocaleString()}</span>
              </div>
            </div>
            
            <div class="receipt-section">
              <h3 style="color: #6b7280; margin-top: 0;">📸 Payment Receipt</h3>
              <p style="color: #9ca3af; font-size: 14px;">Click to view full size</p>
              <a href="${paymentReceipt}" target="_blank">
                <img src="${paymentReceipt}" alt="Payment Receipt" class="receipt-img" />
              </a>
            </div>
            
            <div class="warning-box">
              <p style="margin: 0;"><strong>⏰ Important:</strong> Please verify this payment within 24 hours to ensure a smooth user experience.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" class="verify-btn" target="_blank">
                ✅ VERIFY PAYMENT NOW
              </a>
              <p style="font-size: 14px; color: #6b7280; margin-top: 15px;">
                Or copy this link: <br>
                <code style="background: #f3f4f6; padding: 5px 10px; border-radius: 4px; font-size: 12px;">${verificationUrl}</code>
              </p>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0;"><strong>📝 Next Steps:</strong></p>
              <ol style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Review the payment receipt carefully</li>
                <li>Verify the payment amount matches the plan price</li>
                <li>Click the verification button to approve or reject</li>
                <li>User will be notified automatically</li>
              </ol>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Ikedo Live Admin Panel</p>
            <p style="font-size: 12px; color: #999;">This is an automated admin notification.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await resend.emails.send({
        from: "Ikedo Live Admin <admin@ikedo.live>",
        to: process.env.ADMIN_EMAIL,
        subject: adminSubject,
        html: adminMessage,
      });
      console.log("✅ Admin notification sent successfully to:", process.env.ADMIN_EMAIL);
    } catch (adminEmailError) {
      console.error("❌ Failed to send admin notification email:", adminEmailError);
      // Don't fail the request if admin email fails
    }

    // Send success response
    return NextResponse.json({
      message: "Payment received successfully! Your account is being verified.",
      success: true,
      user: {
        email: updatedUser.email,
        username: updatedUser.username,
        plan: updatedUser.plan,
        paymentStatus: updatedUser.paymentStatus,
      },
    });
  } catch (error) {
    console.error("❌ Error processing payment:", error);
    
    // Provide more specific error messages
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { 
          error: "Validation error occurred",
          details: error.message 
        },
        { status: 400 }
      );
    }
    
    if (error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid data format provided" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again later."
      },
      { status: 500 }
    );
  }
}
