
import { Document } from "mongoose";

export interface IWorkflow extends Document {
  id: string;
  steps: IWorkflowStep[];
}

export interface IWorkflowStep extends Document {
  order: number;
  role: string;
}
