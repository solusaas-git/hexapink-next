import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import File from "@/lib/models/File";
import Collection from "@/lib/models/Collection";
import { authenticate } from "@/lib/middleware/authenticate";

// Ensure models are registered
const models = { File, Collection };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id: orderId } = await params;

    const order = await Order.findById(orderId)
      .populate({
        path: "files",
        model: models.File,
        populate: {
          path: "collectionId",
          model: models.Collection,
          select: "title image mobileImage",
        },
      });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Ensure the user owns the order
    if (order.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

