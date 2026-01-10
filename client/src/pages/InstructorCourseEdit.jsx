import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI, lectureAPI } from '../utils/api'
import './Dashboard.css'
import './CreateCourse.css'

const InstructorCourseEdit = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showAddLectureForm, setShowAddLectureForm] = useState(false)
  const [editingLecture, setEditingLecture] = useState(null)
  const [lectureFormData, setLectureFormData] = useState({ title: '', videoUrl: '', order: 0 })
  const [lectureLoading, setLectureLoading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState('url') // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null)

  useEffect(() => {
    // Check if user is authenticated and is an instructor
    if (!user) {
      navigate('/login?role=instructor')
      return
    }

    if (user.role !== 'instructor') {
      navigate('/instructor/dashboard')
      return
    }

    // Load course data
    loadCourse()
  }, [user, navigate, courseId])

  const loadCourse = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await courseAPI.getCourse(courseId)
      const courseData = response.data.data

      // Verify that the course belongs to this instructor (ACCESS CONTROL)
      const instructorId = courseData.instructor._id || courseData.instructor
      if (instructorId.toString() !== user.id && user.role !== 'admin') {
        setError('You do not have permission to access this course.')
        setLoading(false)
        return
      }

      setCourse(courseData)
      
      // Load lectures for this course (instructor can see all, even for draft courses)
      try {
        const lecturesResponse = await lectureAPI.getLectures(courseId)
        setLectures(lecturesResponse.data.data || [])
      } catch (lectureError) {
        console.error('Error loading lectures:', lectureError)
        // If 403 or 404, it might be because course is draft - try alternative approach
        // For instructors, we should still be able to see lectures
        if (lectureError.response?.status === 403 || lectureError.response?.status === 404) {
          // Try to load lectures via instructor endpoint or just show empty list
          setLectures([])
        } else {
          setLectures([])
        }
      }
    } catch (error) {
      console.error('Error loading course:', error)
      if (error.response?.status === 404) {
        setError('Course not found.')
      } else if (error.response?.status === 403) {
        setError('You do not have permission to access this course.')
      } else {
        setError(error.response?.data?.message || 'Failed to load course. Please refresh the page.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePublishCourse = async () => {
    if (!course) return

    // Confirm before publishing
    const confirmPublish = window.confirm(
      'Are you sure you want to publish this course? Once published, it will be visible to all students.'
    )

    if (!confirmPublish) return

    try {
      setPublishing(true)
      setError(null)
      setSuccess(null)

      // Update course status to published
      const response = await courseAPI.updateCourse(courseId, {
        status: 'published'
      })

      setCourse(response.data.data)
      setSuccess('Course published successfully! It is now visible to all students.')
    } catch (error) {
      console.error('Error publishing course:', error)
      setError(error.response?.data?.message || 'Failed to publish course. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  const handleUnpublishCourse = async () => {
    if (!course) return

    // Confirm before unpublishing
    const confirmUnpublish = window.confirm(
      'Are you sure you want to unpublish this course? Students will no longer be able to see it.'
    )

    if (!confirmUnpublish) return

    try {
      setPublishing(true)
      setError(null)
      setSuccess(null)

      // Update course status to draft
      const response = await courseAPI.updateCourse(courseId, {
        status: 'draft'
      })

      setCourse(response.data.data)
      setSuccess('Course unpublished successfully! It is now in draft mode.')
    } catch (error) {
      console.error('Error unpublishing course:', error)
      setError(error.response?.data?.message || 'Failed to unpublish course. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Create a local preview URL (this won't work for actual upload, but shows preview)
      const previewUrl = URL.createObjectURL(file)
      setFilePreviewUrl(previewUrl)
      
      // Note: Backend requires URL, so we'll need to convert file to URL
      // For now, set a placeholder - in production, this would upload to file storage first
      setLectureFormData({ 
        ...lectureFormData, 
        videoUrl: `[File: ${file.name}] - Please upload file to hosting service and use URL`
      })
    }
  }

  const handleAddLecture = async (e) => {
    e.preventDefault()
    
    // If file is selected but no URL provided, show error
    if (uploadMethod === 'file' && selectedFile && lectureFormData.videoUrl.includes('[File:')) {
      setError('File upload requires backend file storage. Please upload your file to a hosting service (e.g., Cloudinary, AWS S3, YouTube, Vimeo) and use the provided URL, or use URL upload method instead.')
      return
    }
    
    try {
      setLectureLoading(true)
      setError(null)

      const response = await lectureAPI.createLecture(courseId, lectureFormData)
      setLectures([...lectures, response.data.data])
      setLectureFormData({ title: '', videoUrl: '', order: lectures.length })
      setShowAddLectureForm(false)
      setSelectedFile(null)
      setFilePreviewUrl(null)
      setUploadMethod('url')
      setSuccess('Lecture added successfully!')
    } catch (error) {
      console.error('Error adding lecture:', error)
      setError(error.response?.data?.message || error.response?.data?.errors?.[0] || 'Failed to add lecture. Please try again.')
    } finally {
      setLectureLoading(false)
    }
  }

  const handleEditLecture = async (e) => {
    e.preventDefault()
    
    if (!editingLecture) return

    try {
      setLectureLoading(true)
      setError(null)

      const response = await lectureAPI.updateLecture(editingLecture._id, lectureFormData)
      setLectures(lectures.map(l => l._id === editingLecture._id ? response.data.data : l))
      setEditingLecture(null)
      setLectureFormData({ title: '', videoUrl: '', order: 0 })
      setSuccess('Lecture updated successfully!')
    } catch (error) {
      console.error('Error updating lecture:', error)
      setError(error.response?.data?.message || error.response?.data?.errors?.[0] || 'Failed to update lecture. Please try again.')
    } finally {
      setLectureLoading(false)
    }
  }

  const handleDeleteLecture = async (lectureId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this lecture? This action cannot be undone.')
    
    if (!confirmDelete) return

    try {
      setLectureLoading(true)
      setError(null)

      await lectureAPI.deleteLecture(lectureId)
      setLectures(lectures.filter(l => l._id !== lectureId))
      setSuccess('Lecture deleted successfully!')
    } catch (error) {
      console.error('Error deleting lecture:', error)
      setError(error.response?.data?.message || 'Failed to delete lecture. Please try again.')
    } finally {
      setLectureLoading(false)
    }
  }

  const startEditLecture = (lecture) => {
    setEditingLecture(lecture)
    setLectureFormData({
      title: lecture.title,
      videoUrl: lecture.videoUrl,
      order: lecture.order || 0
    })
    setShowAddLectureForm(false)
    setUploadMethod('url') // Default to URL for editing
    setSelectedFile(null)
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
  }

  const cancelLectureForm = () => {
    setShowAddLectureForm(false)
    setEditingLecture(null)
    setLectureFormData({ title: '', videoUrl: '', order: 0 })
    setSelectedFile(null)
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    }
    setUploadMethod('url')
  }

  const refreshLectures = async () => {
    try {
      const lecturesResponse = await lectureAPI.getLectures(courseId)
      setLectures(lecturesResponse.data.data || [])
    } catch (error) {
      console.error('Error refreshing lectures:', error)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading course...</div>
      </div>
    )
  }

  // Only show full error screen if course failed to load initially
  if (loading === false && !course && error) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <h2>Error Loading Course</h2>
          <p>{error}</p>
          <button onClick={loadCourse} className="retry-btn">
            Try Again
          </button>
          <Link to="/instructor/dashboard" className="retry-btn" style={{ marginLeft: '1rem', display: 'inline-block', textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Show not found if no course after loading
  if (loading === false && !course && !error) {
    return (
      <div className="dashboard">
        <div className="error-message">
          <h2>Course Not Found</h2>
          <p>The course you're looking for doesn't exist.</p>
          <Link to="/instructor/dashboard" className="retry-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Don't render main content if course hasn't loaded yet
  if (!course) {
    return null
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Manage Course</h1>
          <p className="user-role">Course Management Dashboard</p>
        </div>
        <Link to="/instructor/dashboard" className="create-course-link">
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="error-message" style={{ marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          background: '#d4edda', 
          color: '#155724', 
          borderRadius: '8px',
          border: '1px solid #c3e6cb'
        }}>
          {success}
        </div>
      )}

      <div className="dashboard-content">
        {/* Course Overview Section */}
        <section className="instructor-section">
          <div className="section-header">
            <h2>{course.title}</h2>
            <span className={`status-badge ${course.status}`}>
              {course.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>

          <div className="course-card" style={{ marginTop: '1.5rem' }}>
            <div className="course-info">
              <p className="course-description" style={{ marginBottom: '1rem' }}>
                {course.description}
              </p>
              <div className="course-meta">
                <span className="category">{course.category}</span>
                <span className="level">{course.level}</span>
                {course.duration > 0 && <span className="duration">{course.duration}h</span>}
                {course.totalStudents > 0 && (
                  <span className="students">{course.totalStudents} students</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Manage Lectures Section */}
        <section className="instructor-section" style={{ marginTop: '2rem' }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Manage Lectures</h2>
            <button
              onClick={() => {
                if (editingLecture) {
                  cancelLectureForm()
                } else {
                  setShowAddLectureForm(!showAddLectureForm)
                  setEditingLecture(null)
                  setLectureFormData({ title: '', videoUrl: '', order: lectures.length })
                }
              }}
              className="action-btn"
              style={{
                background: '#5624d0',
                color: 'white',
                border: 'none',
                padding: '0.6rem 1.2rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {editingLecture ? 'Cancel Edit' : showAddLectureForm ? 'Cancel' : '+ Add Lecture'}
            </button>
          </div>

          {/* Add/Edit Lecture Form */}
          {(showAddLectureForm || editingLecture) && (
            <div className="action-card" style={{ textAlign: 'left', marginTop: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>
                {editingLecture ? 'Edit Lecture' : 'Add New Lecture'}
              </h3>
              <form onSubmit={editingLecture ? handleEditLecture : handleAddLecture}>
                <div className="form-group">
                  <label htmlFor="lecture-title">Lecture Title *</label>
                  <input
                    type="text"
                    id="lecture-title"
                    name="title"
                    value={lectureFormData.title}
                    onChange={(e) => setLectureFormData({ ...lectureFormData, title: e.target.value })}
                    placeholder="Enter lecture title"
                    required
                    maxLength="200"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                  <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                    {lectureFormData.title.length}/200 characters
                  </small>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="lecture-video">Video Upload *</label>
                  
                  {/* Upload Method Toggle */}
                  <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="uploadMethod"
                        value="url"
                        checked={uploadMethod === 'url'}
                        onChange={(e) => {
                          setUploadMethod(e.target.value)
                          setSelectedFile(null)
                          if (filePreviewUrl) {
                            URL.revokeObjectURL(filePreviewUrl)
                            setFilePreviewUrl(null)
                          }
                          setLectureFormData({ ...lectureFormData, videoUrl: '' })
                        }}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Video URL
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="uploadMethod"
                        value="file"
                        checked={uploadMethod === 'file'}
                        onChange={(e) => {
                          setUploadMethod(e.target.value)
                          setLectureFormData({ ...lectureFormData, videoUrl: '' })
                        }}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Upload File
                    </label>
                  </div>

                  {uploadMethod === 'url' ? (
                    <>
                      <input
                        type="url"
                        id="lecture-video"
                        name="videoUrl"
                        value={lectureFormData.videoUrl}
                        onChange={(e) => setLectureFormData({ ...lectureFormData, videoUrl: e.target.value })}
                        placeholder="https://example.com/video.mp4 or https://www.youtube.com/watch?v=..."
                        required={!editingLecture || uploadMethod === 'url'}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e1e5e9',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                      <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                        Supported: Direct video links (MP4, WebM, OGV), YouTube, Vimeo, or other video hosting service URLs
                      </small>
                    </>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="lecture-file"
                        name="videoFile"
                        accept="video/*"
                        onChange={handleFileChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #e1e5e9',
                          borderRadius: '8px',
                          fontSize: '1rem'
                        }}
                      />
                      {selectedFile && (
                        <div style={{ 
                          marginTop: '0.5rem', 
                          padding: '0.75rem', 
                          background: '#fff3cd', 
                          border: '1px solid #ffc107',
                          borderRadius: '6px',
                          fontSize: '0.875rem'
                        }}>
                          <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          <br />
                          <strong>Note:</strong> File upload requires backend file storage infrastructure. 
                          Please upload your video file to a hosting service (e.g., Cloudinary, AWS S3, YouTube, Vimeo) 
                          and paste the URL using "Video URL" option above.
                        </div>
                      )}
                      {filePreviewUrl && (
                        <div style={{ marginTop: '1rem' }}>
                          <video 
                            src={filePreviewUrl} 
                            controls 
                            style={{ 
                              width: '100%', 
                              maxHeight: '300px',
                              borderRadius: '8px',
                              border: '1px solid #dee2e6'
                            }}
                          >
                            Your browser does not support video preview.
                          </video>
                        </div>
                      )}
                      <small style={{ display: 'block', marginTop: '0.5rem', color: '#856404' }}>
                        ⚠️ File upload is currently not fully supported. Please use "Video URL" to add videos hosted on external services.
                      </small>
                    </>
                  )}
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="lecture-order">Order (Optional)</label>
                  <input
                    type="number"
                    id="lecture-order"
                    name="order"
                    value={lectureFormData.order}
                    onChange={(e) => setLectureFormData({ ...lectureFormData, order: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e1e5e9',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                  <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                    Lower numbers appear first. Default: {lectures.length}
                  </small>
                </div>

                <div className="form-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={
                      lectureLoading || 
                      !lectureFormData.title.trim() || 
                      (uploadMethod === 'url' && !lectureFormData.videoUrl.trim()) ||
                      (uploadMethod === 'file' && !selectedFile)
                    }
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: (
                        lectureLoading || 
                        !lectureFormData.title.trim() || 
                        (uploadMethod === 'url' && !lectureFormData.videoUrl.trim()) ||
                        (uploadMethod === 'file' && !selectedFile)
                      ) ? 'not-allowed' : 'pointer',
                      opacity: (
                        lectureLoading || 
                        !lectureFormData.title.trim() || 
                        (uploadMethod === 'url' && !lectureFormData.videoUrl.trim()) ||
                        (uploadMethod === 'file' && !selectedFile)
                      ) ? 0.6 : 1
                    }}
                  >
                    {lectureLoading 
                      ? (editingLecture ? 'Updating...' : 'Adding...') 
                      : (editingLecture ? 'Update Lecture' : 'Add Lecture')
                    }
                  </button>
                  <button
                    type="button"
                    onClick={cancelLectureForm}
                    className="cancel-btn"
                    disabled={lectureLoading}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: lectureLoading ? 'not-allowed' : 'pointer',
                      opacity: lectureLoading ? 0.6 : 1
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lectures List */}
          <div className="action-card" style={{ textAlign: 'left', marginTop: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>Course Lectures</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                {lectures.length === 0 
                  ? 'No lectures added yet. Start by adding your first lecture.'
                  : `You have ${lectures.length} ${lectures.length === 1 ? 'lecture' : 'lectures'} in this course.`
                }
              </p>
            </div>

            {lectures.length > 0 ? (
              <div style={{ 
                background: '#f8f9fa', 
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[...lectures].sort((a, b) => (a.order || 0) - (b.order || 0)).map((lecture, index) => (
                    <li key={lecture._id} style={{ 
                      padding: '1rem',
                      borderBottom: index < lectures.length - 1 ? '1px solid #dee2e6' : 'none',
                      background: editingLecture?._id === lecture._id ? '#e7f3ff' : 'transparent'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <span style={{ 
                              fontWeight: 600, 
                              color: '#495057',
                              minWidth: '2rem'
                            }}>
                              {index + 1}.
                            </span>
                            <span style={{ fontWeight: 500, color: '#333', fontSize: '1rem' }}>
                              {lecture.title}
                            </span>
                          </div>
                          <div style={{ marginLeft: '2.5rem', fontSize: '0.875rem', color: '#6c757d' }}>
                            <div>Order: {lecture.order || 0}</div>
                            <div style={{ marginTop: '0.25rem', wordBreak: 'break-all' }}>
                              URL: {lecture.videoUrl.substring(0, 50)}{lecture.videoUrl.length > 50 ? '...' : ''}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                          <button
                            onClick={() => startEditLecture(lecture)}
                            disabled={lectureLoading || showAddLectureForm}
                            style={{
                              background: '#007bff',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              cursor: (lectureLoading || showAddLectureForm) ? 'not-allowed' : 'pointer',
                              opacity: (lectureLoading || showAddLectureForm) ? 0.6 : 1
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteLecture(lecture._id)}
                            disabled={lectureLoading || showAddLectureForm}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              cursor: (lectureLoading || showAddLectureForm) ? 'not-allowed' : 'pointer',
                              opacity: (lectureLoading || showAddLectureForm) ? 0.6 : 1
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                color: '#6c757d'
              }}>
                <p>No lectures yet. Click "Add Lecture" to get started!</p>
              </div>
            )}
          </div>
        </section>

        {/* Publish Course Section */}
        <section className="instructor-section" style={{ marginTop: '2rem' }}>
          <div className="section-header">
            <h2>Publish Course</h2>
          </div>

          <div className="action-card" style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>Course Status</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>
                {course.status === 'published' 
                  ? 'Your course is currently published and visible to all students. You can unpublish it to make it a draft again.'
                  : 'Your course is currently a draft and is only visible to you. Publish it to make it available to students.'
                }
              </p>
            </div>

            {course.status === 'draft' ? (
              <div>
                <button
                  onClick={handlePublishCourse}
                  disabled={publishing}
                  className="submit-btn"
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: publishing ? 'not-allowed' : 'pointer',
                    opacity: publishing ? 0.6 : 1
                  }}
                >
                  {publishing ? 'Publishing...' : 'Publish Course'}
                </button>
                <p style={{ 
                  marginTop: '0.75rem', 
                  fontSize: '0.875rem', 
                  color: '#6c757d' 
                }}>
                  ⚠️ Once published, your course will be visible to all students and they can enroll in it.
                </p>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleUnpublishCourse}
                  disabled={publishing}
                  className="cancel-btn"
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: publishing ? 'not-allowed' : 'pointer',
                    opacity: publishing ? 0.6 : 1
                  }}
                >
                  {publishing ? 'Unpublishing...' : 'Unpublish Course'}
                </button>
                <p style={{ 
                  marginTop: '0.75rem', 
                  fontSize: '0.875rem', 
                  color: '#6c757d' 
                }}>
                  ⚠️ Unpublishing will hide your course from students, but enrolled students will retain access.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="instructor-section" style={{ marginTop: '2rem' }}>
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>

          <div className="course-actions" style={{ justifyContent: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to={`/courses/${course._id}`} className="continue-btn">
              View Course
            </Link>
            <Link 
              to="/instructor/dashboard" 
              className="lectures-btn"
              style={{ background: '#6c757d' }}
            >
              Back to Dashboard
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default InstructorCourseEdit
