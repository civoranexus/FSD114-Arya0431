import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI } from '../utils/api'
import './Dashboard.css'
import './CreateCourse.css'

const InstructorCourseManage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('curriculum')

  useEffect(() => {
    // Check if user is authenticated and is an instructor
    if (!user) {
      navigate('/login?role=instructor')
      return
    }

    if (user.role !== 'instructor') {
      navigate('/instructor/dashboard')
      return
    }

    // Load course data
    loadCourse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, id])

  const loadCourse = async () => {
    if (!id || !user) return
    
    try {
      setLoading(true)
      setError(null)

      const response = await courseAPI.getCourse(id)
      const courseData = response.data.data

      // Verify that the course belongs to this instructor
      const instructorId = courseData.instructor._id || courseData.instructor
      if (instructorId.toString() !== user.id && user.role !== 'admin') {
        setError('You do not have permission to manage this course.')
        setLoading(false)
        return
      }

      setCourse(courseData)
    } catch (error) {
      console.error('Error loading course:', error)
      if (error.response?.status === 404) {
        setError('Course not found.')
      } else if (error.response?.status === 403) {
        setError('You do not have permission to access this course.')
      } else {
        setError(error.response?.data?.message || 'Failed to load course. Please refresh the page.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading course...</div>
      </div>
    )
  }

  // Only show full error screen if course failed to load initially
  if (loading === false && !course && error) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <h2>Error Loading Course</h2>
          <p>{error}</p>
          <button onClick={loadCourse} className="retry-btn">
            Try Again
          </button>
          <Link to="/instructor/dashboard" className="retry-btn" style={{ marginLeft: '1rem', display: 'inline-block', textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Show not found if no course after loading
  if (loading === false && !course && !error) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <h2>Course Not Found</h2>
          <p>The course you're looking for doesn't exist.</p>
          <Link to="/instructor/dashboard" className="retry-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Don't render main content if course hasn't loaded yet
  if (!course) {
    return null
  }

  const tabs = [
    { id: 'curriculum', label: 'Curriculum', icon: '📚' },
    { id: 'pricing', label: 'Pricing', icon: '💰' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'publish', label: 'Publish', icon: '🚀' }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Manage Course</h1>
          <p className="user-role" style={{ marginTop: '0.5rem' }}>
            {course.title}
            <span className={`status-badge ${course.status}`} style={{ marginLeft: '1rem' }}>
              {course.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </p>
        </div>
        <Link to="/instructor/dashboard" className="create-course-link">
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="error-message" style={{ marginTop: '1rem' }}>
          {error}
        </div>
      )}

      <div className="dashboard-content">
        {/* Tabs Navigation */}
        <div style={{
          borderBottom: '2px solid #e9ecef',
          marginBottom: '2rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === tab.id ? '3px solid #5624d0' : '3px solid transparent',
                color: activeTab === tab.id ? '#5624d0' : '#6c757d',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="action-card" style={{ textAlign: 'left', minHeight: '400px' }}>
          {activeTab === 'curriculum' && (
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>Curriculum</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Manage your course lectures and content structure.
              </p>
              <Link
                to={`/courses/${course._id}/lectures`}
                className="action-btn"
                style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                  background: '#5624d0',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  marginTop: '1rem'
                }}
              >
                Manage Lectures
              </Link>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>Pricing</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Set the price for your course. You can offer it for free or set a price.
              </p>
              <div style={{
                padding: '1.5rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginTop: '1rem'
              }}>
                <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                  Pricing management will be implemented here.
                </p>
                <p style={{ color: '#6c757d', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Current price: <strong>${course.price || 0}</strong>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>Settings</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Configure course settings and preferences.
              </p>
              <div style={{
                padding: '1.5rem',
                background: '#f8f9fa',
                borderRadius: '8px',
                marginTop: '1rem'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#333', display: 'block', marginBottom: '0.5rem' }}>Category:</strong>
                  <span style={{ color: '#666' }}>{course.category}</span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#333', display: 'block', marginBottom: '0.5rem' }}>Level:</strong>
                  <span style={{ color: '#666' }}>{course.level}</span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#333', display: 'block', marginBottom: '0.5rem' }}>Duration:</strong>
                  <span style={{ color: '#666' }}>{course.duration || 0} hours</span>
                </div>
                <p style={{ color: '#6c757d', fontSize: '0.9rem', marginTop: '1rem' }}>
                  Course settings management will be implemented here.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'publish' && (
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>Publish Course</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                {course.status === 'published'
                  ? 'Your course is currently published and visible to all students.'
                  : 'Publish your course to make it available to students.'}
              </p>
              <div style={{
                padding: '1.5rem',
                background: course.status === 'published' ? '#d4edda' : '#fff3cd',
                borderRadius: '8px',
                marginTop: '1rem',
                border: `1px solid ${course.status === 'published' ? '#c3e6cb' : '#ffc107'}`
              }}>
                <p style={{ 
                  color: course.status === 'published' ? '#155724' : '#856404',
                  fontWeight: 500,
                  marginBottom: '1rem'
                }}>
                  Status: <strong>{course.status === 'published' ? 'Published' : 'Draft'}</strong>
                </p>
                <p style={{ 
                  color: course.status === 'published' ? '#155724' : '#856404',
                  fontSize: '0.9rem'
                }}>
                  {course.status === 'published'
                    ? 'Your course is live and visible to students. You can unpublish it to make it a draft again.'
                    : 'Once published, your course will be visible to all students and they can enroll in it.'}
                </p>
              </div>
              <Link
                to={`/instructor/course/${course._id}`}
                className="action-btn"
                style={{
                  display: 'inline-block',
                  textDecoration: 'none',
                  background: course.status === 'published' ? '#6c757d' : '#28a745',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  marginTop: '1.5rem'
                }}
              >
                {course.status === 'published' ? 'Manage Publishing' : 'Publish Course'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InstructorCourseManage
