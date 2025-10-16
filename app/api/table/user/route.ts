import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Table from "@/lib/models/Table";
import { authenticate } from "@/lib/middleware/authenticate";

/**
 * GET /api/table/user
 * Fetch all tables belonging to the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch all tables for this user
    const tables = await Table.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .select("tableName columns leads tags file delimiter createdAt updatedAt");

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Error fetching user tables:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

