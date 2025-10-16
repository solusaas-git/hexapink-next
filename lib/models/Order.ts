import mongoose, { Schema, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IOrder {
  _id: string;
  user: mongoose.Types.ObjectId;
  files: mongoose.Types.ObjectId[];
  volume: number;
  prix: number;
  paid: "Paid" | "Unpaid";
  paymentMethod: string;
  receipts: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    files: [{ type: Schema.Types.ObjectId, ref: "File" }],
    volume: { type: Number, required: true },
    prix: { type: Number, required: true },
    paid: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    paymentMethod: { type: String, required: true },
    receipts: { type: [String], default: [] },
  },
  { timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ paid: 1 });
OrderSchema.index({ volume: 1 });
OrderSchema.index({ prix: 1 });

OrderSchema.plugin(mongoosePaginate);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;

