import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Collection from "@/lib/models/Collection";
import Table from "@/lib/models/Table";
import { authenticate } from "@/lib/middleware/authenticate";

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

    const { id } = await params;

    // Find the collection
    const collection = await Collection.findById(id);
    
    if (!collection) {
      return NextResponse.json(
        { message: "Collection not found" },
        { status: 404 }
      );
    }

    // Extract unique table IDs from collection columns
    const tableIds = Array.from(
      new Set(
        collection.columns
          ?.flatMap((col: any) =>
            col.tableColumns?.map((tc: any) => tc.tableId) || []
          )
          .filter((id: any) => id)
      )
    );

    console.log(`Collection ${id} has ${tableIds.length} unique tables:`, tableIds);

    if (tableIds.length === 0) {
      console.log(`No tables found for collection ${id}`);
      return NextResponse.json({ totalLeads: 0 });
    }

    // Get all tables and sum their leads
    const tables = await Table.find({ _id: { $in: tableIds } });
    console.log(`Found ${tables.length} tables in DB:`, tables.map(t => ({ id: t._id, leads: t.leads })));
    
    const totalLeads = tables.reduce((sum, table) => sum + (table.leads || 0), 0);
    console.log(`Total leads for collection ${id}:`, totalLeads);

    return NextResponse.json({ totalLeads });
  } catch (error) {
    console.error("Error calculating total leads:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

