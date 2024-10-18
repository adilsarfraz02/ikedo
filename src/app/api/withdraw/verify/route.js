import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";

connect();

export async function POST(request) {
  try {
    const { userId, amount } = await request.json();

    // Check if userId is provided
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch user from database
    const user = await User.findById({ _id: userId });

    // Validate input: user, amount, and userId
    if (!amount || !userId) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has sufficient balance
    if (user.isWithdrawAmount < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Process withdrawal
    user.isWithdraw = false;
    user.isWithdrawAmount -= amount; // Deduct the amount
    await user.save(); // Save the updated user info

    // Send withdrawal confirmation email to the user
    await resend.emails.send({
      from: "withdraw@ikedo.pro",
      to: user.email,
      subject: "Withdrawal Request",
      text: `Your withdrawal request of ${amount} has been submitted successfully.`,
    });

    // Send notification email to admin
    await resend.emails.send({
      from: "withdraw@ikedo.pro",
      to: "ikedopro@gmail.com", // Replace with the correct admin email
      subject: "New Withdrawal Request",
      html: `A new withdrawal request of ${amount} has been submitted by ${user.email}.`,
    });

    // Return success response
    return NextResponse.json(
      { message: "Withdrawal request submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Withdrawal request error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
