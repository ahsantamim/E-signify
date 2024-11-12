
import mongoose, { Schema } from "mongoose";
import { IWorkflow } from "../types/workflow.interface";

const WorkflowStepSchema: Schema = new Schema({
  order: { type: Number, required: true },
  role: { type: String, required: true },
});

const WorkflowSchema: Schema = new Schema(
  {
    steps: [WorkflowStepSchema],
  },
  { collection: "Workflow" }
);

export const Workflow = mongoose.model<IWorkflow>("Workflow", WorkflowSchema);
