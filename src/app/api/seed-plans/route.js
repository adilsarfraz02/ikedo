import { connect } from "@/dbConfig/dbConfig";
import PricingPlan from "@/models/PricingPlan";
import { NextResponse } from "next/server";

export async function POST() {
  await connect();

  try {
    // Clear existing plans
    await PricingPlan.deleteMany({});

    // Create the 8 plans based on your specifications
    const plans = [
      {
        name: "Plan 1",
        price: 590,
        period: "15 Days",
        cashback: "40 PKR Daily",
        color: "from-blue-500 to-blue-700",
        textColor: "text-white",
        buttonColor: "bg-white text-blue-600 hover:bg-gray-100",
        popular: false
      },
      {
        name: "Plan 2",
        price: 1210,
        period: "15 Days",
        cashback: "80 PKR Daily",
        color: "from-blue-500 to-blue-700",
        textColor: "text-white",
        buttonColor: "bg-white text-blue-600 hover:bg-gray-100",
        popular: false
      },
      {
        name: "Plan 3",
        price: 2710,
        period: "15 Days",
        cashback: "180 PKR Daily",
        color: "from-blue-500 to-blue-700",
        textColor: "text-white",
        buttonColor: "bg-white text-blue-600 hover:bg-gray-100",
        popular: true
      },
      {
        name: "Plan 4",
        price: 6010,
        period: "15 Days",
        cashback: "400 PKR Daily",
        color: "from-blue-500 to-blue-700",
        textColor: "text-white",
        buttonColor: "bg-white text-blue-600 hover:bg-gray-100",
        popular: false
      },
      {
        name: "Plan 5",
        price: 12050,
        period: "15 Days",
        cashback: "800 PKR Daily",
        color: "from-blue-500 to-blue-700",
        textColor: "text-white",
        buttonColor: "bg-white text-blue-600 hover:bg-gray-100",
        popular: false
      },
      {
        name: "Plan 6",
        price: 18100,
        period: "15 Days",
        cashback: "1200 PKR Daily",
        color: "from-blue-500 to-blue-700",
        textColor: "text-white",
        buttonColor: "bg-white text-blue-600 hover:bg-gray-100",
        popular: false
      },
      {
        name: "Plan 7",
        price: 27000,
        period: "15 Days",
        cashback: "1800 PKR Daily",
        color: "from-blue-500 to-blue-700",
        textColor: "text-white",
        buttonColor: "bg-white text-blue-600 hover:bg-gray-100",
        popular: false
      },
      {
        name: "Plan 8",
        price: 48000,
        period: "15 Days",
        cashback: "3200 PKR Daily",
        color: "from-blue-500 to-blue-700",
        textColor: "text-white",
        buttonColor: "bg-white text-blue-600 hover:bg-gray-100",
        popular: false
      }
    ];

    // Insert all plans
    await PricingPlan.insertMany(plans);

    return NextResponse.json({
      success: true,
      message: "Successfully seeded 8 pricing plans",
      plansCount: plans.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error seeding pricing plans:", error);
    return NextResponse.json(
      { success: false, message: "Failed to seed pricing plans", error: error.message },
      { status: 500 }
    );
  }
}