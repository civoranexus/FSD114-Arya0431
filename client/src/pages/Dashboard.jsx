import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI } from '../utils/api'
import './Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({})
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [createdCourses, setCreatedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (user.role === 'student') {
        // Load enrolled courses for students
        const response = await courseAPI.getEnrolledCourses()
        const courses = response.data.data
        setEnrolledCourses(courses)

        setStats({
          enrolledCourses: courses.length,
          completedCourses: courses.filter(course => course.status === 'completed').length,
          inProgressCourses: courses.filter(course => course.status === 'in-progress').length
        })
      } else if (user.role === 'instructor') {
        // Load created courses for instructors
        const response = await courseAPI.getCoursesByInstructor(user.id)
        const courses = response.data.data
        setCreatedCourses(courses)

        // Calculate total students across all courses
        const totalStudents = courses.reduce((sum, course) => sum + (course.totalStudents || 0), 0)
        const averageRating = courses.length > 0
          ? courses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / courses.length
          : 0

        setStats({
          createdCourses: courses.length,
          totalStudents,
          averageRating: averageRating.toFixed(1)
        })
      } else if (user.role === 'admin') {
        // Mock admin stats (could be real API calls)
        setStats({
          totalUsers: 1250,
          totalCourses: 45,
          activeUsers: 890
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading your dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button onClick={loadDashboardData} className="retry-btn">
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
          <h1>Welcome back, {user.name}!</h1>
          <p className="user-role">Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="dashboard-stats">
        {user.role === 'student' && (
          <>
            <div className="stat-card">
              <h3>{stats.enrolledCourses}</h3>
              <p>Enrolled Courses</p>
            </div>
            <div className="stat-card">
              <h3>{stats.completedCourses}</h3>
              <p>Completed Courses</p>
            </div>
            <div className="stat-card">
              <h3>{stats.inProgressCourses}</h3>
              <p>In Progress</p>
            </div>
          </>
        )}

        {user.role === 'instructor' && (
          <>
            <div className="stat-card">
              <h3>{stats.createdCourses}</h3>
              <p>Courses Created</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalStudents}</h3>
              <p>Total Students</p>
            </div>
            <div className="stat-card">
              <h3>{stats.averageRating}</h3>
              <p>Average Rating</p>
            </div>
          </>
        )}

        {user.role === 'admin' && (
          <>
            <div className="stat-card">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalCourses}</h3>
              <p>Total Courses</p>
            </div>
            <div className="stat-card">
              <h3>{stats.activeUsers}</h3>
              <p>Active Users</p>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-content">
        {user.role === 'student' && (
          <section className="recent-courses">
            <div className="section-header">
              <h2>My Courses</h2>
              <Link to="/courses" className="view-all-link">View All Courses</Link>
            </div>
            <div className="courses-grid">
              {enrolledCourses.length === 0 ? (
                <div className="empty-state">
                  <h3>No courses yet</h3>
                  <p>You haven't enrolled in any courses. Browse available courses to get started!</p>
                  <Link to="/courses" className="browse-btn">Browse Courses</Link>
                </div>
              ) : (
                enrolledCourses.slice(0, 3).map((course) => (
                  <div key={course._id} className="course-card">
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
                      <h3>{course.title}</h3>
                      <p className="course-instructor">by {course.instructor.name}</p>
                      <div className="course-meta">
                        <span className="level">{course.level}</span>
                        <span className="duration">{course.duration}h</span>
                      </div>
                      <div className="course-actions">
                        <Link to={`/courses/${course._id}`} className="continue-btn">
                          Continue Learning
                        </Link>
                        {course.enrolledStudents?.some(student => student._id === user.id) && (
                          <Link to={`/courses/${course._id}/lectures`} className="lectures-btn">
                            View Lectures
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {user.role === 'instructor' && (
          <section className="instructor-section">
            <div className="section-header">
              <h2>Instructor Dashboard</h2>
              <Link to="/courses/create" className="create-course-link">Create New Course</Link>
            </div>
            <div className="instructor-grid">
              <div className="action-card">
                <h3>Create New Course</h3>
                <p>Start building a new course for your students</p>
                <Link to="/courses/create" className="action-btn">Create Course</Link>
              </div>

              <div className="action-card">
                <h3>Manage Courses</h3>
                <p>Update and organize your existing courses</p>
                <div className="courses-list">
                  {createdCourses.slice(0, 3).map((course) => (
                    <div key={course._id} className="mini-course-item">
                      <span className="course-title">{course.title}</span>
                      <span className={`status-badge ${course.status}`}>
                        {course.status}
                      </span>
                      <Link to={`/courses/${course._id}`} className="edit-link">Edit</Link>
                    </div>
                  ))}
                  {createdCourses.length > 3 && (
                    <Link to={`/courses?instructor=${user.id}`} className="view-all-link">
                      View all {createdCourses.length} courses →
                    </Link>
                  )}
                </div>
              </div>

              <div className="action-card">
                <h3>Recent Activity</h3>
                <p>Track your course performance and student engagement</p>
                <div className="activity-stats">
                  <div className="activity-item">
                    <span className="activity-label">Published Courses:</span>
                    <span className="activity-value">
                      {createdCourses.filter(c => c.status === 'published').length}
                    </span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-label">Draft Courses:</span>
                    <span className="activity-value">
                      {createdCourses.filter(c => c.status === 'draft').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {user.role === 'admin' && (
          <section className="admin-section">
            <div className="section-header">
              <h2>Admin Dashboard</h2>
            </div>
            <div className="admin-grid">
              <div className="action-card">
                <h3>Platform Overview</h3>
                <p>Monitor overall platform health and performance</p>
                <div className="admin-stats">
                  <div className="admin-stat">
                    <span className="stat-number">{stats.totalUsers}</span>
                    <span className="stat-label">Total Users</span>
                  </div>
                  <div className="admin-stat">
                    <span className="stat-number">{stats.totalCourses}</span>
                    <span className="stat-label">Total Courses</span>
                  </div>
                  <div className="admin-stat">
                    <span className="stat-number">{stats.activeUsers}</span>
                    <span className="stat-label">Active Users</span>
                  </div>
                </div>
              </div>

              <div className="action-card">
                <h3>Content Management</h3>
                <p>Review courses, manage categories, and moderate content</p>
                <div className="admin-actions">
                  <Link to="/courses" className="admin-action-btn">Review Courses</Link>
                  <Link to="/admin/users" className="admin-action-btn secondary">Manage Users</Link>
                </div>
              </div>

              <div className="action-card">
                <h3>System Health</h3>
                <p>Monitor system performance and troubleshoot issues</p>
                <div className="system-status">
                  <div className="status-item">
                    <span className="status-dot healthy"></span>
                    <span>Database: Connected</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot healthy"></span>
                    <span>API: Operational</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot healthy"></span>
                    <span>File Storage: Active</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default Dashboard
