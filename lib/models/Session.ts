import mongoose, { Schema, Model } from "mongoose";
import crypto from "crypto";

export interface ISession {
  _id: string;
  token: string;
  csrfToken: string;
  createdAt: Date;
  userId: mongoose.Types.ObjectId;
  status: "valid" | "expired";
}

interface ISessionModel extends Model<ISession> {
  generateToken(): Promise<string>;
  expireAllTokensForUser(userId: mongoose.Types.ObjectId): Promise<any>;
}

interface ISessionMethods {
  expireToken(): Promise<any>;
}

const SessionSchema = new Schema<ISession, ISessionModel, ISessionMethods>({
  token: {
    type: String,
    unique: true,
    required: true,
  },
  csrfToken: {
    type: String,
    unique: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  status: {
    type: String,
    enum: ["valid", "expired"],
    default: "valid",
  },
});

SessionSchema.statics.generateToken = function (): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        reject(err);
      }
      const token = buf.toString("hex");
      resolve(token);
    });
  });
};

SessionSchema.statics.expireAllTokensForUser = function (
  userId: mongoose.Types.ObjectId
) {
  return this.updateMany({ userId }, { $set: { status: "expired" } });
};

SessionSchema.methods.expireToken = function () {
  const session = this;
  return session.updateOne({ $set: { status: "expired" } });
};

const Session: ISessionModel =
  (mongoose.models.Session as unknown as ISessionModel) ||
  mongoose.model<ISession, ISessionModel>("Session", SessionSchema);

export default Session;

