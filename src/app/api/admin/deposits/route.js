import { connect } from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Deposit from "@/models/Deposit";
import User from "@/models/userModel";

connect();

// GET - Admin get all deposits or filter by status
export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminId = decoded.id;

    // Check if user is admin
    const admin = await User.findById(adminId);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // pending, verified, rejected
    const limit = parseInt(searchParams.get("limit")) || 50;
    const page = parseInt(searchParams.get("page")) || 1;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status && ["pending", "verified", "rejected"].includes(status)) {
      query.status = status;
    }

    // Get deposits with user details
    const deposits = await Deposit.find(query)
      .populate("userId", "username email")
      .populate("verifiedBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Deposit.countDocuments(query);

    // Get stats
    const stats = {
      total: await Deposit.countDocuments(),
      pending: await Deposit.countDocuments({ status: "pending" }),
      verified: await Deposit.countDocuments({ status: "verified" }),
      rejected: await Deposit.countDocuments({ status: "rejected" }),
      totalAmount: await Deposit.aggregate([
        { $match: { status: "verified" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    };

    return NextResponse.json(
      {
        deposits,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        stats: {
          ...stats,
          totalAmount: stats.totalAmount[0]?.total || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin get deposits error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deposits" },
      { status: 500 }
    );
  }
}
