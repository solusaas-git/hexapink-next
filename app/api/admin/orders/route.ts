import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "email");

    const formattedOrders = orders.map((order: any) => ({
      _id: order._id,
      userId: order.user?._id,
      userEmail: order.user?.email || "N/A",
      collectionName: "N/A", // Collection not in this schema
      filesCount: order.files?.length || 0,
      volume: order.volume || 0,
      amount: order.prix,
      status: order.paid,
      createdAt: order.createdAt,
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

