import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import Collection from "@/lib/models/Collection";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authUser = await authenticate(request);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // Ensure Collection model is registered
    if (Collection) {
      // This ensures the Collection model is loaded
    }

    // Aggregate orders to find top collections
    // We need to count how many times each collection is sold
    const topCollections = await Order.aggregate([
      {
        $match: {
          paid: "Paid" // Only count paid orders
        }
      },
      {
        $lookup: {
          from: "files",
          localField: "files",
          foreignField: "_id",
          as: "fileDetails"
        }
      },
      {
        $unwind: "$fileDetails"
      },
      {
        $match: {
          "fileDetails.collectionId": { $exists: true, $ne: null }
        }
      },
      {
        $lookup: {
          from: "collections",
          localField: "fileDetails.collectionId",
          foreignField: "_id",
          as: "collectionDetails"
        }
      },
      {
        $unwind: {
          path: "$collectionDetails",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $group: {
          _id: "$collectionDetails._id",
          title: { $first: "$collectionDetails.title" },
          image: { $first: "$collectionDetails.mobileImage" },
          totalSales: { $sum: "$prix" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalSales: -1 }
      },
      {
        $limit: 5
      }
    ]);

    // Transform the data to ensure proper formatting
    const transformedCollections = topCollections.map((collection: any) => ({
      _id: collection._id.toString(),
      title: collection.title || "Untitled Collection",
      image: collection.image || "",
      totalSales: collection.totalSales || 0,
      orderCount: collection.orderCount || 0
    }));

    return NextResponse.json(transformedCollections, { status: 200 });
  } catch (error) {
    console.error("Error fetching top collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch top collections" },
      { status: 500 }
    );
  }
}

