import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  phone?: string;
  industry?: string;
  company?: string;
  role: "user" | "manager" | "admin";
  status: "Active" | "Suspended";
  balance: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  is_verified: boolean;
  otp?: string;
  otp_expiration?: Date;
  refreshToken?: string;
  refreshTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
      index: true,
    },
    status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active",
      index: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otp_expiration: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    refreshTokenExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1, status: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

