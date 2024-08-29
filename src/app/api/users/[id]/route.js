import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request, { params }) {
  await connect();

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error("Fetch user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;

  await connect();

  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;
  const { isWithdraw, isWithdrawAmount, referemail, bankAccount, referralemail } = await req.json();

  await connect();

  if (!isWithdraw || !isWithdrawAmount || !referemail || !bankAccount || !referralemail  
  ){
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }


  try {

    const user = await User.findByIdAndUpdate(id, { isWithdraw, isWithdrawAmount });

    await user.save();

    const email = await User.findOne({ email: referralemail });

    if (email) {
      await resend.Emails.send({
        from: "ref@thebandbaja.com",
        to: email.email,
        cc: "adilsarfr00@gmail.com",
        subject: "Withdrawal Request",
        html: `<p>Your withdrawal request has been processed and the amount of ${isWithdrawAmount} has been transferred to your bank account ${bankAccount} as soon as possible.</p>`,
      });
    }


    return NextResponse.json({ success: true, user ,email}, { status: 200 });

  }
  catch (error) {
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }

}