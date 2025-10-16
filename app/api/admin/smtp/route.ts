import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Smtp from "@/lib/models/SMTP";
import { authenticate } from "@/lib/middleware/authenticate";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "Primary";

    await connectDB();

    const smtp = await Smtp.findOne({ type });

    if (!smtp) {
      return NextResponse.json(null);
    }

    // Don't send password to frontend for security
    const smtpData = smtp.toObject();
    smtpData.password = ""; // Clear password

    return NextResponse.json(smtpData);
  } catch (error) {
    console.error("Error fetching SMTP:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { type, host, port, secure, userName, password, fromEmail, fromName, replyTo } = body;

    if (!type || !host || !port || !userName || !fromEmail || !fromName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Update or create
    const smtp = await Smtp.findOneAndUpdate(
      { type },
      {
        type,
        host,
        port: parseInt(port),
        secure,
        userName,
        ...(password && { password }), // Only update password if provided
        fromEmail,
        fromName,
        replyTo: replyTo || "",
      },
      { upsert: true, new: true }
    );

    // Don't send password back
    const smtpData = smtp.toObject();
    smtpData.password = "";

    return NextResponse.json(smtpData);
  } catch (error) {
    console.error("Error saving SMTP:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

