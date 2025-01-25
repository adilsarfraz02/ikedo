import { connect } from "@/dbConfig/dbConfig";
import PricingPlan from "@/models/PricingPlan";
import { NextResponse } from "next/server";

export async function GET() {
  await connect();

  try {
    const plans = await PricingPlan.find({});

    return NextResponse.json(plans, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pricing plans" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  }
}
