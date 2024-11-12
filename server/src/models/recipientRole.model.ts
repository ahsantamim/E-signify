
import mongoose, { Schema } from "mongoose";
import { IRecipientRole } from "../types/recipientRole.interface";

const RecipientRoleSchema: Schema = new Schema(
  {
    role: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  { collection: "RecipientRole" }
);

export const RecipientRole = mongoose.model<IRecipientRole>(
  "RecipientRole",
  RecipientRoleSchema
);

