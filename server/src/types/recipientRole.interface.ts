import { Document } from 'mongoose'

export interface IRecipientRole extends Document {
  id: string
  role?: string
  name: string
  email: string
}
