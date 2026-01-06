import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  completedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for better query performance
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })

// Virtual for user's full profile (excluding sensitive data)
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    bio: this.bio,
    enrolledCoursesCount: this.enrolledCourses.length,
    completedCoursesCount: this.completedCourses.length,
    createdAt: this.createdAt
  }
})

// Instance method to check if user has completed a course
userSchema.methods.hasCompletedCourse = function(courseId) {
  return this.completedCourses.includes(courseId)
}

// Instance method to check if user is enrolled in a course
userSchema.methods.isEnrolledInCourse = function(courseId) {
  return this.enrolledCourses.includes(courseId)
}

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true })
}

const User = mongoose.model('User', userSchema)

export default User
