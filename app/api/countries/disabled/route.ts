import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Country from "@/lib/models/Country";

export async function GET() {
  try {
    await connectDB();

    // Get disabled countries in the app
    const countries = await Country.find({ inApp: false }).select("name -_id");
    const disabledCountryNames = countries.map((country) => country.name);

    return NextResponse.json(disabledCountryNames);
  } catch (error: any) {
    console.error("Disabled app countries error:", error);
    return NextResponse.json(
      { message: error.message || "Error fetching disabled countries" },
      { status: 500 }
    );
  }
}

