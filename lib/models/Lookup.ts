import mongoose, { Schema, Model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface ILookup {
  _id: string;
  user?: mongoose.Types.ObjectId;
  phone: string;
  country?: string;
  result?: "Valid" | "Unvalid";
  createdAt: Date;
  updatedAt: Date;
}

const LookupSchema = new Schema<ILookup>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    phone: {
      type: String,
      required: true,
      index: true,
    },
    country: {
      type: String,
      index: true,
    },
    result: {
      type: String,
      enum: ["Valid", "Unvalid"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

LookupSchema.index({ user: 1, phone: 1 });
LookupSchema.plugin(mongoosePaginate);

const Lookup: Model<ILookup> =
  mongoose.models.Lookup || mongoose.model<ILookup>("Lookup", LookupSchema);

export default Lookup;

