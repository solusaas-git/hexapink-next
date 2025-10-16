import mongoose, { Schema, Document } from "mongoose";

export interface ICountry extends Document {
  name: string;
  onSignUp: boolean;
  inApp: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CountrySchema = new Schema<ICountry>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    onSignUp: {
      type: Boolean,
      default: true,
    },
    inApp: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Country = mongoose.models.Country || mongoose.model<ICountry>("Country", CountrySchema);

export default Country;
