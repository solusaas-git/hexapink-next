import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Transaction from "@/lib/models/Transaction";
import { authenticate } from "@/lib/middleware/authenticate";
import { saveFile } from "@/lib/services/fileService";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const contentType = request.headers.get("content-type") || "";

    let amount: number;
    let paymentMethodId: string;
    let receiptPath: string | undefined;
    let paymentType: "Credit Card" | "Bank Transfer" = "Bank Transfer";

    // Handle FormData (bank transfer with receipt)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      
      amount = parseFloat(formData.get("amount") as string);
      paymentMethodId = formData.get("paymentMethod") as string;
      paymentType = "Bank Transfer";
      
      const receiptFile = formData.get("receipt") as File;
      if (receiptFile) {
        receiptPath = await saveFile(receiptFile, "receipts");
      }
    } 
    // Handle JSON (credit card)
    else {
      const body = await request.json();
      amount = body.amount;
      paymentMethodId = body.paymentMethod;
      paymentType = "Credit Card";
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Invalid amount" },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: user._id,
      type: "Topup",
      paymentmethod: paymentType,
      paymentId: paymentMethodId || undefined,
      price: amount,
      status: "Waiting",
      receipts: receiptPath ? [receiptPath] : [],
    });

    return NextResponse.json({
      message: "Top-up request submitted successfully",
      transaction,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating top-up request:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
