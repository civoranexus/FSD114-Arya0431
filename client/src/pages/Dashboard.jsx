import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

const Dashboard = () => {
  const { user, logout } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  // Mock data for demonstration - in real app this would come from API
  const getUserStats = (role) => {
    switch (role) {
      case 'student':
        return {
          enrolledCourses: 3,
          completedCourses: 1,
          inProgressCourses: 2
        }
      case 'instructor':
        return {
          createdCourses: 5,
          totalStudents: 127,
          averageRating: 4.8
        }
      case 'admin':
        return {
          totalUsers: 1250,
          totalCourses: 45,
          activeUsers: 890
        }
      default:
        return {}
    }
  }

  const stats = getUserStats(user.role)

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
            <h2>My Courses</h2>
            <div className="courses-grid">
              <div className="course-card">
                <h3>Introduction to React</h3>
                <p>Learn the fundamentals of React.js</p>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '75%' }}></div>
                  </div>
                  <span>75% Complete</span>
                </div>
              </div>

              <div className="course-card">
                <h3>Node.js Fundamentals</h3>
                <p>Build server-side applications with Node.js</p>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '30%' }}></div>
                  </div>
                  <span>30% Complete</span>
                </div>
              </div>

              <div className="course-card">
                <h3>MongoDB Essentials</h3>
                <p>Master NoSQL database with MongoDB</p>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '100%' }}></div>
                  </div>
                  <span>Completed</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {user.role === 'instructor' && (
          <section className="instructor-section">
            <h2>Instructor Dashboard</h2>
            <div className="instructor-grid">
              <div className="action-card">
                <h3>Create New Course</h3>
                <p>Start building a new course for your students</p>
                <button className="action-btn">Create Course</button>
              </div>

              <div className="action-card">
                <h3>Manage Courses</h3>
                <p>Update and organize your existing courses</p>
                <button className="action-btn">Manage Courses</button>
              </div>

              <div className="action-card">
                <h3>Student Analytics</h3>
                <p>View student progress and performance</p>
                <button className="action-btn">View Analytics</button>
              </div>
            </div>
          </section>
        )}

        {user.role === 'admin' && (
          <section className="admin-section">
            <h2>Admin Dashboard</h2>
            <div className="admin-grid">
              <div className="action-card">
                <h3>User Management</h3>
                <p>Manage users, roles, and permissions</p>
                <button className="action-btn">Manage Users</button>
              </div>

              <div className="action-card">
                <h3>Course Oversight</h3>
                <p>Review and approve courses</p>
                <button className="action-btn">Review Courses</button>
              </div>

              <div className="action-card">
                <h3>System Analytics</h3>
                <p>View platform-wide statistics</p>
                <button className="action-btn">View Reports</button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default Dashboard
