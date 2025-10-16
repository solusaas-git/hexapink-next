import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Payment from "@/lib/models/Payment";
import { authenticate } from "@/lib/middleware/authenticate";
import { saveFile } from "@/lib/services/fileService";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      // Bank payment with file uploads
      const formData = await request.formData();
      const bankName = formData.get("bankName") as string;
      const accountOwner = formData.get("accountOwner") as string;
      const accountNumber = formData.get("accountNumber") as string;
      const rib = formData.get("rib") as string;
      const iban = formData.get("iban") as string;
      const swift = formData.get("swift") as string;
      const bankLogoFile = formData.get("bankLogo") as File | null;
      const qrCodeFile = formData.get("qrCode") as File | null;

      const updateData: any = {
        bankName,
        accountOwner,
        accountNumber,
        rib,
        iban,
        swift,
      };

      if (bankLogoFile) {
        const bankLogoPath = await saveFile(bankLogoFile, "payments");
        updateData.bankLogo = bankLogoPath;
      }

      if (qrCodeFile) {
        const qrCodePath = await saveFile(qrCodeFile, "payments");
        updateData.qrCode = qrCodePath;
      }

      const updatedPayment = await Payment.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updatedPayment) {
        return NextResponse.json(
          { message: "Payment not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedPayment);
    } else {
      // Stripe payment (JSON)
      const body = await request.json();
      const { stripePublicKey, stripeSecretKey } = body;

      const updatedPayment = await Payment.findByIdAndUpdate(
        id,
        {
          publicKey: stripePublicKey,
          secretKey: stripeSecretKey,
        },
        { new: true }
      );

      if (!updatedPayment) {
        return NextResponse.json(
          { message: "Payment not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(updatedPayment);
    }
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticate(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const deletedPayment = await Payment.findByIdAndDelete(id);

    if (!deletedPayment) {
      return NextResponse.json(
        { message: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

