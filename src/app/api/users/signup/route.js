import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  await connect();

  try {
    const reqBody = await request.json();
    const { username, email, password, imageUrl, bankAccount } = reqBody;

    if (!username || !email || !password || !imageUrl || !bankAccount) {
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

   
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      image: imageUrl,
      bankAccount,
    });

    const savedUser = await newUser.save();

    // Send verification email

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
