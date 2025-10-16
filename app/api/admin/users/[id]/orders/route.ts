import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import File from "@/lib/models/File";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const authUser = await authenticate(request);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const userId = id;

    // Ensure File model is registered
    if (File) {
      // This ensures the File model is loaded
    }

    // Fetch all orders for this user
    const orders = await Order.find({ user: userId })
      .populate("files", "title")
      .sort({ createdAt: -1 })
      .lean();

    // Transform the data to match expected format
    const transformedOrders = orders.map((order: any) => ({
      _id: order._id.toString(),
      collectionName: order.files && order.files.length > 0 
        ? order.files.map((f: any) => f?.title || "File").join(", ")
        : "Order",
      price: order.prix || 0,
      volume: order.volume || 0,
      status: order.paid === "Paid" ? "completed" : "pending",
      createdAt: order.createdAt,
    }));

    return NextResponse.json(transformedOrders, { status: 200 });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch user orders" },
      { status: 500 }
    );
  }
}

