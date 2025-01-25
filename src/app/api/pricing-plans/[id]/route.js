import { connect } from "@/dbConfig/dbConfig";
import PricingPlan from "@/models/PricingPlan";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  await connect();

  try {
    const { id } = params;
    const body = await req.json();

    const updatedPlan = await PricingPlan.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store, max-age=0",
            Pragma: "no-cache",
          },
        }
      );
    }

    return NextResponse.json(
      { success: true, data: updatedPlan },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Error updating pricing plan:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
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
