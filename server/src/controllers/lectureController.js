import Lecture from '../models/Lecture.js'
import Course from '../models/Course.js'
import User from '../models/User.js'

// @desc    Get all lectures for a course
// @route   GET /api/courses/:courseId/lectures
// @access  Private (Enrolled students or instructor)
export const getLectures = async (req, res) => {
  try {
    const { courseId } = req.params

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    // Check if course is published or if user is the instructor
    if (course.status !== 'published' && (!req.user || course.instructor.toString() !== req.user.id)) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    // Check access permissions
    if (req.user.role === 'student' && !course.isEnrolled(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be enrolled in this course to view lectures.'
      })
    }

    // Get lectures for the course
    const lectures = await Lecture.findByCourse(courseId).populate('instructorId', 'name avatar')

    res.status(200).json({
      success: true,
      count: lectures.length,
      data: lectures
    })
  } catch (error) {
    console.error('Get lectures error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lectures'
    })
  }
}

// @desc    Get single lecture
// @route   GET /api/lectures/:id
// @access  Private (Enrolled students or instructor)
export const getLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate('courseId', 'title status instructor')
      .populate('instructorId', 'name avatar')

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      })
    }

    // Check if user can access this lecture
    const canAccess = await lecture.canAccess(req.user.id, req.user.role)
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this lecture.'
      })
    }

    res.status(200).json({
      success: true,
      data: lecture
    })
  } catch (error) {
    console.error('Get lecture error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lecture'
    })
  }
}

// @desc    Create/upload a lecture
// @route   POST /api/courses/:courseId/lectures
// @access  Private (Instructor only)
export const createLecture = async (req, res) => {
  try {
    const { courseId } = req.params
    const { title, videoUrl, order } = req.body

    // Check if course exists and user is the instructor
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only add lectures to your own courses.'
      })
    }

    // Create the lecture
    const lecture = await Lecture.create({
      title,
      videoUrl,
      courseId,
      instructorId: req.user.id,
      order: order || 0
    })

    // Populate instructor data for response
    await lecture.populate('instructorId', 'name avatar')

    res.status(201).json({
      success: true,
      data: lecture,
      message: 'Lecture created successfully'
    })
  } catch (error) {
    console.error('Create lecture error:', error.message)

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message)
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create lecture'
    })
  }
}

// @desc    Update a lecture
// @route   PUT /api/lectures/:id
// @access  Private (Instructor only)
export const updateLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      })
    }

    // Check if user is the instructor of this lecture
    if (lecture.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own lectures.'
      })
    }

    const updatedLecture = await Lecture.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('instructorId', 'name avatar')

    res.status(200).json({
      success: true,
      data: updatedLecture,
      message: 'Lecture updated successfully'
    })
  } catch (error) {
    console.error('Update lecture error:', error.message)

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message)
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update lecture'
    })
  }
}

// @desc    Delete a lecture
// @route   DELETE /api/lectures/:id
// @access  Private (Instructor only)
export const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      })
    }

    // Check if user is the instructor of this lecture
    if (lecture.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own lectures.'
      })
    }

    await Lecture.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully'
    })
  } catch (error) {
    console.error('Delete lecture error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to delete lecture'
    })
  }
}

// @desc    Get lectures by instructor
// @route   GET /api/lectures/instructor/:instructorId
// @access  Private (Instructor viewing their own lectures)
export const getLecturesByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params

    // Only allow instructors to view their own lectures or admins to view all
    if (req.user.id !== instructorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own lectures.'
      })
    }

    const lectures = await Lecture.findByInstructor(instructorId)
      .populate('courseId', 'title status')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: lectures.length,
      data: lectures
    })
  } catch (error) {
    console.error('Get lectures by instructor error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve instructor lectures'
    })
  }
}

// @desc    Update lecture order
// @route   PUT /api/courses/:courseId/lectures/order
// @access  Private (Instructor only)
export const updateLectureOrder = async (req, res) => {
  try {
    const { courseId } = req.params
    const { lectureOrders } = req.body // Array of { lectureId, order }

    // Check if course exists and user is the instructor
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only reorder lectures in your own courses.'
      })
    }

    // Update lecture orders in batch
    const updatePromises = lectureOrders.map(({ lectureId, order }) =>
      Lecture.findByIdAndUpdate(lectureId, { order })
    )

    await Promise.all(updatePromises)

    // Get updated lectures
    const lectures = await Lecture.findByCourse(courseId)
      .populate('instructorId', 'name avatar')
      .sort({ order: 1, createdAt: 1 })

    res.status(200).json({
      success: true,
      data: lectures,
      message: 'Lecture order updated successfully'
    })
  } catch (error) {
    console.error('Update lecture order error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Failed to update lecture order'
    })
  }
}