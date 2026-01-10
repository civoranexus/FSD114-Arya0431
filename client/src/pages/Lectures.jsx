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
      {/* Access Check */}
      {!canAccessLectures() && (
        <div className="access-denied-overlay">
          <div className="access-denied-content">
            <h3>Access Restricted</h3>
            <p>You must be enrolled in this course to access the lectures.</p>
            {user?.role === 'student' && (
              <Link to={`/courses/${courseId}`} className="enroll-link">
                Enroll Now
              </Link>
            )}
            <Link to="/courses" className="back-link">← Back to Courses</Link>
          </div>
        </div>
      )}

      {canAccessLectures() && (
        <>
          {/* Minimal Header */}
          <div className="learning-header">
            <Link to={`/courses/${courseId}`} className="back-link">
              ← Course Details
            </Link>
            <div className="header-content">
              <div className="course-info">
                <h1>{course.title}</h1>
                <div className="course-meta">
                  <span>{lectures.length} lectures</span>
                  <span>•</span>
                  <span>{course.duration > 0 ? `${course.duration}h total` : 'Self-paced'}</span>
                </div>
              </div>
              <div className="progress-indicator">
                <span className="progress-text">0% complete</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Player Section */}
          <div className="video-section">
            {currentLecture ? (
              <div className="video-player-container">
                <div className="video-info">
                  <h2>{currentLecture.title}</h2>
                  <div className="lecture-meta">
                    <span>Lecture {lectures.findIndex(l => l._id === currentLecture._id) + 1} of {lectures.length}</span>
                  </div>
                </div>
                {lectureLoading ? (
                  <div className="video-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading video...</p>
                  </div>
                ) : (
                  <div className="video-wrapper">
                    <video
                      controls
                      className="lecture-video"
                      src={currentLecture.videoUrl}
                      preload="metadata"
                      poster="/api/placeholder/800/450"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            ) : (
              <div className="video-placeholder">
                <div className="placeholder-content">
                  <div className="play-icon-large">▶</div>
                  <h3>Select a lecture to start watching</h3>
                  <p>Choose from {lectures.length} lectures available in this course</p>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Lectures Sidebar */}
          <div className="lectures-sidebar">
            {/* Course Progress */}
            <div className="course-progress">
              <div className="progress-header">
                <h3>Your progress</h3>
                <span className="progress-percentage">0% complete</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '0%' }}></div>
              </div>
              <p className="progress-text">0 of {lectures.length} lectures completed</p>
            </div>

            {/* Course Navigation */}
            <div className="course-navigation">
              <div className="nav-header">
                <h2>Course content</h2>
                <span className="lecture-count">{lectures.length} lectures</span>
              </div>

              {/* Curriculum Sections */}
              <div className="curriculum-sections">
                <div className="section-block">
                  <div className="section-header">
                    <h4>Section 1: Getting Started</h4>
                    <span className="section-meta">2 lectures • 30min</span>
                  </div>
                  <div className="section-lectures">
                    {lectures.slice(0, 2).map((lecture, index) => (
                      <div
                        key={lecture._id}
                        className={`lecture-nav-item ${currentLecture?._id === lecture._id ? 'active' : ''} ${index === 0 ? 'completed' : ''}`}
                        onClick={() => handleLectureClick(lecture)}
                      >
                        <div className="lecture-status">
                          {index === 0 ? '✓' : '○'}
                        </div>
                        <div className="lecture-content">
                          <h5>{lecture.title}</h5>
                          <span className="lecture-duration">10:30</span>
                        </div>
                        <div className="lecture-play">
                          {currentLecture?._id === lecture._id ? '▶' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="section-block">
                  <div className="section-header">
                    <h4>Section 2: Core Concepts</h4>
                    <span className="section-meta">3 lectures • 2h 15min</span>
                  </div>
                  <div className="section-lectures">
                    {lectures.slice(2, 5).map((lecture, index) => (
                      <div
                        key={lecture._id}
                        className={`lecture-nav-item ${currentLecture?._id === lecture._id ? 'active' : ''}`}
                        onClick={() => handleLectureClick(lecture)}
                      >
                        <div className="lecture-status">○</div>
                        <div className="lecture-content">
                          <h5>{lecture.title}</h5>
                          <span className="lecture-duration">25:45</span>
                        </div>
                        <div className="lecture-play">
                          {currentLecture?._id === lecture._id ? '▶' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Show remaining lectures */}
                {lectures.length > 5 && (
                  <div className="section-block">
                    <div className="section-header">
                      <h4>Section 3: Advanced Topics</h4>
                      <span className="section-meta">{lectures.length - 5} lectures • 1h 45min</span>
                    </div>
                    <div className="section-lectures">
                      {lectures.slice(5).map((lecture, index) => (
                        <div
                          key={lecture._id}
                          className={`lecture-nav-item ${currentLecture?._id === lecture._id ? 'active' : ''}`}
                          onClick={() => handleLectureClick(lecture)}
                        >
                          <div className="lecture-status">○</div>
                          <div className="lecture-content">
                            <h5>{lecture.title}</h5>
                            <span className="lecture-duration">15:20</span>
                          </div>
                          <div className="lecture-play">
                            {currentLecture?._id === lecture._id ? '▶' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show all lectures if less than 5 */}
                {lectures.length <= 5 && lectures.length > 2 && (
                  <div className="section-block">
                    <div className="section-header">
                      <h4>Section 3: Advanced Topics</h4>
                      <span className="section-meta">{lectures.length - 2} lectures • 45min</span>
                    </div>
                    <div className="section-lectures">
                      {lectures.slice(2).map((lecture, index) => (
                        <div
                          key={lecture._id}
                          className={`lecture-nav-item ${currentLecture?._id === lecture._id ? 'active' : ''}`}
                          onClick={() => handleLectureClick(lecture)}
                        >
                          <div className="lecture-status">○</div>
                          <div className="lecture-content">
                            <h5>{lecture.title}</h5>
                            <span className="lecture-duration">15:20</span>
                          </div>
                          <div className="lecture-play">
                            {currentLecture?._id === lecture._id ? '▶' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructor Actions */}
            {canUploadLectures() && (
              <div className="instructor-panel">
                <button
                  className="upload-btn"
                  onClick={() => setShowUploadForm(!showUploadForm)}
                >
                  {showUploadForm ? 'Cancel Add Lecture' : '+ Add New Lecture'}
                </button>

                {showUploadForm && (
                  <UploadLectureForm
                    onSubmit={handleUploadLecture}
                    onCancel={() => setShowUploadForm(false)}
                    uploading={uploading}
                  />
                )}
              </div>
            )}
          </div>
        </>
      )}
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