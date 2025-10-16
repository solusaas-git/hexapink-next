import mongoose, { Schema, Model } from "mongoose";

export interface ISMTP {
  _id: string;
  type: "Primary" | "Failover";
  host: string;
  port: number;
  userName: string;
  password: string;
  fromName: string;
  fromEmail: string;
  secure: boolean;
  replyTo: string;
}

const SMTPSchema = new Schema<ISMTP>({
  type: {
    type: String,
    enum: ["Primary", "Failover"],
    required: true,
    unique: true,
  },
  host: { type: String, required: true },
  port: { type: Number, required: true },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  fromName: { type: String, required: true },
  fromEmail: { type: String, required: true },
  secure: { type: Boolean, required: true },
  replyTo: { type: String, required: true },
});

const SMTP: Model<ISMTP> =
  mongoose.models.SMTP || mongoose.model<ISMTP>("SMTP", SMTPSchema);

export default SMTP;

