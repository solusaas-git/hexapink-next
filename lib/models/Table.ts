import mongoose, { Schema, Model } from "mongoose";

export interface ITable {
  _id: string;
  userId: mongoose.Types.ObjectId;
  tableName: string;
  columns: string[];
  leads: number;
  tags: string[];
  file: string;
  delimiter: "comma" | "tab" | "semicolon" | "pipe";
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tableName: {
      type: String,
      required: true,
      index: true,
    },
    columns: [
      {
        type: String,
      },
    ],
    leads: {
      type: Number,
      required: true,
      index: true,
    },
    tags: [
      {
        type: String,
        index: true,
      },
    ],
    file: {
      type: String,
      required: true,
    },
    delimiter: {
      type: String,
      enum: ["comma", "tab", "semicolon", "pipe"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

TableSchema.index({ userId: 1, tableName: 1 });

const Table: Model<ITable> =
  mongoose.models.Table || mongoose.model<ITable>("Table", TableSchema);

export default Table;

