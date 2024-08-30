import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend"; // Make sure you have set up this client as mentioned earlier

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
  try {
    const { isWithdrawAmount, referemail, bankAccount, referralemail } =
      await req.json();

    // Validation: Ensure all required fields are provided
    if (!isWithdrawAmount || !referemail || !bankAccount || !referralemail) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    await connect();

    // Update the user document with the withdraw amount
    const user = await User.findByIdAndUpdate(id, {
      $set: { isWithdrawAmount },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Save the updated user document
    await user.save();

    // Find the email for the user making the request
    const emailUser = await User.findOne({ email: referralemail });

    if (emailUser) {
      // Send the withdrawal confirmation email
      await resend.emails.send({
        from: "ref@thebandbaja.live",
        to: emailUser.email,
        cc: "adilsarfr00@gmail.com",
        subject: "Withdrawal Request",
        html: `<p>Your withdrawal request has been processed, and the amount of ${isWithdrawAmount} has been transferred to your bank account ${bankAccount}.</p>`,
      });
    }

    return NextResponse.json(
      { success: true, user, email: emailUser },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}
