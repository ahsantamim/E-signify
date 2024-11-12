// models/signingOrder.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ISigningOrder extends Document {
  templateId: mongoose.Schema.Types.ObjectId;
  recipientId: mongoose.Schema.Types.ObjectId;
  order: number; // Order in which the recipient should sign
  status: 'pending' | 'signed';
}

const SigningOrderSchema = new Schema<ISigningOrder>({
  templateId: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
    required: true,
  },
  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'RecipientRole',
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'signed'],
    default: 'pending',
  },
});

export const SigningOrder = mongoose.model<ISigningOrder>('SigningOrder', SigningOrderSchema);