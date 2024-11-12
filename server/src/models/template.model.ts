import mongoose, { Schema } from 'mongoose'
import { Field } from './field.model'; // Import the Field model

const TemplateSchema = new Schema({
  documentTemplateUrl: { type: String, required: true },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, required: true },
  description: String,
  emailSubject: String,
  emailMessage: String,
  defaultFields: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Field', // Reference to Field model
    },
  ],
  recipientRoles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'RecipientRole',
    },
  ],
  isFavorite: { type: Boolean, default: false },
  isDelete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export const Template = mongoose.model('Template', TemplateSchema)
