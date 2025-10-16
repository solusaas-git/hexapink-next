import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/lib/models/Review";
import { addCorsHeaders, handleCors } from "@/lib/middleware/cors";

export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    await connectDB();

    // Get featured reviews
    const featuredReviews = await Review.find({ featured: true })
      .select("-__v")
      .sort({ createdAt: -1 });

    const response = NextResponse.json(featuredReviews);
    return addCorsHeaders(response, request);
  } catch (error: any) {
    console.error("Featured reviews error:", error);
    const response = NextResponse.json(
      { message: error.message || "Failed to fetch featured reviews" },
      { status: 500 }
    );
    return addCorsHeaders(response, request);
  }
}

