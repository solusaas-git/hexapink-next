import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import File from "@/lib/models/File";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await authenticate(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Ensure File model is registered
    if (File) {
      // This ensures the File model is loaded
    }

    const userId = authUser._id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "All";

    // Build query
    const query: any = { user: userId };
    
    if (status !== "All") {
      query.paid = status;
    }

    // Fetch the 10 most recent orders for this user
    const orders = await Order.find(query)
      .populate("files", "title")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Transform the data to match expected format
    const transformedOrders = orders.map((order: any) => ({
      _id: order._id.toString(),
      files: order.files || [],
      prix: order.prix || 0,
      volume: order.volume || 0,
      paid: order.paid || "Unpaid",
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

