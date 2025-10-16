import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/lib/models/Review";
import { authenticate } from "@/lib/middleware/authenticate";
import { saveFile } from "@/lib/services/fileService";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const reviews = await Review.find().sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const company = formData.get("company") as string;
    const rating = parseInt(formData.get("rating") as string);
    const content = formData.get("content") as string;
    const avatarFile = formData.get("avatar") as File | null;

    let avatarPath = "";
    if (avatarFile) {
      avatarPath = await saveFile(avatarFile, "avatars");
    }

    const newReview = new Review({
      firstName,
      lastName,
      company,
      avatar: avatarPath,
      rating,
      content,
      featured: false,
    });

    await newReview.save();

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

