import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Country from "@/lib/models/Country";

export async function GET() {
  try {
    await connectDB();

    // Get disabled countries for signup
    const countries = await Country.find({ onSignUp: false }).select("name -_id");
    const countryNames = countries.map((country) => country.name);

    return NextResponse.json(countryNames);
  } catch (error: any) {
    console.error("Disabled signup countries error:", error);
    return NextResponse.json(
      { message: error.message || "Error fetching disabled countries" },
      { status: 500 }
    );
  }
}

