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

    // all 3 fields are required
    if (!amount || !accountNumber || !paymentGateway) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isWithdrawAmount < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 },
      );
    }
    user.isWithdraw = true;
    // user.isWithdrawAmount -= amount;
    await user.save();

    await resend.emails.send({
      from: "withdraw@ikedo.pro",
      to: user.email,
      subject: "Withdrawal Request",
      text: `Your withdrawal request of ${amount} has been submitted successfully.`,
    });

    await resend.emails.send({
      from: "withdraw@ikedo.pro",
      to: "ra2228621@gmail.com",
      subject: "New Withdrawal Request",
      html: `A new withdrawal request of ${amount}  has been submitted by ${user.email}.
       Account number: ${accountNumber}, Payment gateway: ${paymentGateway}. verify this amount and send on click here : ${process.env.DOMAIN}/withdraw/amount/${user._id}?amount=${amount}`,
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
