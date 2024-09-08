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
    user.isWithdraw = true;
    user.isWithdrawAmount -= amount;
    await user.save();

    await resend.emails.send({
      from: "withdraw@bandbaja.live",
      to: user.email,
      subject: "Withdrawal Request",
      text: `Your withdrawal request of ${amount} has been submitted successfully.`,
    });

    await resend.emails.send({
      from: "withdraw@bandbaja.live",
      to: "admin@bandbaja.live",
      subject: "New Withdrawal Request",
      html: `A new withdrawal request of ${amount}  has been submitted by ${user.email}.
       Account number: ${accountNumber}, Payment gateway: ${paymentGateway}. verify this on click here : ${process.env.DOMAIN}/withdraw/amount/${user._id}`,
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
