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
    const authUser = await authenticate(request);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;

    // Ensure File model is registered
    if (File) {
      // This ensures the File model is loaded
    }

    const order = await Order.findById(id)
      .populate("user", "email firstName lastName")
      .populate("files", "title volume path columns")
      .lean();

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

