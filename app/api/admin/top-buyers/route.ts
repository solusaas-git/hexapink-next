import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authUser = await authenticate(request);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // Ensure User model is registered
    if (User) {
      // This ensures the User model is loaded
    }

    // Aggregate orders to find top buyers
    const topBuyers = await Order.aggregate([
      {
        $match: {
          paid: "Paid" // Only count paid orders
        }
      },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$prix" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: "$userDetails"
      },
      {
        $project: {
          _id: "$userDetails._id",
          firstName: "$userDetails.firstName",
          lastName: "$userDetails.lastName",
          email: "$userDetails.email",
          totalSpent: 1,
          orderCount: 1
        }
      }
    ]);

    // Transform the data to ensure proper formatting
    const transformedBuyers = topBuyers.map((buyer: any) => ({
      _id: buyer._id.toString(),
      firstName: buyer.firstName || "Unknown",
      lastName: buyer.lastName || "User",
      email: buyer.email || "N/A",
      totalSpent: buyer.totalSpent || 0,
      orderCount: buyer.orderCount || 0
    }));

    return NextResponse.json(transformedBuyers, { status: 200 });
  } catch (error) {
    console.error("Error fetching top buyers:", error);
    return NextResponse.json(
      { error: "Failed to fetch top buyers" },
      { status: 500 }
    );
  }
}

