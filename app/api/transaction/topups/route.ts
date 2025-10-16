import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await authenticate(request);
    if (!authUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = authUser._id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "All";

    // Build query - only fetch topup transactions
    const query: any = { 
      userId,
      type: "Topup"
    };
    
    if (status !== "All") {
      query.status = status;
    }

    // Fetch recent topups for this user
    const topups = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json(topups, { status: 200 });
  } catch (error) {
    console.error("Error fetching recent topups:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent topups" },
      { status: 500 }
    );
  }
}

