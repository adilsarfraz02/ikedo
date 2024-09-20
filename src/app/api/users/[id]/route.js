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
      { message: "User delete successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const { isWithdrawAmount, referemail } = await req.json();

    if (!isWithdrawAmount || !referemail) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    await connect();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const referral = user.tReferrals.find((ref) => ref.email === referemail);

    if (!referral) {
      return NextResponse.json(
        { error: "Referral email not found" },
        { status: 404 },
      );
    }

    if (referral.isWithdrawRef) {
      return NextResponse.json(
        { error: "You already Withdraw User" },
        { status: 400 },
      );
    } else {
      const updatedUser = await User.findOneAndUpdate(
        { _id: id, "tReferrals.email": referemail },
        {
          $set: {
            "tReferrals.$.isWithdrawRef": true,
          },
          $inc: { isWithdrawAmount: isWithdrawAmount },
        },
        { new: true, runValidators: true },
      );
      if (!updatedUser) {
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 },
        );
      }

      // Send an email to the user
      try {
        await resend.emails.send({
          from: "ref@ikedo.pro",
          to: updatedUser.email,
          cc: "ra2228621@gmail.com",
          subject: "Withdrawal Request",
          html: `<p>Your withdrawal request has been processed, and the amount of ${isWithdrawAmount} has been transferred to your bank account ${updatedUser.bankAccount}.</p>`,
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Consider adding a flag to the response indicating email sending failed
      }

      return NextResponse.json(
        { success: true, data: updatedUser },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}
