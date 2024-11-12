
import { IRecipient } from './recipient.interface';
import { IActivityLog } from './activityLog.interface';
import { Document } from 'mongoose';

export interface IAgreement extends Document {
  id: string;
  title: string;
  description?: string;
  status: 'Draft' | 'Sent' | 'Completed' | 'Declined';
  createdAt: Date;
  updatedAt: Date;
  dateSent?: Date;
  dateCompleted?: Date;
  createdBy: string; // User ID of the creator
  envelopeId: string;
  timeZone: string;
  documentUrl: string;
  recipients: IRecipient[];
  activityLog: IActivityLog[];
  templateId?: string; // Reference to a template if used
}