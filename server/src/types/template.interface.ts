import { Document } from 'mongoose'
import { IField } from './field.interface'
import { IRecipientRole } from './recipientRole.interface'
import { IWorkflow } from './workflow.interface'

export interface ITemplate extends Document {
  _id: string // Add this if necessary
  name: string
  description?: string // Optional field
  createdBy: string // User ID of the creator
  createdAt: Date // Automatically set by Mongoose, if you enable timestamps
  updatedAt: Date // Automatically set by Mongoose, if you enable timestamps
  defaultFields: IField[] // Array of fields
  recipientRoles: IRecipientRole[] // Array of recipient roles
  documentTemplateUrl: string // URL or path to the uploaded document
  workflow?: IWorkflow // Optional workflow information
  emailSubject: String
  emailMessage: String // Allows for lengthy email messages
}
