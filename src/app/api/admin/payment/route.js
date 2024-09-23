import PaymentInfo from "@/models/Payment";
import {connect} from "@/dbConfig/dbConfig";
import {NextResponse} from "next/server";

// To handle POST requests (update or create payment info)
export async function POST(req) {
    try {
        await connect();

        const {paymentMethod, paymentNumber} = await req.json();
        const paymentInfo = await PaymentInfo.findOne({role: "admin"});

        if (!paymentInfo) {
            // If no payment info exists, create it
            await PaymentInfo.create({
                role: "admin",
                [paymentMethod]: paymentNumber,
            });
        } else {
            // Update existing payment info
            paymentInfo[paymentMethod] = paymentNumber;
            await paymentInfo.save();
        }

        return NextResponse.json({message: "Payment info updated successfully"});
    } catch (error) {
        console.error("Error updating payment info:", error);
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500},
        );
    }
}

// To handle GET requests (fetch payment info)
export async function GET() {
    try {
        await connect();

        const paymentInfo = await PaymentInfo.findOne({role: "admin"});
        if (!paymentInfo) {
            return NextResponse.json({error: "Payment info not found"}, {status: 404});
        }

        return NextResponse.json(paymentInfo);
    } catch (error) {
        console.error("Error fetching payment info:", error);
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500},
        );
    }
}
