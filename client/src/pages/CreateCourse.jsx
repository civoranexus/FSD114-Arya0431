import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI } from '../utils/api'
import './CreateCourse.css'

const CreateCourse = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    duration: '',
    price: '0',
    tags: ''
  })

  useEffect(() => {
    // Redirect if not instructor
    if (user && user.role !== 'instructor') {
      navigate('/courses')
      return
    }

    fetchCategories()
  }, [user, navigate])

  const fetchCategories = async () => {
    try {
      const response = await courseAPI.getCategories()
      setCategories(response.data.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleTagsChange = (e) => {
    const tags = e.target.value
    setFormData(prev => ({
      ...prev,
      tags: tags
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required'
    if (!formData.description.trim()) return 'Description is required'
    if (!formData.category) return 'Category is required'
    if (!formData.duration || formData.duration <= 0) return 'Duration must be a positive number'
    if (formData.price < 0) return 'Price cannot be negative'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Prepare data for API
      const courseData = {
        ...formData,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      }

      const response = await courseAPI.createCourse(courseData)
      console.log('Course created:', response.data)

      // Redirect to the created course
      navigate(`/courses/${response.data.data._id}`)
    } catch (error) {
      console.error('Error creating course:', error)
      setError(error.response?.data?.message || 'Failed to create course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/courses')
  }

  if (!user || user.role !== 'instructor') {
    return (
      <div className="create-course-page">
        <div className="container">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>Only instructors can create courses.</p>
            <button onClick={() => navigate('/courses')} className="back-btn">
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="create-course-page">
      <div className="container">
        <div className="create-course-header">
          <h1>Create New Course</h1>
          <p>Share your knowledge by creating a new course for students</p>
        </div>

        <form onSubmit={handleSubmit} className="create-course-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-section">
            <h2>Basic Information</h2>

            <div className="form-group">
              <label htmlFor="title">Course Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter an engaging course title"
                required
                maxLength="100"
              />
              <small>{formData.title.length}/100 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Course Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what students will learn in this course"
                required
                rows="6"
                maxLength="2000"
              />
              <small>{formData.description.length}/2000 characters</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="level">Difficulty Level</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Course Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration">Duration (hours) *</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 10"
                  required
                  min="1"
                  step="0.5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0 for free"
                  min="0"
                  step="0.01"
                />
                <small>Enter 0 for free courses</small>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags (optional)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleTagsChange}
                placeholder="javascript, react, web-development (comma-separated)"
              />
              <small>Separate tags with commas</small>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating Course...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCourse
