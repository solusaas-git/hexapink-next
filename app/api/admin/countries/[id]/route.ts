import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Country from "@/lib/models/Country";
import { authenticate } from "@/lib/middleware/authenticate";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, onSignUp, inApp } = body;

    await connectDB();

    const { id } = await params;
    const country = await Country.findByIdAndUpdate(
      id,
      { name, onSignUp, inApp },
      { new: true }
    );

    if (!country) {
      return NextResponse.json(
        { message: "Country not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(country);
  } catch (error) {
    console.error("Error updating country:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

