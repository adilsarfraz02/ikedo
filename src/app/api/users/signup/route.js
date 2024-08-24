import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

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

    // Generate the referral URL

    // Create a new user with the referral code and URL
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      image: imageUrl,
    });

    const savedUser = await newUser.save();
    console.log(savedUser);

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
