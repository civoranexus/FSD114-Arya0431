import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI } from '../utils/api'
import './Dashboard.css'

const InstructorDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is authenticated and is an instructor
    if (!user) {
      navigate('/login?role=instructor')
      return
    }

    if (user.role !== 'instructor') {
      navigate('/dashboard')
      return
    }

    // Load instructor courses
    loadCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate])

  const loadCourses = async () => {
    if (!user || !user.id) return
    
    try {
      setLoading(true)
      setError(null)

      const response = await courseAPI.getCoursesByInstructor(user.id)
      setCourses(response.data.data || [])
    } catch (error) {
      console.error('Error loading courses:', error)
      setError('Failed to load courses. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading your courses...</div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <h2>Error Loading Courses</h2>
          <p>{error}</p>
          <button onClick={loadCourses} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Instructor Dashboard</h1>
          <p className="user-role">Welcome back, {user?.name}!</p>
        </div>
        <Link to="/instructor/course/create" className="create-course-link">
          Create New Course
        </Link>
      </div>

      <div className="dashboard-content">
        <section className="instructor-section">
          <div className="section-header">
            <h2>My Courses</h2>
            <span className="course-count">{courses.length} {courses.length === 1 ? 'course' : 'courses'}</span>
          </div>

          {courses.length === 0 ? (
            <div className="empty-state">
              <h3>No courses yet</h3>
              <p>You haven't created any courses. Start by creating your first course!</p>
              <Link to="/instructor/course/create" className="browse-btn">Create New Course</Link>
            </div>
          ) : (
            <div className="courses-list instructor-courses-list">
              {courses.map((course) => (
                <div key={course._id} className="course-card instructor-course-card">
                  <div className="course-thumbnail">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} />
                    ) : (
                      <div className="thumbnail-placeholder">
                        {course.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="course-info">
                    <div className="course-header">
                      <h3>{course.title}</h3>
                      <span className={`status-badge ${course.status}`}>
                        {course.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="course-description">{course.description}</p>
                    <div className="course-meta">
                      <span className="category">{course.category}</span>
                      <span className="level">{course.level}</span>
                      <span className="duration">{course.duration}h</span>
                      {course.totalStudents > 0 && (
                        <span className="students">{course.totalStudents} students</span>
                      )}
                    </div>
                    <div className="course-actions">
                      <Link to={`/courses/${course._id}`} className="continue-btn">
                        View Course
                      </Link>
                      <Link to={`/courses/${course._id}/edit`} className="lectures-btn">
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default InstructorDashboard
