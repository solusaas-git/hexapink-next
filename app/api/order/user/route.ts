import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/lib/models/Order";
import File from "@/lib/models/File";
import Collection from "@/lib/models/Collection";
import { authenticate } from "@/lib/middleware/authenticate";

// Ensure models are registered
const models = { File, Collection };

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const orders = await Order.find({ user: user._id })
      .populate({
        path: "files",
        model: models.File,
        populate: {
          path: "collectionId",
          model: models.Collection,
        },
      })
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order: any) => {
      // Get collection info from files
      const collections = new Map<string, any>();
      if (order.files && order.files.length > 0) {
        order.files.forEach((file: any) => {
          if (file.collectionId) {
            collections.set(file.collectionId._id.toString(), {
              id: file.collectionId._id,
              title: file.collectionId.title,
              image: file.collectionId.image,
              mobileImage: file.collectionId.mobileImage,
            });
          }
        });
      }

      const collectionArray = Array.from(collections.values());

      return {
        _id: order._id,
        files: order.files || [],
        volume: order.volume || 0,
        collections: collectionArray,
        collectionName: collectionArray.length > 0 
          ? collectionArray.map(c => c.title).join(", ") 
          : "N/A",
        amount: order.prix,
        status: order.paid,
        createdAt: order.createdAt,
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

