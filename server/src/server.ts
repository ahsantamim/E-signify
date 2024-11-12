import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db'
import userRouter from './routes/user.routes' // Import user router
import templateRouter from './routes/template.routes' // Import template router

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// Middleware
// app.use(cors())
// alow cors all origins
app.use(cors({ origin: '*' }))
app.use(express.static('uploads'))
app.use(express.json())

// Connect to MongoDB
connectDB()

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Hello from express and typescript server!' })
})

// User routes
app.use('/api/users', userRouter)

// Template routes
app.use('/api/templates', templateRouter)

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
