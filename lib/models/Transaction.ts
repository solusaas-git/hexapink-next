import mongoose, { Schema, Model } from "mongoose";

export interface ITransaction {
  _id: string;
  userId: mongoose.Types.ObjectId;
  price: number;
  type: "Topup" | "Order" | "Lookup";
  description?: string;
  paymentmethod: "Credit Card" | "Bank Transfer" | "Balance";
  paymentId?: mongoose.Types.ObjectId;
  status: "Completed" | "Waiting" | "Free";
  receipts: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["Topup", "Order", "Lookup"],
      default: "Topup",
      required: true,
      index: true,
    },
    description: {
      type: String,
    },
    paymentmethod: {
      type: String,
      enum: ["Credit Card", "Bank Transfer", "Balance"],
      default: "Credit Card",
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    status: {
      type: String,
      enum: ["Completed", "Waiting", "Free"],
      default: "Completed",
      index: true,
    },
    receipts: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

TransactionSchema.index({ userId: 1, type: 1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;

