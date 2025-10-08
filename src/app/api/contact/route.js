// /app/api/contact/route.js
import { resend } from "@/lib/resend"; // Make sure you have set up this client as mentioned earlier
import { NextResponse } from "next/server";

export async function POST(req) {
  const { to, subject, text } = await req.json();

  try {
    const data = await resend.emails.send({
      from: "contact@ikedo.pro",
      cc: process.env.ADMIN_EMAIL,
      to,
      subject,
      text,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
