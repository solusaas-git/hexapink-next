import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import File from "@/lib/models/File";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authUser = await authenticate(request);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const userId = id;

    // Fetch all files for this user
    const files = await File.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    // Transform the data to match the expected format
    const transformedFiles = files.map((file: any) => ({
      _id: file._id.toString(),
      fileName: file.title || "Untitled File",
      fileSize: (file.volume || 0) * 100, // Estimate file size based on volume
      volume: file.volume || 0,
      columns: file.columns ? Object.keys(file.columns).length : 0,
      path: file.path || "",
      uploadedAt: file.createdAt,
    }));

    return NextResponse.json(transformedFiles, { status: 200 });
  } catch (error) {
    console.error("Error fetching user files:", error);
    return NextResponse.json(
      { error: "Failed to fetch user files" },
      { status: 500 }
    );
  }
}

