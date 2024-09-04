import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function PUT(request) {
  await connect();

  try {
    // Get the token from the Authorization header
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const reqBody = await request.json();
    const { username, email, bankAccount, image } = reqBody;

    if (!username || !email) {
      return NextResponse.json(
        { error: "Username and email are required" },
        { status: 400 },
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: decoded.id },
      { username, email, bankAccount, image },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Settings updated successfully",
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        bankAccount: updatedUser.bankAccount,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
