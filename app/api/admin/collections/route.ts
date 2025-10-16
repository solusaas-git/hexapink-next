import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Collection from "@/lib/models/Collection";
import { authenticate } from "@/lib/middleware/authenticate";
import { saveFile } from "@/lib/services/fileService";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // Fetch collections with essential fields
    const collections = await Collection.find()
      .select('_id title image type countries fee status featured createdAt columns')
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    // Map to include column count instead of full columns data
    const collectionsWithCount = collections.map(col => ({
      ...col,
      columns: col.columns ? col.columns.length : 0
    }));

    return NextResponse.json(collectionsWithCount);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    
    // Extract fields from formData
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
    const imageFile = formData.get("desktopImage") as File | null;
    const mobileImageFile = formData.get("mobileImage") as File | null;
    
    console.log("Image upload debug:", {
      hasImageFile: !!imageFile,
      imageFileSize: imageFile?.size,
      hasMobileImageFile: !!mobileImageFile,
      mobileImageFileSize: mobileImageFile?.size,
    });
    
    let imagePath = "";
    let mobileImagePath = "";
    
    if (imageFile && imageFile.size > 0) {
      console.log("Uploading desktop image...");
      imagePath = await saveFile(imageFile, "collections");
      console.log("Desktop image uploaded to:", imagePath);
    }
    
    if (mobileImageFile && mobileImageFile.size > 0) {
      console.log("Uploading mobile image...");
      mobileImagePath = await saveFile(mobileImageFile, "collections");
      console.log("Mobile image uploaded to:", mobileImagePath);
    }

    await connectDB();

    const collectionData = {
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
      status: "Active",
    };

    const collection = await Collection.create(collectionData);

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

