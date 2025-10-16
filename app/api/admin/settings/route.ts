import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/middleware/authenticate";

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const settings = await request.json();

    // Implement settings storage logic here
    // This is a placeholder

    return NextResponse.json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

