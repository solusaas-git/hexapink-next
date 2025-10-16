import mongoose, { Schema, Model } from "mongoose";

export interface IPurchasedLead {
  _id: string;
  user: mongoose.Types.ObjectId;
  collectionId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  leadIdentifier: string; // Unique ID from the CSV
  purchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PurchasedLeadSchema = new Schema<IPurchasedLead>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    collectionId: { type: Schema.Types.ObjectId, ref: "Collection", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    leadIdentifier: { type: String, required: true, index: true },
    purchaseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index to quickly find if a user has purchased a specific lead
PurchasedLeadSchema.index({ user: 1, collectionId: 1, leadIdentifier: 1 }, { unique: true });

// Index to find all purchased leads for a user in a collection
PurchasedLeadSchema.index({ user: 1, collectionId: 1 });

const PurchasedLead: Model<IPurchasedLead> =
  mongoose.models.PurchasedLead || mongoose.model<IPurchasedLead>("PurchasedLead", PurchasedLeadSchema);

export default PurchasedLead;
