
import { Document } from "mongoose";

export interface IRecipient extends Document {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Pending" | "Viewed" | "Signed" | "Declined";
  signatureTimestamp?: Date;
  agreementId: string; // Reference to the associated agreement
}
