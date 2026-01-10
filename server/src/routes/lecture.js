import express from 'express'
import {
  getLectures,
  getLecture,
  createLecture,
  updateLecture,
  deleteLecture,
  getLecturesByInstructor,
  updateLectureOrder
} from '../controllers/lectureController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// All lecture routes require authentication
router.use(protect)

// Routes for specific lectures
router.get('/:id', getLecture)
router.put('/:id', authorize('instructor'), updateLecture)
router.delete('/:id', authorize('instructor'), deleteLecture)

// Routes for course lectures
router.get('/course/:courseId', getLectures)
router.post('/course/:courseId', authorize('instructor'), createLecture)
router.put('/course/:courseId/order', authorize('instructor'), updateLectureOrder)

// Routes for instructor lectures
router.get('/instructor/:instructorId', authorize('instructor'), getLecturesByInstructor)

export default router