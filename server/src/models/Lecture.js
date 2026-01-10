import mongoose from 'mongoose'

const lectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a lecture title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Please add a video URL'],
    validate: {
      validator: function(v) {
        // Basic URL validation
        return /^https?:\/\/.+/.test(v)
      },
      message: 'Please provide a valid video URL'
    }
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please specify the course for this lecture']
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please specify the instructor for this lecture']
  },
  order: {
    type: Number,
    default: 0,
    min: [0, 'Order cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for better query performance
lectureSchema.index({ courseId: 1, order: 1 })
lectureSchema.index({ instructorId: 1 })

// Virtual for formatted created date
lectureSchema.virtual('formattedCreatedAt').get(function() {
  return new Date(this.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Instance method to check if user can access this lecture
lectureSchema.methods.canAccess = async function(userId, userRole) {
  if (userRole === 'admin') return true
  if (userRole === 'instructor' && this.instructorId.toString() === userId.toString()) return true

  // For students, check if they're enrolled in the course
  if (userRole === 'student') {
    const Course = mongoose.model('Course')
    const course = await Course.findById(this.courseId)
    return course && course.isEnrolled(userId)
  }

  return false
}

// Static method to find lectures by course
lectureSchema.statics.findByCourse = function(courseId) {
  return this.find({ courseId }).sort({ order: 1, createdAt: 1 })
}

// Static method to find lectures by instructor
lectureSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructorId }).sort({ createdAt: -1 })
}

const Lecture = mongoose.model('Lecture', lectureSchema)

export default Lecture