
import { Document } from "mongoose";

export interface IActivityLog extends Document {
  id: string;
  agreementId: string;
  userId: string;
  action: "Created" | "Sent" | "Viewed" | "Signed" | "Completed" | "Declined";
  timestamp: Date;
  description?: string;
}

