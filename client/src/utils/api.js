import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error

    if (response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  getMe: () => api.get('/auth/me'),
  updateDetails: (userData) => api.put('/auth/updatedetails', userData),
  updatePassword: (passwordData) => api.put('/auth/updatepassword', passwordData),
  logout: () => api.get('/auth/logout')
}

// Course API
export const courseAPI = {
  // Public routes
  getCourses: (params = {}) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  getCategories: () => api.get('/courses/categories'),

  // Instructor routes
  createCourse: (courseData) => api.post('/courses', courseData),
  updateCourse: (id, courseData) => api.put(`/courses/${id}`, courseData),
  deleteCourse: (id) => api.delete(`/courses/${id}`),

  // Student routes
  getEnrolledCourses: () => api.get('/courses/user/enrolled'),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  unenrollCourse: (id) => api.delete(`/courses/${id}/enroll`),

  // Instructor specific
  getCoursesByInstructor: (instructorId) => api.get(`/courses/instructor/${instructorId}`)
}

// Health API
export const healthAPI = {
  checkHealth: () => api.get('/health'),
  ping: () => api.get('/health/ping')
}

export default api
