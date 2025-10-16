import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PurchasedLead from "@/lib/models/PurchasedLead";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId");

    if (!collectionId) {
      return NextResponse.json(
        { message: "Collection ID is required" },
        { status: 400 }
      );
    }

    // Count unique purchased leads for this user and collection
    const purchasedCount = await PurchasedLead.countDocuments({
      user: user._id,
      collectionId: collectionId,
    });

    return NextResponse.json({ purchasedCount });
  } catch (error: any) {
    console.error("Error fetching purchased count:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch purchased count" },
      { status: 500 }
    );
  }
}

