import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/lib/models/Review";

export async function GET() {
  try {
    await connectDB();

    // Get featured reviews
    const featuredReviews = await Review.find({ featured: true })
      .select("-__v")
      .sort({ createdAt: -1 });

    return NextResponse.json(featuredReviews);
  } catch (error: any) {
    console.error("Featured reviews error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch featured reviews" },
      { status: 500 }
    );
  }
}

