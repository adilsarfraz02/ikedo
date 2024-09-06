import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { resend } from "@/lib/resend";
import VerifyEmail from "../../../emails/VerifyEmail";

export async function POST(request) {
  await connect();

  try {
    const reqBody = await request.json();
    const { username, email, password, imageUrl, referrerUrl, bankAccount } =
      reqBody;

    console.log(reqBody);

    if (!username || !email || !password || !imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create referral and verification URLs
    const referralCode = uuidv4();
    const referralUrl = `${process.env.DOMAIN}/auth/signup?ref=${referralCode}`;
    const verificationUrl = `${process.env.DOMAIN}/auth/verify?ref=${imageUrl}`;
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      image: imageUrl,
      bankAccount,
      ReferralUrl: referralUrl,
    });

    // Save the user
    const savedUser = await newUser.save();

    // Handle referrer
    let referrerUser = null;
    if (referrerUrl) {
      referrerUser = await User.findOne({ ReferralUrl: referrerUrl });

      if (referrerUser) {
        referrerUser.tReferrals.push({
          username,
          email,
          imageUrl,
          _id: newUser._id,
        });
        referrerUser.tReferralCount += 1;
        await referrerUser.save();

        try {
          await resend.emails.send({
            from: "referrals@thebandbaja.live",
            to: "adilsarfr00@gmail.com",
            subject: "New Referral",
            html: `
              <p>You have a new referral: ${username}</p>
              <p>Email: ${email}</p>
              <div>Image: <img src="${imageUrl}" alt="image"/></div>
            `,
          });
        } catch (error) {
          console.error("Error sending referral email:", error);
        }
      }
    }

    try {
      await resend.emails.send({
        from: "verify@thebandbaja.live",
        to: email,
        subject: "Verify Your Email",
        react: VerifyEmail({
          username: username,
          verificationUrl: verificationUrl,
        }),
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      return NextResponse.json(
        { error: "Failed to send verification email." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "User created successfully. Please verify your email.",
      success: true,
      user: savedUser,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
