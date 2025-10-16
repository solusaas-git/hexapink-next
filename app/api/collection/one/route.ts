import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Collection from "@/lib/models/Collection";
import { authenticate } from "@/lib/middleware/authenticate";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { type, countries } = await request.json();

    if (!type || !countries || countries.length === 0) {
      return NextResponse.json(
        { message: "Type and countries are required" },
        { status: 400 }
      );
    }

    // Find collections that match the type and have at least one country in common
    const collections = await Collection.find({
      type,
      countries: { $in: countries },
      status: "Active",
    })
      .populate("columns")
      .sort({ featured: -1, createdAt: -1 });

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

