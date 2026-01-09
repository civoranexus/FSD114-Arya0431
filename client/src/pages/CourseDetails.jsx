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
      } else if (error.response?.status === 403) {
        setError('Access denied. This course is not available.')
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
      const errorMessage = error.response?.data?.message || 'Failed to enroll in course. Please try again.'
      alert(errorMessage)
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
      const errorMessage = error.response?.data?.message || 'Failed to unenroll from course. Please try again.'
      alert(errorMessage)
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
          <Link to="/courses" className="back-link">← Back to Courses</Link>
          <div className="course-title-section">
            <span className="course-category">{getCategoryLabel(course.category)}</span>
            <h1 className="course-title">{course.title}</h1>
            <p className="course-subtitle">{course.description}</p>

            <div className="course-meta-header">
              <div className="instructor-info">
                <div className="instructor-avatar">
                  {course.instructor.avatar ? (
                    <img src={course.instructor.avatar} alt={course.instructor.name} />
                  ) : (
                    <span>{course.instructor.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="instructor-details">
                  <span className="instructor-name">Created by {course.instructor.name}</span>
                  <div className="course-stats">
                    <span className="stat-item">
                      <span className="stat-icon">👥</span>
                      {course.totalStudents} students
                    </span>
                    <span className="stat-item">
                      <span className="stat-icon">⭐</span>
                      {course.averageRating || 'N/A'}
                    </span>
                    <span className="stat-item">
                      <span className="stat-icon">⏱️</span>
                      {course.duration > 0 ? `${course.duration}h` : 'Self-paced'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Split Layout */}
        <div className="course-details-layout">
          {/* Main Content */}
          <div className="course-main-content">
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
              <h2>Course Content</h2>
              <div className="course-content-preview">
                <div className="content-stats">
                  <div className="content-stat">
                    <span className="stat-number">0</span>
                    <span className="stat-label">lectures</span>
                  </div>
                  <div className="content-stat">
                    <span className="stat-number">{course.duration > 0 ? `${course.duration}h` : 'N/A'}</span>
                    <span className="stat-label">total length</span>
                  </div>
                </div>
                <div className="expand-content">
                  <span>Expand all sections</span>
                  <span className="expand-icon">▼</span>
                </div>
              </div>
            </div>

            <div className="content-section">
              <h2>Requirements</h2>
              <ul className="requirements-list">
                <li>No prior experience required</li>
                <li>Access to a computer with internet</li>
                <li>Basic computer skills</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>Description</h2>
              <div className="detailed-description">
                <p>{course.description}</p>
                <p>This comprehensive course is designed to take you from beginner to proficient in {getCategoryLabel(course.category).toLowerCase()}. You'll learn through hands-on projects and real-world examples.</p>
              </div>
            </div>

            <div className="content-section">
              <h2>Instructor</h2>
              <div className="instructor-profile">
                <div className="instructor-header">
                  <div className="instructor-avatar-large">
                    {course.instructor.avatar ? (
                      <img src={course.instructor.avatar} alt={course.instructor.name} />
                    ) : (
                      <span>{course.instructor.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="instructor-info-large">
                    <h3>{course.instructor.name}</h3>
                    <p className="instructor-title">Course Instructor</p>
                  </div>
                </div>
                {course.instructor.bio && (
                  <p className="instructor-bio">{course.instructor.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="course-sidebar">
            <div className="enrollment-card">
              <div className="course-preview">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="course-preview-image" />
                ) : (
                  <div className="course-preview-placeholder">
                    <span>{course.title.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>

              <div className="enrollment-content">
                <div className="price-section">
                  {course.price === 0 ? (
                    <div className="price free">Free</div>
                  ) : (
                    <div className="price">${course.price}</div>
                  )}
                </div>

                {/* Enrollment Button */}
                {user?.role === 'student' ? (
                  isEnrolled ? (
                    <div className="enrollment-actions">
                      <div className="enrollment-status">
                        <span className="enrolled-badge">✓ Enrolled</span>
                      </div>
                      <Link to={`/courses/${course._id}/lectures`} className="view-lectures-btn">
                        📚 View Lectures
                      </Link>
                      <button
                        className="unenroll-btn"
                        onClick={handleUnenroll}
                        disabled={enrolling}
                      >
                        {enrolling ? 'Processing...' : 'Unenroll'}
                      </button>
                    </div>
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
                      <Link to={`/courses/${course._id}/lectures`} className="manage-lectures-btn">
                        📹 Manage Lectures
                      </Link>
                      <Link to={`/courses/${course._id}/edit`} className="edit-course-btn">
                        Edit Course
                      </Link>
                    </div>
                  ) : (
                    <div className="not-instructor">
                      <p>Course by another instructor</p>
                    </div>
                  )
                ) : (
                  <div className="login-required">
                    <p><Link to="/login">Login</Link> to enroll</p>
                  </div>
                )}

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

                <div className="course-details-sidebar">
                  <div className="detail-row">
                    <span className="detail-label">Level</span>
                    <span className="detail-value">{course.level.charAt(0).toUpperCase() + course.level.slice(1)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Duration</span>
                    <span className="detail-value">{course.duration > 0 ? `${course.duration}h` : 'Self-paced'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Language</span>
                    <span className="detail-value">English</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetails
