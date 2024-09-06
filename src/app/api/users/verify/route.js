import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  await connect();

  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
    }

    // Find the user by imageUrl
    const user = await User.findOne({ image: imageUrl });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If the user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        { message: "User is already verified" },
        { status: 200 },
      );
    }

    // Update user verification status
    user.isVerified = true;
    await user.save();

    return NextResponse.json(
      { message: "Email verification successful" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
