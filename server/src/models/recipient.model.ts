
import mongoose, { Schema } from "mongoose";
import { IRecipient } from "../types/recipient.interface";

const RecipientSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Viewed", "Signed", "Declined"],
      default: "Pending",
    },
    signatureTimestamp: { type: Date },
    agreementId: {
      type: Schema.Types.ObjectId,
      ref: "Agreement",
      required: true,
    },
  },
  { collection: "Recipient" }
);

export const Recipient = mongoose.model<IRecipient>(
  "Recipient",
  RecipientSchema
);

