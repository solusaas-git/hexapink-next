import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Collection from "@/lib/models/Collection";
import { authenticate } from "@/lib/middleware/authenticate";
import { saveFile } from "@/lib/services/fileService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const collection = await Collection.findById(id);

    if (!collection) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error fetching collection:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const contentType = request.headers.get("content-type") || "";
    let updateData: any = {};

    // Check if it's FormData (from edit page with file uploads) or JSON (from simple updates)
    if (contentType.includes("multipart/form-data")) {
      // Handle FormData (full collection edit with images)
      const formData = await request.formData();
      
      const title = formData.get("title") as string;
      const type = formData.get("type") as string;
      const description = formData.get("description") as string;
      const featured = formData.get("featured") === "true";
      const countriesStr = formData.get("countries") as string;
      const countries = countriesStr ? JSON.parse(countriesStr) : [];
      const fee = parseFloat(formData.get("fee") as string) || 0;
      const discount = parseFloat(formData.get("discount") as string) || 0;
      const columnsStr = formData.get("columns") as string;
      const columns = columnsStr ? JSON.parse(columnsStr) : [];
      
      // Handle image uploads
      const imageFile = formData.get("image") as File | null;
      const mobileImageFile = formData.get("mobileImage") as File | null;
      const existingImage = formData.get("existingImage") as string;
      const existingMobileImage = formData.get("existingMobileImage") as string;
      
      let imagePath = existingImage;
      let mobileImagePath = existingMobileImage;
      
      if (imageFile && imageFile.size > 0) {
        imagePath = await saveFile(imageFile, "collections");
      }
      
      if (mobileImageFile && mobileImageFile.size > 0) {
        mobileImagePath = await saveFile(mobileImageFile, "collections");
      }

      updateData = {
        title,
        type,
        description,
        featured,
        countries,
        fee,
        discount,
        columns,
        image: imagePath,
        mobileImage: mobileImagePath,
      };
    } else {
      // Handle JSON (simple updates like status, featured)
      updateData = await request.json();
    }

    const collection = await Collection.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!collection) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const collection = await Collection.findByIdAndDelete(id);

    if (!collection) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

