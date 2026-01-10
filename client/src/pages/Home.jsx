import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI } from '../utils/api'
import './Home.css'

const Home = () => {
  const { user } = useAuth()
  const [trendingCourses, setTrendingCourses] = useState([])
  const [popularCategories, setPopularCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      // Fetch trending courses (popular sort)
      const trendingResponse = await courseAPI.getCourses({
        sort: 'popular',
        limit: 8
      })
      setTrendingCourses(trendingResponse.data.data)

      // Fetch categories (mock data for now since we don't have this API)
      setPopularCategories([
        { name: 'Development', count: 12450, path: '/courses?category=web-development' },
        { name: 'Business', count: 11890, path: '/courses?category=business' },
        { name: 'IT & Software', count: 8320, path: '/courses?category=other' },
        { name: 'Design', count: 9750, path: '/courses?category=design' },
        { name: 'Marketing', count: 7230, path: '/courses?category=marketing' },
        { name: 'Personal Development', count: 15670, path: '/courses?category=other' }
      ])
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">
      {/* Platform Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Learn from 500+ expert instructors</h1>
              <p className="hero-subtitle">
                Master new skills with courses in technology, business, design, and more.
                Start learning today.
              </p>
              <div className="hero-actions">
                <Link to="/courses" className="btn-primary-large">Browse Courses</Link>
                {!user && <Link to="/register" className="btn-secondary-large">Join for Free</Link>}
              </div>
            </div>
            <div className="hero-visual">
              <div className="course-preview-grid">
                {trendingCourses.slice(0, 3).map((course, index) => (
                  <div key={course._id} className={`preview-card card-${index + 1}`}>
                    <div className="preview-thumbnail">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} />
                      ) : (
                        <div className="thumbnail-placeholder">
                          <span>{course.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="preview-content">
                      <h4>{course.title}</h4>
                      <p>{course.instructor.name}</p>
                      <div className="preview-meta">
                        <span>⭐ {course.averageRating || '4.5'}</span>
                        <span>{course.totalStudents || 0} students</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Courses */}
      <section className="courses-section">
        <div className="container">
          <div className="section-header">
            <h2>Trending courses</h2>
            <Link to="/courses?sort=popular" className="view-all">View all</Link>
          </div>
          {loading ? (
            <div className="loading-courses">
              <div className="loading-grid">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="loading-card"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="courses-grid">
              {trendingCourses.map(course => (
                <Link to={`/courses/${course._id}`} key={course._id} className="course-card">
                  <div className="course-thumbnail">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <span>{course.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="course-content">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-instructor">{course.instructor.name}</p>
                    <div className="course-stats">
                      <div className="rating">
                        <span className="rating-stars">⭐ {course.averageRating || '4.5'}</span>
                        <span className="rating-count">({course.totalRatings || 0})</span>
                      </div>
                      <div className="students">
                        <span className="student-count">{course.totalStudents || 0}</span>
                      </div>
                    </div>
                    <div className="course-meta">
                      <span className={`level ${course.level}`}>
                        {course.level?.charAt(0).toUpperCase() + course.level?.slice(1) || 'All Levels'}
                      </span>
                      <span className="duration">
                        {course.duration ? `${course.duration}h` : 'Self-paced'}
                      </span>
                    </div>
                    <div className="course-price">
                      {course.price === 0 ? (
                        <span className="price-free">Free</span>
                      ) : (
                        <span className="price-amount">${course.price}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Popular categories</h2>
            <Link to="/courses" className="view-all">View all categories</Link>
          </div>
          <div className="categories-grid">
            {popularCategories.map((category, index) => (
              <Link to={category.path} key={index} className="category-card">
                <div className="category-icon">
                  {index === 0 && '💻'}
                  {index === 1 && '💼'}
                  {index === 2 && '🖥️'}
                  {index === 3 && '🎨'}
                  {index === 4 && '📈'}
                  {index === 5 && '🌟'}
                </div>
                <div className="category-content">
                  <h3>{category.name}</h3>
                  <p>{category.count.toLocaleString()} courses</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Become an Instructor */}
      <section className="instructor-section">
        <div className="container">
          <div className="instructor-content">
            <div className="instructor-text">
              <h2>Become an instructor</h2>
              <p>Share your expertise and earn money while teaching students worldwide.</p>
              <Link to="/courses/create" className="btn-primary">Start teaching today</Link>
            </div>
            <div className="instructor-stats">
              <div className="stat-item">
                <div className="stat-number">75+</div>
                <div className="stat-label">Active instructors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">$10M+</div>
                <div className="stat-label">Paid to instructors</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">4.8★</div>
                <div className="stat-label">Average rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
