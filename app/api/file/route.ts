import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import File from "@/lib/models/File";
import Collection from "@/lib/models/Collection";
import { authenticate } from "@/lib/middleware/authenticate";

/**
 * GET /api/file
 * Fetch all files (purchased data) belonging to the authenticated user
 * Supports filtering by status (Ready, Waiting)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build query
    const query: any = { user: user.id };
    
    if (status && status !== "All") {
      query.status = status;
    }

    // Fetch files with collection details
    const files = await File.find(query)
      .populate("collectionId", "title mobileImage image type countries")
      .sort({ createdAt: -1 })
      .select("title type countries collectionId image unitPrice volume columns status path orderId createdAt updatedAt");

    // Ensure Collection model is loaded
    if (Collection) {
      // Model is now loaded
    }

    // Format response
    const formattedFiles = files.map((file: any) => ({
      _id: file._id,
      title: file.title,
      type: file.type,
      countries: file.countries,
      collection: file.collectionId ? {
        _id: file.collectionId._id,
        title: file.collectionId.title,
        mobileImage: file.collectionId.mobileImage,
        image: file.collectionId.image,
        type: file.collectionId.type,
        countries: file.collectionId.countries
      } : null,
      volume: file.volume,
      columns: file.columns,
      status: file.status,
      path: file.path,
      orderId: file.orderId,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    }));

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

