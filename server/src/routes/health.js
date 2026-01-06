import express from 'express'
import mongoose from 'mongoose'

const router = express.Router()

// @desc    Health check endpoint
// @route   GET /api/health
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState
    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }

    // Basic health information
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        status: dbStatus[dbState] || 'unknown',
        name: mongoose.connection.name || 'unknown'
      },
      environment: process.env.NODE_ENV || 'development',
      version: process.version
    }

    // If database is not connected, return error
    if (dbState !== 1) {
      return res.status(503).json({
        ...healthCheck,
        status: 'Database connection failed',
        database: {
          ...healthCheck.database,
          error: 'MongoDB not connected'
        }
      })
    }

    res.status(200).json(healthCheck)
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

// @desc    Detailed health check with database ping
// @route   GET /api/health/ping
// @access  Public
router.get('/ping', async (req, res) => {
  try {
    // Ping the database
    await mongoose.connection.db.admin().ping()

    res.status(200).json({
      status: 'OK',
      message: 'Database ping successful',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database ping failed:', error)
    res.status(503).json({
      status: 'ERROR',
      message: 'Database ping failed',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

export default router
