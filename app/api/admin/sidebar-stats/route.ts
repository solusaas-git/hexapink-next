import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import File from "@/lib/models/File";
import Lookup from "@/lib/models/Lookup";
import Transaction from "@/lib/models/Transaction";
import Table from "@/lib/models/Table";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authUser = await authenticate(request);
    if (!authUser || (authUser.role !== "admin" && authUser.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    // Fetch counts for sidebar stats
    const [
      totalFiles,
      totalLookups,
      transactions,
      tables
    ] = await Promise.all([
      File.countDocuments(),
      Lookup.countDocuments(),
      Transaction.find({ status: "Completed" }).lean(),
      Table.find().lean()
    ]);

    // Calculate total revenue from completed transactions
    const totalRevenue = transactions.reduce((sum, transaction: any) => {
      return sum + (transaction.price || 0);
    }, 0);

    // Calculate total leads from all tables
    const totalLeads = tables.reduce((sum, table: any) => {
      return sum + (table.count || 0);
    }, 0);

    const stats = {
      totalRevenue,
      totalFiles,
      totalLeads,
      totalLookups
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Error fetching sidebar stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch sidebar stats" },
      { status: 500 }
    );
  }
}

