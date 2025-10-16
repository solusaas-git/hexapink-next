import mongoose, { Schema, Model } from "mongoose";

export interface IReview {
  _id: string;
  firstName: string;
  lastName: string;
  company: string;
  avatar: string;
  content: string;
  job: string;
  featured: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String, required: true },
    avatar: { type: String, required: true },
    content: { type: String, required: true },
    job: { type: String, required: true },
    featured: { type: Boolean, default: false },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

ReviewSchema.index({ firstName: 1, lastName: 1 });
ReviewSchema.index({ rating: -1 });

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;

