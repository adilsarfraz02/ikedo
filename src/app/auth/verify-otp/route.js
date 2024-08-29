import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {
  await connect();
  try {
    const reqBody = await request.json();
    const { otp } = reqBody;

    const storedOtp = localStorage.getItem("otp");
    console.log(storedOtp);
    console.log(otp);
    if (storedOtp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: "OTP verified" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
