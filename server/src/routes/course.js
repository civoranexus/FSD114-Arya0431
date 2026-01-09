import express from 'express'
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesByInstructor,
  getEnrolledCourses,
  enrollCourse,
  unenrollCourse,
  getCategories
} from '../controllers/courseController.js'
import { protect, authorize, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/categories', getCategories)
router.get('/', getCourses)
router.get('/:id', optionalAuth, getCourse)

// Instructor-only routes
router.post('/', protect, authorize('instructor'), createCourse)
router.put('/:id', protect, authorize('instructor'), updateCourse)
router.delete('/:id', protect, authorize('instructor'), deleteCourse)

// Protected routes (all authenticated users)
router.get('/instructor/:instructorId', protect, getCoursesByInstructor)
router.get('/user/enrolled', protect, getEnrolledCourses)

// Student enrollment routes
router.post('/:id/enroll', protect, authorize('student'), enrollCourse)
router.delete('/:id/enroll', protect, unenrollCourse)

export default router
