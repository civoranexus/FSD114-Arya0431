import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI } from '../utils/api'
import './CreateCourse.css'

const InstructorCourseCreate = () => {
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
    language: 'english'
  })

  useEffect(() => {
    // Redirect if not instructor
    if (user && user.role !== 'instructor') {
      navigate('/instructor/dashboard')
      return
    }

    if (!user) {
      navigate('/login?role=instructor')
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

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required'
    if (!formData.description.trim()) return 'Short description is required'
    if (!formData.category) return 'Category is required'
    if (formData.description.length > 2000) return 'Description cannot exceed 2000 characters'
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
      // Prepare data for API - explicitly set status to draft
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        level: formData.level,
        status: 'draft' // Explicitly set status to draft
        // Note: language field is not in the backend schema, so it won't be saved
      }

      const response = await courseAPI.createCourse(courseData)
      console.log('Draft course created:', response.data)

      // Redirect to instructor course manage page
      const courseId = response.data.data._id
      navigate(`/instructor/courses/${courseId}/manage`)
    } catch (error) {
      console.error('Error creating draft course:', error)
      setError(error.response?.data?.message || error.response?.data?.errors?.[0] || 'Failed to create course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/instructor/dashboard')
  }

  if (!user || user.role !== 'instructor') {
    return (
      <div className="create-course-page">
        <div className="container">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>Only instructors can create courses.</p>
            <button onClick={() => navigate('/instructor/dashboard')} className="back-btn">
              Back to Dashboard
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
          <h1>Create Your Course</h1>
          <p>Start by filling in the basic information. You can add more details later.</p>
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
                placeholder="Example: Complete React Developer Course"
                required
                maxLength="100"
              />
              <small>{formData.title.length}/100 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Short Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Write a brief description of what students will learn in this course..."
                required
                rows="4"
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
                <label htmlFor="level">Difficulty Level *</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="language">Course Language *</label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                required
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
                <option value="hindi">Hindi</option>
                <option value="portuguese">Portuguese</option>
                <option value="arabic">Arabic</option>
              </select>
              <small>Note: Language selection is for display purposes only</small>
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
              {loading ? 'Creating Draft Course...' : 'Create Draft Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InstructorCourseCreate
