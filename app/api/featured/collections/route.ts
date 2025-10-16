import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Collection from "@/lib/models/Collection";
import { addCorsHeaders, handleCors } from "@/lib/middleware/cors";

export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

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

    const response = NextResponse.json(collections);
    return addCorsHeaders(response, request);
  } catch (error: any) {
    console.error("Featured collections error:", error);
    const response = NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, request);
  }
}

