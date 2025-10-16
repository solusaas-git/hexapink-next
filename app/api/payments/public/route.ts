import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Payment from "@/lib/models/Payment";

export async function GET() {
  try {
    await connectDB();

    // Fetch only active payment methods for public use
    const payments = await Payment.find({ status: "Active" })
      .select("paymentType bankName accountOwner accountNumber rib iban swift bankLogo")
      .lean();

    return NextResponse.json(payments, { status: 200 });
  } catch (error) {
    console.error("Error fetching public payment methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

