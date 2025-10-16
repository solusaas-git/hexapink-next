import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Table from "@/lib/models/Table";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const table = await Table.findById(id);

    if (!table) {
      return NextResponse.json(
        { message: "Table not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error("Error fetching table:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updateData = await request.json();

    await connectDB();

    const table = await Table.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!table) {
      return NextResponse.json(
        { message: "Table not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error("Error updating table:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const table = await Table.findByIdAndDelete(id);

    if (!table) {
      return NextResponse.json(
        { message: "Table not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Table deleted successfully" });
  } catch (error) {
    console.error("Error deleting table:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

