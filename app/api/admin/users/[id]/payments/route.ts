import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
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

    // Fetch all transactions (payments) for this user
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Transform the data to match the expected format
    const transformedPayments = transactions.map((transaction: any) => ({
      _id: transaction._id.toString(),
      type: transaction.type || "Transaction",
      amount: transaction.price || 0,
      status: transaction.status === "Completed" ? "approved" : transaction.status === "Waiting" ? "pending" : "rejected",
      createdAt: transaction.createdAt,
    }));

    return NextResponse.json(transformedPayments, { status: 200 });
  } catch (error) {
    console.error("Error fetching user payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch user payments" },
      { status: 500 }
    );
  }
}

