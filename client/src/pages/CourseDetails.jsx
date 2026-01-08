import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI } from '../utils/api'
import './CourseDetails.css'

const CourseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    fetchCourse()
  }, [id])

  useEffect(() => {
    if (course && user) {
      setIsEnrolled(course.enrolledStudents?.some(student => student._id === user.id) || false)
    }
  }, [course, user])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await courseAPI.getCourse(id)
      setCourse(response.data.data)
    } catch (error) {
      console.error('Error fetching course:', error)
      if (error.response?.status === 404) {
        setError('Course not found')
      } else {
        setError('Failed to load course details')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setEnrolling(true)
      await courseAPI.enrollCourse(course._id)
      setIsEnrolled(true)
      // Refresh course data to update enrollment count
      fetchCourse()
    } catch (error) {
      console.error('Error enrolling in course:', error)
      alert('Failed to enroll in course. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  const handleUnenroll = async () => {
    try {
      setEnrolling(true)
      await courseAPI.unenrollCourse(course._id)
      setIsEnrolled(false)
      // Refresh course data to update enrollment count
      fetchCourse()
    } catch (error) {
      console.error('Error unenrolling from course:', error)
      alert('Failed to unenroll from course. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  const getCategoryLabel = (category) => {
    const categories = {
      'web-development': 'Web Development',
      'data-science': 'Data Science',
      'mobile-development': 'Mobile Development',
      'design': 'Design',
      'marketing': 'Marketing',
      'business': 'Business',
      'other': 'Other'
    }
    return categories[category] || category
  }

  if (loading) {
    return (
      <div className="course-details-page">
        <div className="container">
          <div className="loading">Loading course details...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="course-details-page">
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
      <div className="course-details-page">
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
    <div className="course-details-page">
      <div className="container">
        {/* Course Header */}
        <div className="course-header">
          <div className="course-header-content">
            <div className="course-category-badge">
              {getCategoryLabel(course.category)}
            </div>
            <h1 className="course-title">{course.title}</h1>
            <p className="course-subtitle">{course.description}</p>

            <div className="course-meta">
              <div className="instructor-info">
                <div className="instructor-avatar">
                  {course.instructor.avatar ? (
                    <img src={course.instructor.avatar} alt={course.instructor.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {course.instructor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="instructor-name">Created by {course.instructor.name}</p>
                  {course.instructor.bio && (
                    <p className="instructor-bio">{course.instructor.bio}</p>
                  )}
                </div>
              </div>

              <div className="course-stats">
                <div className="stat">
                  <span className="stat-value">{course.totalStudents}</span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {course.averageRating > 0 ? course.averageRating : 'N/A'}
                  </span>
                  <span className="stat-label">Rating</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {course.duration > 0 ? `${course.duration}h` : 'Self-paced'}
                  </span>
                  <span className="stat-label">Duration</span>
                </div>
              </div>
            </div>
          </div>

          <div className="course-sidebar">
            <div className="course-card">
              <div className="course-price-section">
                {course.price === 0 ? (
                  <div className="price free">Free</div>
                ) : (
                  <div className="price">${course.price}</div>
                )}
              </div>

              <div className="course-features">
                <div className="feature">
                  <span className="feature-icon">📚</span>
                  <span>Full lifetime access</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">📱</span>
                  <span>Access on mobile and desktop</span>
                </div>
                <div className="feature">
                  <span className="feature-icon">🏆</span>
                  <span>Certificate of completion</span>
                </div>
              </div>

              {/* Enrollment Button */}
              {user?.role === 'student' ? (
                isEnrolled ? (
                  <button
                    className="enroll-btn enrolled"
                    onClick={handleUnenroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Processing...' : 'Enrolled - Click to Unenroll'}
                  </button>
                ) : (
                  <button
                    className="enroll-btn"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )
              ) : user?.role === 'instructor' ? (
                course.instructor._id === user.id ? (
                  <div className="instructor-actions">
                    <Link to={`/courses/${course._id}/edit`} className="edit-btn">
                      Edit Course
                    </Link>
                  </div>
                ) : (
                  <div className="not-available">
                    <p>Course created by another instructor</p>
                  </div>
                )
              ) : (
                <div className="login-required">
                  <p><Link to="/login">Login</Link> as a student to enroll</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="course-content">
          <div className="content-section">
            <h2>About This Course</h2>
            <div className="course-description">
              <p>{course.description}</p>
            </div>
          </div>

          <div className="content-section">
            <h2>What You'll Learn</h2>
            <div className="learning-objectives">
              <p>This course covers comprehensive topics in {getCategoryLabel(course.category).toLowerCase()}.</p>
              <p>By the end of this course, you'll have gained valuable skills and knowledge in this field.</p>
            </div>
          </div>

          <div className="content-section">
            <h2>Course Details</h2>
            <div className="course-details-grid">
              <div className="detail-item">
                <strong>Level:</strong> {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </div>
              <div className="detail-item">
                <strong>Duration:</strong> {course.duration > 0 ? `${course.duration} hours` : 'Self-paced'}
              </div>
              <div className="detail-item">
                <strong>Language:</strong> English
              </div>
              <div className="detail-item">
                <strong>Last Updated:</strong> {new Date(course.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {course.tags && course.tags.length > 0 && (
            <div className="content-section">
              <h2>Tags</h2>
              <div className="course-tags">
                {course.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseDetails
