import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI, lectureAPI } from '../utils/api'
import './Lectures.css'

const Lectures = () => {
  const { courseId } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [currentLecture, setCurrentLecture] = useState(null)
  const [lectureLoading, setLectureLoading] = useState(false)

  useEffect(() => {
    if (courseId) {
      fetchCourseAndLectures()
    }
  }, [courseId])

  useEffect(() => {
    if (course && user) {
      setIsEnrolled(course.enrolledStudents?.some(student => student._id === user.id) || false)
    }
  }, [course, user])

  const fetchCourseAndLectures = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch course details
      const courseResponse = await courseAPI.getCourse(courseId)
      setCourse(courseResponse.data.data)

      // Fetch lectures (only if user has access)
      if (user) {
        const lecturesResponse = await lectureAPI.getLectures(courseId)
        setLectures(lecturesResponse.data.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      if (error.response?.status === 403) {
        setError('Access denied. You must be enrolled in this course to view lectures.')
      } else if (error.response?.status === 404) {
        setError('Course not found')
      } else {
        setError('Failed to load course content')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLectureClick = async (lecture) => {
    try {
      setLectureLoading(true)
      const response = await lectureAPI.getLecture(lecture._id)
      setCurrentLecture(response.data.data)
    } catch (error) {
      console.error('Error loading lecture:', error)
      const errorMessage = error.response?.data?.message || 'Failed to load lecture. Please try again.'
      alert(errorMessage)
    } finally {
      setLectureLoading(false)
    }
  }

  const handleUploadLecture = async (formData) => {
    try {
      setUploading(true)
      await lectureAPI.createLecture(courseId, formData)
      setShowUploadForm(false)
      // Refresh lectures
      const response = await lectureAPI.getLectures(courseId)
      setLectures(response.data.data)
    } catch (error) {
      console.error('Error uploading lecture:', error)
      const errorMessage = error.response?.data?.message || 'Failed to upload lecture. Please try again.'
      alert(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const canAccessLectures = () => {
    if (!user) return false
    if (user.role === 'admin') return true
    if (user.role === 'instructor' && course?.instructor._id === user.id) return true
    return isEnrolled
  }

  const canUploadLectures = () => {
    return user?.role === 'instructor' && course?.instructor._id === user.id
  }

  if (loading) {
    return (
      <div className="lectures-page">
        <div className="container">
          <div className="loading">Loading course content...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lectures-page">
        <div className="container">
          <div className="error-message">
            <h2>{error}</h2>
            <Link to="/courses" className="back-link">← Back to Courses</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="lectures-page">
        <div className="container">
          <div className="error-message">
            <h2>Course not found</h2>
            <Link to="/courses" className="back-link">← Back to Courses</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lectures-page">
      <div className="container">
        {/* Course Header */}
        <div className="course-header">
          <Link to={`/courses/${courseId}`} className="back-to-course">
            ← Back to Course Details
          </Link>
          <h1 className="course-title">{course.title} - Lectures</h1>
          <p className="course-subtitle">Access your course content and lectures</p>
        </div>

        {/* Access Check */}
        {!canAccessLectures() && (
          <div className="access-denied">
            <h3>Access Restricted</h3>
            <p>You must be enrolled in this course to access the lectures.</p>
            {user?.role === 'student' && (
              <Link to={`/courses/${courseId}`} className="enroll-link">
                Enroll Now
              </Link>
            )}
          </div>
        )}

        {canAccessLectures() && (
          <div className="lectures-content">
            {/* Instructor Actions */}
            {canUploadLectures() && (
              <div className="instructor-actions">
                <button
                  className="upload-btn"
                  onClick={() => setShowUploadForm(!showUploadForm)}
                >
                  {showUploadForm ? 'Cancel' : '+ Add Lecture'}
                </button>
              </div>
            )}

            {/* Upload Form */}
            {showUploadForm && canUploadLectures() && (
              <UploadLectureForm
                onSubmit={handleUploadLecture}
                onCancel={() => setShowUploadForm(false)}
                uploading={uploading}
              />
            )}

            {/* Lectures List */}
            <div className="lectures-list">
              <h2>Course Lectures ({lectures.length})</h2>

              {lectures.length === 0 ? (
                <div className="no-lectures">
                  <p>No lectures available yet.</p>
                  {canUploadLectures() && (
                    <p>Click "Add Lecture" to upload your first lecture.</p>
                  )}
                </div>
              ) : (
                <div className="lectures-grid">
                  {lectures.map((lecture, index) => (
                    <div
                      key={lecture._id}
                      className={`lecture-item ${currentLecture?._id === lecture._id ? 'active' : ''}`}
                      onClick={() => handleLectureClick(lecture)}
                    >
                      <div className="lecture-number">{index + 1}</div>
                      <div className="lecture-info">
                        <h3>{lecture.title}</h3>
                        <p>Added {new Date(lecture.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="lecture-play">
                        <span>▶</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Video Player */}
            {currentLecture && (
              <div className="lecture-player">
                <h3>{currentLecture.title}</h3>
                {lectureLoading ? (
                  <div className="video-loading">Loading video...</div>
                ) : (
                  <div className="video-container">
                    <video
                      controls
                      className="lecture-video"
                      src={currentLecture.videoUrl}
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Upload Lecture Form Component
const UploadLectureForm = ({ onSubmit, onCancel, uploading }) => {
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    order: 0
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Lecture title is required'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long'
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters'
    }

    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = 'Video URL is required'
    } else if (!/^https?:\/\/.+/.test(formData.videoUrl.trim())) {
      newErrors.videoUrl = 'Please enter a valid URL starting with http:// or https://'
    }

    if (formData.order < 0) {
      newErrors.order = 'Order cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      setFormData({ title: '', videoUrl: '', order: 0 })
      setErrors({})
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="upload-form">
      <h3>Add New Lecture</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Lecture Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter lecture title"
            required
            disabled={uploading}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="videoUrl">Video URL *</label>
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="https://example.com/video.mp4"
            required
            disabled={uploading}
            className={errors.videoUrl ? 'error' : ''}
          />
          {errors.videoUrl && <span className="error-message">{errors.videoUrl}</span>}
          <small>Supported formats: MP4, WebM, OGV. You can use Google Drive, Dropbox, or direct video links.</small>
        </div>

        <div className="form-group">
          <label htmlFor="order">Order (Optional)</label>
          <input
            type="number"
            id="order"
            name="order"
            value={formData.order}
            onChange={handleChange}
            placeholder="0"
            min="0"
            disabled={uploading}
            className={errors.order ? 'error' : ''}
          />
          {errors.order && <span className="error-message">{errors.order}</span>}
          <small>Lower numbers appear first in the list</small>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={uploading || !formData.title.trim() || !formData.videoUrl.trim()}>
            {uploading ? 'Uploading...' : 'Upload Lecture'}
          </button>
          <button type="button" onClick={onCancel} disabled={uploading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default Lectures