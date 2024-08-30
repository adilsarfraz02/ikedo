import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { resend } from "@/lib/resend";

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

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const referralCode = uuidv4();
    const referralUrl = `${process.env.DOMAIN}/auth/signup?ref=${referralCode}`;

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      image: imageUrl,
      bankAccount,
      ReferralUrl: referralUrl,
    });

    const savedUser = await newUser.save();

    // Check if referrerUrl exists and find the referring user
    let referrerUser = null;
    if (referrerUrl) {
      referrerUser = await User.findOne({ ReferralUrl: referrerUrl });

      if (referrerUser) {
        // Update the referrer's tReferrals array and tReferralCount
        referrerUser.tReferrals.push({
          username,
          email,
          imageUrl,
          _id: newUser._id,
        });
        referrerUser.tReferralCount += 1;
        await referrerUser.save();

        await resend.emails.send({
          from: "referrals@thebandbaja.live",
          to: referrerUser.email,
          cc: "adilsarfr00@gmail.com",
          subject: "New Referral",
          html: `
            <p>You have a new referral: ${username}</p>
            <p>Email: ${email}</p>
            <p>Image: ${imageUrl}</p>
          `,
        });
      }
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
