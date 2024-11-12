import mongoose, { Schema } from 'mongoose'

const PositionSchema = new Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    page: { type: Number, required: true },
  },
  { _id: false }
)

const FieldSchema = new Schema({
  type: { type: String, required: true },
  position: { type: PositionSchema, required: true },
  value: { type: String },
  width: { type: Number },
  height: { type: Number },
  uniqueId: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'RecipientRole' }, // Field assigned to a recipient
})

export const Field = mongoose.model('Field', FieldSchema)
