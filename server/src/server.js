import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: './config.env' })

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRE']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '))
  process.exit(1)
}

// Import database connection
import connectDB from './config/database.js'

// Import routes
import healthRoutes from './routes/health.js'
import authRoutes from './routes/auth.js'
import courseRoutes from './routes/course.js'
import lectureRoutes from './routes/lecture.js'

// Create Express app
const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:"],
      mediaSrc: ["'self'", "https:", "http:"],
    },
  },
})) // Security headers with CSP
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
})) // Enable CORS
app.use(morgan('combined')) // HTTP request logger
app.use(express.json({ limit: '10mb' })) // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies

// Routes
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/lectures', lectureRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Start server
const PORT = process.env.PORT || 4000
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 EduVillage server is running on port ${PORT}`)
  console.log(`📱 Frontend URL: http://localhost:5173`)
  console.log(`🔗 API URL: http://localhost:${PORT}/api`)
  console.log(`📚 Lecture API: http://localhost:${PORT}/api/lectures`)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`)
  // Close server & exit process
  if (app) {
    console.log('Shutting down server due to unhandled rejection')
    process.exit(1)
  }
})

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`)
  console.error(err.stack)
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

export default app
