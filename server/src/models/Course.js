import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a course description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add an instructor']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: {
      values: ['web-development', 'data-science', 'mobile-development', 'design', 'marketing', 'business', 'other'],
      message: 'Please select a valid category'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  thumbnail: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0,
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number, // in hours
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: [{
    type: String,
    trim: true
  }],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalStudents: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  totalRatings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index for better query performance
courseSchema.index({ instructor: 1 })
courseSchema.index({ category: 1 })
courseSchema.index({ status: 1 })
courseSchema.index({ title: 'text', description: 'text' }) // Text search

// Virtual for course URL slug
courseSchema.virtual('slug').get(function() {
  return this.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-')
})

// Virtual for average rating calculation
courseSchema.virtual('averageRating').get(function() {
  return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : 0
})

// Instance method to check if user is enrolled
courseSchema.methods.isEnrolled = function(userId) {
  return this.enrolledStudents.includes(userId)
}

// Instance method to enroll a student
courseSchema.methods.enrollStudent = function(userId) {
  if (!this.enrolledStudents.includes(userId)) {
    this.enrolledStudents.push(userId)
    this.totalStudents = this.enrolledStudents.length
    return true
  }
  return false
}

// Instance method to unenroll a student
courseSchema.methods.unenrollStudent = function(userId) {
  const index = this.enrolledStudents.indexOf(userId)
  if (index > -1) {
    this.enrolledStudents.splice(index, 1)
    this.totalStudents = this.enrolledStudents.length
    return true
  }
  return false
}

// Static method to find published courses
courseSchema.statics.findPublished = function() {
  return this.find({ status: 'published' })
}

// Static method to find courses by instructor
courseSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructor: instructorId })
}

// Static method to find courses by category
courseSchema.statics.findByCategory = function(category) {
  return this.find({ status: 'published', category })
}

// Pre-save middleware to update totalStudents
courseSchema.pre('save', function(next) {
  if (this.isModified('enrolledStudents')) {
    this.totalStudents = this.enrolledStudents.length
  }
  next()
})

const Course = mongoose.model('Course', courseSchema)

export default Course
