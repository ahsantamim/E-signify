
import mongoose, { Schema } from "mongoose";
import { IActivityLog } from "../types/activityLog.interface";

const ActivityLogSchema: Schema = new Schema(
  {
    agreementId: {
      type: Schema.Types.ObjectId,
      ref: "Agreement",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["Created", "Sent", "Viewed", "Signed", "Completed", "Declined"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    description: { type: String },
  },
  { collection: "ActivityLog" }
);

export const ActivityLog = mongoose.model<IActivityLog>(
  "ActivityLog",
  ActivityLogSchema
);