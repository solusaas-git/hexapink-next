import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import File from "@/lib/models/File";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const file = await File.findById(id).populate("collectionId", "title mobileImage image");

    if (!file) {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }

    // Check if user owns the file
    if (file.user?.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // Format response
    const fileData = {
      _id: file._id,
      title: file.title,
      type: file.type,
      countries: file.countries,
      collection: file.collectionId && typeof file.collectionId === 'object' ? {
        _id: (file.collectionId as any)._id,
        title: (file.collectionId as any).title,
        mobileImage: (file.collectionId as any).mobileImage,
        image: (file.collectionId as any).image,
      } : null,
      volume: file.volume,
      columns: file.columns,
      status: file.status,
      path: file.path,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };

    return NextResponse.json(fileData);
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

