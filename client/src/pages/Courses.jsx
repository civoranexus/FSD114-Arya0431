import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI } from '../utils/api'
import './Courses.css'

const Courses = () => {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: 'all',
    level: 'all',
    search: '',
    sort: 'newest'
  })
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [filters])

  const fetchCategories = async () => {
    try {
      const response = await courseAPI.getCategories()
      setCategories(response.data.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        category: filters.category !== 'all' ? filters.category : undefined,
        level: filters.level !== 'all' ? filters.level : undefined,
        search: filters.search || undefined,
        sort: filters.sort
      }

      // Remove undefined values
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key])

      const response = await courseAPI.getCourses(params)
      setCourses(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError('Failed to load courses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchCourses()
  }

  const getCategoryLabel = (value) => {
    const category = categories.find(cat => cat.value === value)
    return category ? category.label : value
  }

  if (loading) {
    return (
      <div className="courses-page">
        <div className="container">
          <div className="loading">Loading courses...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="courses-page">
      <div className="container">
        <div className="courses-header">
          <div className="header-content">
            <h1>Courses to get you started</h1>
            <p>Explore our catalog of courses taught by expert instructors</p>
          </div>
          {user?.role === 'instructor' && (
            <Link to="/courses/create" className="create-course-btn">
              Create Course
            </Link>
          )}
        </div>

        {/* Filters and Search */}
        <div className="courses-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">Search</button>
          </form>

          <div className="filter-controls">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchCourses} className="retry-btn">Retry</button>
          </div>
        )}

        {/* Courses Grid */}
        {!error && (
          <>
            <div className="courses-count">
              {courses.length} course{courses.length !== 1 ? 's' : ''} found
            </div>

            {courses.length === 0 ? (
              <div className="no-courses">
                <h3>No courses found</h3>
                <p>Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <div className="courses-grid">
                {courses.map(course => (
                  <Link to={`/courses/${course._id}`} key={course._id} className="course-card">
                    <div className="course-thumbnail">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} />
                      ) : (
                        <div className="thumbnail-placeholder">
                          <span>{course.title.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>

                    <div className="course-content">
                      <h3 className="course-title">{course.title}</h3>
                      <p className="course-instructor">{course.instructor.name}</p>
                      <div className="course-rating">
                        <span className="rating-stars">⭐ {course.averageRating || '4.5'}</span>
                        <span className="rating-count">({course.totalRatings || 0})</span>
                      </div>
                      <div className="course-students">
                        {course.totalStudents || 0} students
                      </div>
                      <div className="course-meta">
                        <span className={`level ${course.level}`}>
                          {course.level?.charAt(0).toUpperCase() + course.level?.slice(1) || 'All Levels'}
                        </span>
                        <span className="duration">
                          {course.duration ? `${course.duration}h` : 'Self-paced'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={!pagination.hasPrev}
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  className="pagination-btn"
                >
                  Previous
                </button>

                <span className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>

                <button
                  disabled={!pagination.hasNext}
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Courses
