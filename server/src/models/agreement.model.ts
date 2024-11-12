
import mongoose, { Schema } from "mongoose";
import { IAgreement } from "../types/agreement.interface";

const AgreementSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Completed", "Declined"],
      default: "Draft",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    dateSent: { type: Date },
    dateCompleted: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    envelopeId: { type: String, required: true },
    timeZone: { type: String, default: "UTC" },
    documentUrl: { type: String, required: true },
    recipients: [{ type: Schema.Types.ObjectId, ref: "Recipient" }],
    activityLog: [{ type: Schema.Types.ObjectId, ref: "ActivityLog" }],
    templateId: { type: Schema.Types.ObjectId, ref: "Template" },
  },
  { collection: "Agreement" }
);

export const Agreement = mongoose.model<IAgreement>(
  "Agreement",
  AgreementSchema
);

