// pages/api/users/verify.js
import { NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

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
