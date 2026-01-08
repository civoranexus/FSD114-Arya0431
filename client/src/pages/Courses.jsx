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
          <h1>All Courses</h1>
          <p>Discover and learn from our comprehensive course catalog</p>
          {user?.role === 'instructor' && (
            <Link to="/courses/create" className="create-course-btn">
              Create New Course
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
                  <div key={course._id} className="course-card">
                    <div className="course-image">
                      <span className="course-category">
                        {getCategoryLabel(course.category)}
                      </span>
                      {course.price === 0 ? (
                        <span className="course-price free">Free</span>
                      ) : (
                        <span className="course-price">${course.price}</span>
                      )}
                    </div>

                    <div className="course-content">
                      <h3 className="course-title">
                        <Link to={`/courses/${course._id}`}>{course.title}</Link>
                      </h3>

                      <p className="course-description">
                        {course.description.length > 120
                          ? `${course.description.substring(0, 120)}...`
                          : course.description
                        }
                      </p>

                      <div className="course-meta">
                        <div className="instructor">
                          <span>By {course.instructor.name}</span>
                        </div>
                        <div className="course-stats">
                          <span className="students">
                            {course.totalStudents} students
                          </span>
                          <span className="rating">
                            ⭐ {course.averageRating || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="course-footer">
                        <span className={`level ${course.level}`}>
                          {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                        </span>
                        <span className="duration">
                          {course.duration > 0 ? `${course.duration}h` : 'Self-paced'}
                        </span>
                      </div>
                    </div>
                  </div>
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
