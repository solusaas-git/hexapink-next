import mongoose, { Schema, Model } from "mongoose";

interface ITableColumn {
  tableId: string;
  tableName: string;
  tableColumn: string;
}

interface IColumn {
  id: number;
  name: string;
  type: string;
  showToClient: boolean;
  isAdditionalFee: boolean;
  additionalFee?: number;
  tableColumns?: ITableColumn[];
  optional?: boolean;
  stepName?: string;
}

export interface ICollection {
  _id: string;
  title: string;
  image?: string;
  mobileImage?: string;
  type?: string;
  description?: string;
  countries?: string[];
  fee: number;
  discount: number;
  columns: IColumn[];
  status: "Active" | "Inactive";
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    title: { type: String, required: true, index: true },
    image: { type: String },
    mobileImage: { type: String },
    type: { type: String, index: true },
    description: { type: String },
    countries: { type: [String], index: true },
    fee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    columns: {
      type: [
        {
          id: { type: Number, required: true },
          name: { type: String, required: true },
          type: { type: String, required: true },
          showToClient: { type: Boolean, default: true },
          isAdditionalFee: { type: Boolean, default: false },
          additionalFee: { type: Number },
          tableColumns: [
            {
              tableId: { type: String },
              tableName: { type: String },
              tableColumn: { type: String },
            },
          ],
          optional: { type: Boolean },
          stepName: { type: String },
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      index: true,
    },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

CollectionSchema.index({ title: 1, type: 1 });

const Collection: Model<ICollection> =
  mongoose.models.Collection ||
  mongoose.model<ICollection>("Collection", CollectionSchema);

export default Collection;

