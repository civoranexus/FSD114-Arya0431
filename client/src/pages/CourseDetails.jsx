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
            {/* Course Highlights */}
            <div className="content-section highlights-section">
              <div className="course-highlights">
                <div className="highlight-item">
                  <span className="highlight-icon">📊</span>
                  <span>{course.totalStudents || 0} students enrolled</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">⭐</span>
                  <span>{course.averageRating || 'N/A'} rating</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">⏱️</span>
                  <span>{course.duration || 0} hours of content</span>
                </div>
                <div className="highlight-item">
                  <span className="highlight-icon">📚</span>
                  <span>{course.totalLectures || 0} lectures</span>
                </div>
              </div>
            </div>

            {/* Course Description */}
            <div className="content-section">
              <h2>Description</h2>
              <div className="course-description">
                <p>{course.description}</p>
                <p>This comprehensive {course.level} course is designed to take you from {course.level === 'beginner' ? 'novice to proficient' : 'intermediate to expert'} in {getCategoryLabel(course.category).toLowerCase()}. You'll learn through practical examples and hands-on projects that prepare you for real-world applications.</p>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="content-section">
              <h2>What you'll learn</h2>
              <div className="learning-outcomes">
                <div className="outcome-item">
                  <span className="outcome-check">✓</span>
                  <span>Master {getCategoryLabel(course.category).toLowerCase()} fundamentals</span>
                </div>
                <div className="outcome-item">
                  <span className="outcome-check">✓</span>
                  <span>Build real-world projects and applications</span>
                </div>
                <div className="outcome-item">
                  <span className="outcome-check">✓</span>
                  <span>Gain industry-relevant skills</span>
                </div>
                <div className="outcome-item">
                  <span className="outcome-check">✓</span>
                  <span>Earn a certificate upon completion</span>
                </div>
              </div>
            </div>

            {/* Course Curriculum Accordion */}
            <div className="content-section">
              <h2>Course content</h2>
              <div className="curriculum-header">
                <span className="curriculum-stats">
                  {course.totalLectures || 0} lectures • {course.duration || 0} total hours
                </span>
                <span className="expand-all">Expand all sections</span>
              </div>
              <div className="curriculum-accordion">
                <div className="curriculum-section">
                  <div className="section-header">
                    <div className="section-info">
                      <h4>Section 1: Getting Started</h4>
                      <span className="section-duration">2 lectures • 30min</span>
                    </div>
                    <button className="expand-btn">▼</button>
                  </div>
                  <div className="section-content">
                    <div className="lecture-item">
                      <div className="lecture-info">
                        <span className="lecture-number">1.</span>
                        <span className="lecture-title">Course Introduction</span>
                      </div>
                      <span className="lecture-duration">10:30</span>
                    </div>
                    <div className="lecture-item">
                      <div className="lecture-info">
                        <span className="lecture-number">2.</span>
                        <span className="lecture-title">Setting Up Your Environment</span>
                      </div>
                      <span className="lecture-duration">20:15</span>
                    </div>
                  </div>
                </div>
                <div className="curriculum-section">
                  <div className="section-header">
                    <div className="section-info">
                      <h4>Section 2: Core Concepts</h4>
                      <span className="section-duration">5 lectures • 2h 15min</span>
                    </div>
                    <button className="expand-btn">▶</button>
                  </div>
                </div>
                <div className="curriculum-section">
                  <div className="section-header">
                    <div className="section-info">
                      <h4>Section 3: Building Projects</h4>
                      <span className="section-duration">8 lectures • 3h 45min</span>
                    </div>
                    <button className="expand-btn">▶</button>
                  </div>
                </div>
              </div>
              {(isEnrolled || isCourseInstructor || isCourseAdmin) && (
                <div className="view-full-curriculum">
                  <Link to={`/courses/${course._id}/lectures`} className="view-lectures-link">
                    View full curriculum and start learning
                  </Link>
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="content-section">
              <h2>Requirements</h2>
              <ul className="requirements-list">
                <li>Basic computer skills</li>
                <li>Internet connection</li>
                <li>No prior experience needed for beginner level</li>
                <li>Some programming knowledge recommended for intermediate/advanced</li>
              </ul>
            </div>

            {/* Instructor Profile */}
            <div className="content-section">
              <h2>Your instructor</h2>
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
                    <div className="instructor-meta">
                      <span className="instructor-rating">⭐ 4.8 Instructor Rating</span>
                      <span className="instructor-students">📚 50,000+ Students</span>
                      <span className="instructor-courses">📖 12 Courses</span>
                    </div>
                  </div>
                </div>
                <div className="instructor-bio">
                  <p>{course.instructor.bio || 'Experienced instructor with a passion for teaching and helping students achieve their goals in technology and development.'}</p>
                  <div className="instructor-stats">
                    <div className="stat">
                      <span className="stat-number">12+</span>
                      <span className="stat-label">Years of experience</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">50K+</span>
                      <span className="stat-label">Students taught</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">4.8</span>
                      <span className="stat-label">Average rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Enrollment Sidebar */}
          <div className="course-sidebar">
            <div className="enrollment-card">
              {/* Course Rating Summary */}
              <div className="course-rating-summary">
                <div className="rating-display">
                  <span className="rating-number">{course.averageRating || '4.5'}</span>
                  <div className="rating-stars">⭐⭐⭐⭐⭐</div>
                  <span className="rating-count">({course.totalRatings || 0} ratings)</span>
                </div>
                <div className="enrollment-count">
                  <span className="enrollment-number">{course.totalStudents || 0}</span>
                  <span className="enrollment-label">students enrolled</span>
                </div>
              </div>

              {/* Price and Enrollment */}
              <div className="enrollment-section">
                <div className="price-display">
                  {course.price === 0 ? (
                    <div className="price-free">Free</div>
                  ) : (
                    <div className="price-amount">${course.price}</div>
                  )}
                </div>

                {/* Primary CTA */}
                {user?.role === 'student' ? (
                  isEnrolled ? (
                    <Link to={`/courses/${course._id}/lectures`} className="cta-button primary">
                      Continue Learning
                    </Link>
                  ) : (
                    <button
                      className="cta-button primary"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )
                ) : user?.role === 'instructor' ? (
                  course.instructor._id === user.id ? (
                    <Link to={`/courses/${course._id}/lectures`} className="cta-button secondary">
                      Manage Course
                    </Link>
                  ) : (
                    <div className="cta-placeholder">Instructor Preview</div>
                  )
                ) : (
                  <Link to="/login" className="cta-button primary">
                    Login to Enroll
                  </Link>
                )}

                {/* Money Back Guarantee */}
                <div className="guarantee">
                  <span className="guarantee-icon">🛡️</span>
                  <span className="guarantee-text">30-day money-back guarantee</span>
                </div>
              </div>

              {/* Course Includes */}
              <div className="course-includes">
                <h4>This course includes:</h4>
                <ul className="includes-list">
                  <li>
                    <span className="include-icon">📹</span>
                    <span>{course.duration || 0} hours on-demand video</span>
                  </li>
                  <li>
                    <span className="include-icon">📄</span>
                    <span>{course.totalLectures || 0} downloadable resources</span>
                  </li>
                  <li>
                    <span className="include-icon">📱</span>
                    <span>Access on mobile and TV</span>
                  </li>
                  <li>
                    <span className="include-icon">🏆</span>
                    <span>Certificate of completion</span>
                  </li>
                  <li>
                    <span className="include-icon">♾️</span>
                    <span>Full lifetime access</span>
                  </li>
                </ul>
              </div>

              {/* Quick Course Details */}
              <div className="course-details-summary">
                <div className="detail-item">
                  <span className="detail-label">Level</span>
                  <span className="detail-value">{course.level?.charAt(0).toUpperCase() + course.level?.slice(1) || 'All Levels'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{course.duration ? `${course.duration} total hours` : 'Self-paced'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Language</span>
                  <span className="detail-value">English</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last updated</span>
                  <span className="detail-value">{new Date(course.updatedAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Share Course */}
              <div className="share-section">
                <button className="share-button">
                  <span className="share-icon">📤</span>
                  <span>Share this course</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetails
