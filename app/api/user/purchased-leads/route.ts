import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/middleware/authenticate";
import connectDB from "@/lib/db";
import { getPurchasedLeadsCount } from "@/lib/utils/purchasedLeadsFilter";
import Collection from "@/lib/models/Collection";

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get all collections
    const collections = await Collection.find({ status: "Active" }).select("_id title");

    // Get purchased count for each collection
    const purchasedData = await Promise.all(
      collections.map(async (collection) => {
        const count = await getPurchasedLeadsCount(user._id, collection._id);
        return {
          collectionId: collection._id,
          collectionTitle: collection.title,
          purchasedCount: count,
        };
      })
    );

    // Filter out collections with no purchases
    const filteredData = purchasedData.filter(item => item.purchasedCount > 0);

    return NextResponse.json({
      success: true,
      data: filteredData,
      totalCollections: filteredData.length,
    });
  } catch (error: any) {
    console.error("Error fetching purchased leads:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch purchased leads" },
      { status: 500 }
    );
  }
}

