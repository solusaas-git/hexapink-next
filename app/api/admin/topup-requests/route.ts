import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const requests = await Transaction.find({
      type: "Topup",
      status: { $in: ["Waiting", "Completed"] },
    })
      .sort({ createdAt: -1 })
      .populate("userId", "email firstName lastName");

    const formattedRequests = requests.map((req: any) => ({
      _id: req._id,
      userId: req.userId?._id,
      userEmail: req.userId?.email || "N/A",
      userName: `${req.userId?.firstName || ""} ${req.userId?.lastName || ""}`.trim() || "N/A",
      amount: req.price,
      paymentMethod: req.paymentmethod,
      receipts: req.receipts || [],
      status: req.status,
      createdAt: req.createdAt,
    }));

    return NextResponse.json(formattedRequests);
  } catch (error) {
    console.error("Error fetching topup requests:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

