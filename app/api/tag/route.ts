import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Tag from "@/lib/models/Tag";

export async function GET() {
  try {
    await connectDB();

    const tags = await Tag.find().select("-__v").sort({ name: 1 });

    return NextResponse.json(tags);
  } catch (error: any) {
    console.error("Tags fetch error:", error);
    return NextResponse.json(
      { message: error.message || "Error fetching tags" },
      { status: 500 }
    );
  }
}

