import Course from '../models/Course.js'
import User from '../models/User.js'

// @desc    Get all published courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    // Build query
    let query = { status: 'published' }

    // Filtering
    const { category, instructor, search, level } = req.query

    if (category && category !== 'all') {
      query.category = category
    }

    if (instructor) {
      query.instructor = instructor
    }

    if (level && level !== 'all') {
      query.level = level
    }

    if (search) {
      query.$text = { $search: search }
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 12
    const startIndex = (page - 1) * limit

    // Sorting
    let sortOptions = { createdAt: -1 } // Default: newest first
    if (req.query.sort === 'oldest') {
      sortOptions = { createdAt: 1 }
    } else if (req.query.sort === 'popular') {
      sortOptions = { totalStudents: -1 }
    } else if (req.query.sort === 'rating') {
      sortOptions = { rating: -1 }
    }

    // Execute query
    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .sort(sortOptions)
      .limit(limit)
      .skip(startIndex)

    // Get total count for pagination
    const total = await Course.countDocuments(query)

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCourses: total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }

    res.status(200).json({
      success: true,
      count: courses.length,
      pagination,
      data: courses
    })
  } catch (error) {
    console.error('Get courses error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public (for published courses) / Private (for draft courses)
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio')
      .populate('enrolledStudents', 'name avatar')

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    // Check if course is published or if user is the instructor
    if (course.status !== 'published' && (!req.user || req.user._id.toString() !== course.instructor.toString())) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    res.status(200).json({
      success: true,
      data: course
    })
  } catch (error) {
    console.error('Get course error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// @desc    Create new course
// @route   POST /api/courses
// @access  Private (Instructor only)
export const createCourse = async (req, res) => {
  try {
    // Add instructor to req.body
    req.body.instructor = req.user.id

    const course = await Course.create(req.body)

    // Add course to instructor's createdCourses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { createdCourses: course._id }
    })

    res.status(201).json({
      success: true,
      data: course
    })
  } catch (error) {
    console.error('Create course error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor only)
export const updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this course'
      })
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })

    res.status(200).json({
      success: true,
      data: course
    })
  } catch (error) {
    console.error('Update course error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor only)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this course'
      })
    }

    // Remove course from instructor's createdCourses
    await User.findByIdAndUpdate(course.instructor, {
      $pull: { createdCourses: course._id }
    })

    // Remove course from all enrolled students
    await User.updateMany(
      { enrolledCourses: course._id },
      { $pull: { enrolledCourses: course._id } }
    )

    await Course.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    })
  } catch (error) {
    console.error('Delete course error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// @desc    Get courses by instructor
// @route   GET /api/courses/instructor/:instructorId
// @access  Public (published courses) / Private (all courses for instructor)
export const getCoursesByInstructor = async (req, res) => {
  try {
    let query = { instructor: req.params.instructorId }

    // If not the instructor themselves, only show published courses
    if (!req.user || req.user.id !== req.params.instructorId) {
      query.status = 'published'
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    })
  } catch (error) {
    console.error('Get courses by instructor error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// @desc    Get enrolled courses for current user
// @route   GET /api/courses/enrolled
// @access  Private
export const getEnrolledCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'enrolledCourses',
      populate: {
        path: 'instructor',
        select: 'name avatar'
      }
    })

    res.status(200).json({
      success: true,
      count: user.enrolledCourses.length,
      data: user.enrolledCourses
    })
  } catch (error) {
    console.error('Get enrolled courses error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private (Students only)
export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    if (course.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in unpublished course'
      })
    }

    // Check if already enrolled
    if (course.isEnrolled(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      })
    }

    // Enroll student
    course.enrollStudent(req.user.id)
    await course.save()

    // Add to user's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: course._id }
    })

    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in course'
    })
  } catch (error) {
    console.error('Enroll course error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// @desc    Unenroll from a course
// @route   DELETE /api/courses/:id/enroll
// @access  Private
export const unenrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      })
    }

    // Check if enrolled
    if (!course.isEnrolled(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Not enrolled in this course'
      })
    }

    // Unenroll student
    course.unenrollStudent(req.user.id)
    await course.save()

    // Remove from user's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { enrolledCourses: course._id }
    })

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course'
    })
  } catch (error) {
    console.error('Unenroll course error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// @desc    Get course categories
// @route   GET /api/courses/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'web-development', label: 'Web Development' },
      { value: 'data-science', label: 'Data Science' },
      { value: 'mobile-development', label: 'Mobile Development' },
      { value: 'design', label: 'Design' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'business', label: 'Business' },
      { value: 'other', label: 'Other' }
    ]

    res.status(200).json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}
