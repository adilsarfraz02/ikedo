import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { resend } from "@/lib/resend";

connect();

export async function POST(request) {
  try {
    const userId = await getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { amount, accountNumber, paymentGateway } = await request.json();
    const user = await User.findById({ _id: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isWithdrawAmount < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 },
      );
    }

    // Create a new withdrawal request
    const withdrawalRequest = {
      amount,
      accountNumber,
      paymentGateway,
      createdAt: new Date(),
    };

    user.withdrawalRequests.push(withdrawalRequest);
    user.isWithdrawAmount -= amount;
    await user.save();

    // Send email to admin (you'll need to implement this)
    // await sendEmailToAdmin(user.email, amount, accountNumber, paymentGateway)
    await resend.emails.send({
      from: "withdraw@bandbaja.live",
      to: user.email,
      cc: "adilsarfr00@gmail.com",
      
      subject: "Withdrawal Request",
      text: `Your withdrawal request of ${amount} has been submitted successfully.`,
    });

    return NextResponse.json(
      { message: "Withdrawal request submitted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Withdrawal request error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
