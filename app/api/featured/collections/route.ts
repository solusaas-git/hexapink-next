import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Collection from "@/lib/models/Collection";

export async function GET() {
  try {
    await connectDB();

    // Get featured collections
    const collections = await Collection.find({
      status: "Active",
      featured: true,
    })
      .select("-__v")
      .limit(10)
      .sort({ createdAt: -1 });

    return NextResponse.json(collections);
  } catch (error: any) {
    console.error("Featured collections error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

