import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import File from "@/lib/models/File";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authUser = await authenticate(request);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // Ensure File model is registered
    if (File) {
      // This ensures the File model is loaded
    }

    // Fetch the 10 most recent orders
    const orders = await Order.find()
      .populate("user", "firstName lastName email")
      .populate("files", "title")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Transform the data to match expected format
    const transformedOrders = orders.map((order: any) => ({
      _id: order._id.toString(),
      user: {
        firstName: order.user?.firstName || "Unknown",
        lastName: order.user?.lastName || "User",
        email: order.user?.email || "N/A",
      },
      prix: order.prix || 0,
      volume: order.volume || 0,
      paid: order.paid || "Waiting",
      filesCount: order.files?.length || 0,
      createdAt: order.createdAt,
    }));

    return NextResponse.json(transformedOrders, { status: 200 });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent orders" },
      { status: 500 }
    );
  }
}

