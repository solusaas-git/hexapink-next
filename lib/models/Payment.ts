import mongoose, { Schema, Model } from "mongoose";

export interface IPayment {
  _id: string;
  paymentType: "bank" | "stripe";
  bankName?: string;
  accountOwner?: string;
  accountNumber?: string;
  iban?: string;
  rib?: string;
  swift?: string;
  bankLogo?: string;
  qrCode?: string;
  publicKey?: string;
  secretKey?: string;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentType: {
      type: String,
      enum: ["bank", "stripe"],
      required: true,
    },
    bankName: {
      type: String,
    },
    accountOwner: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    iban: {
      type: String,
    },
    rib: {
      type: String,
    },
    swift: {
      type: String,
    },
    bankLogo: {
      type: String,
    },
    qrCode: {
      type: String,
    },
    publicKey: {
      type: String,
    },
    secretKey: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;

