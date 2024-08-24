import { getDataFromToken } from "@/helpers/getDataFromToken";

import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

export async function GET(request) {
  await connect();
  try {
    const userId = await getDataFromToken(request);
    const user = await User.findOne({ _id: userId }).select("-password");
    return NextResponse.json({
      mesaage: "User found",
      data: user,
    });
  } catch (error) {
    return NextResponse.json({ error: "User not Login" }, { status: 400 });
  }
}
