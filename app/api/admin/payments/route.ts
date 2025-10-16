import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Payment from "@/lib/models/Payment";
import { authenticate } from "@/lib/middleware/authenticate";
import { saveFile } from "@/lib/services/fileService";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const payments = await Payment.find().sort({ createdAt: -1 });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
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

    await connectDB();

    const contentType = request.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      // Bank payment with file uploads
      const formData = await request.formData();
      const paymentMethod = formData.get("paymentMethod") as string;
      const bankName = formData.get("bankName") as string;
      const accountOwner = formData.get("accountOwner") as string;
      const accountNumber = formData.get("accountNumber") as string;
      const rib = formData.get("rib") as string;
      const iban = formData.get("iban") as string;
      const swift = formData.get("swift") as string;
      const bankLogoFile = formData.get("bankLogo") as File | null;
      const qrCodeFile = formData.get("qrCode") as File | null;

      let bankLogoPath = "";
      let qrCodePath = "";

      if (bankLogoFile) {
        bankLogoPath = await saveFile(bankLogoFile, "payments");
      }

      if (qrCodeFile) {
        qrCodePath = await saveFile(qrCodeFile, "payments");
      }

      const newPayment = new Payment({
        paymentType: paymentMethod,
        bankName,
        accountOwner,
        accountNumber,
        rib,
        iban,
        swift,
        bankLogo: bankLogoPath,
        qrCode: qrCodePath,
        status: "Active",
      });

      await newPayment.save();

      return NextResponse.json(newPayment, { status: 201 });
    } else {
      // Stripe payment (JSON)
      const body = await request.json();
      const { paymentMethod, stripePublicKey, stripeSecretKey } = body;

      const newPayment = new Payment({
        paymentType: paymentMethod,
        publicKey: stripePublicKey,
        secretKey: stripeSecretKey,
        status: "Active",
      });

      await newPayment.save();

      return NextResponse.json(newPayment, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

