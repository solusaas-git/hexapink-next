import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import File from "@/lib/models/File";
import Collection from "@/lib/models/Collection";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await authenticate(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Ensure Collection model is registered
    if (Collection) {
      // This ensures the Collection model is loaded
    }

    const userId = authUser._id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "All";

    // Build query
    const query: any = { user: userId };
    
    if (status !== "All") {
      query.status = status;
    }

    // Fetch recent files for this user and populate collection
    const files = await File.find(query)
      .populate("collectionId", "title mobileImage image type countries")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json(files, { status: 200 });
  } catch (error) {
    console.error("Error fetching recent files:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent files" },
      { status: 500 }
    );
  }
}

