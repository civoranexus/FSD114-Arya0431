import './Dashboard.css'

const Dashboard = () => {
  // TODO: Get user data from context/auth state
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    enrolledCourses: 3,
    completedCourses: 1
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}!</h1>
        <p>Continue your learning journey</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{user.enrolledCourses}</h3>
          <p>Enrolled Courses</p>
        </div>
        <div className="stat-card">
          <h3>{user.completedCourses}</h3>
          <p>Completed Courses</p>
        </div>
        <div className="stat-card">
          <h3>{user.enrolledCourses - user.completedCourses}</h3>
          <p>In Progress</p>
        </div>
      </div>

      <div className="dashboard-content">
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
      </div>
    </div>
  )
}

export default Dashboard
