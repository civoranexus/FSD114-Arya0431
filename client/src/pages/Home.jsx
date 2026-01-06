import './Home.css'

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-container">
          <h1>Welcome to EduVillage</h1>
          <p>Your gateway to quality online education</p>
          <div className="hero-buttons">
            <button className="btn-primary">Get Started</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose EduVillage?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Expert Instructors</h3>
              <p>Learn from industry experts with years of experience</p>
            </div>
            <div className="feature-card">
              <h3>Flexible Learning</h3>
              <p>Study at your own pace with 24/7 access to courses</p>
            </div>
            <div className="feature-card">
              <h3>Interactive Content</h3>
              <p>Engage with multimedia content and hands-on projects</p>
            </div>
            <div className="feature-card">
              <h3>Certification</h3>
              <p>Earn recognized certificates upon course completion</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
