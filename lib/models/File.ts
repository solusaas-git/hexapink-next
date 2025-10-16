import mongoose, { Schema, Model } from "mongoose";

export interface IFile {
  _id: string;
  user?: mongoose.Types.ObjectId;
  title: string;
  type: string;
  countries: string[];
  collectionId?: mongoose.Types.ObjectId;
  image?: string;
  unitPrice?: number;
  volume?: number;
  columns?: any;
  status: "Ready" | "Waiting";
  path?: string;
  orderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    countries: { type: [String], required: true, index: true },
    collectionId: { type: Schema.Types.ObjectId, ref: "Collection" },
    image: { type: String },
    unitPrice: { type: Number },
    volume: { type: Number, index: true },
    columns: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["Ready", "Waiting"],
      default: "Waiting",
      index: true,
    },
    path: { type: String },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  { timestamps: true }
);

FileSchema.index({ user: 1, title: 1 });

const File: Model<IFile> =
  mongoose.models.File || mongoose.model<IFile>("File", FileSchema);

export default File;

