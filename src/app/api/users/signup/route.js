import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";

export async function POST(request) {
  await connect();

  try {
    const reqBody = await request.json();
    const { username, email, password, imageUrl } = reqBody;

    // Check if all required fields are provided
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

    // Hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Generate a unique referral code
    let referralCode;
    let isUnique = false;

    while (!isUnique) {
      referralCode = generateReferralCode();
      const existingReferralCode = await User.findOne({ referralCode });
      if (!existingReferralCode) {
        isUnique = true;
      }
    }

    // Generate the referral URL
    const referralUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/signup?ref=${referralCode}`;

    // Create a new user with the referral code and URL
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      image: imageUrl,
      referralCode,
      referralUrl,
    });

    const savedUser = await newUser.save();

    return NextResponse.json({
      message: "User created successfully",
      success: true,
      user: savedUser,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateReferralCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let referralCode = "";
  const length = 8; // Desired length of the referral code

  for (let i = 0; i < length; i++) {
    referralCode += characters.charAt(
      Math.floor(Math.random() * characters.length),
    );
  }

  return referralCode;
}
