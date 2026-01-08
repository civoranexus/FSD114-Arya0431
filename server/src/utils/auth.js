import jwt from 'jsonwebtoken'

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  })
}

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

// Extract token from Authorization header
export const extractToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }
  return authHeader.split(' ')[1]
}

// Send token response
export const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken()

  // Remove password from user object
  const userObj = user.toObject()
  delete userObj.password

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user: userObj
    }
  })
}


