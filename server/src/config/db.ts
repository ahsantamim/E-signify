import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {})
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection failed:', err)
    process.exit(1) // Exit process with failure
  }
}

export default connectDB
