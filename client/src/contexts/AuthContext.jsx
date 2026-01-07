import React, { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'

// Set up axios defaults (baseURL will be handled by Vite proxy for /api requests)

// Auth Context
const AuthContext = createContext()

// Auth Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
                error: null
            }
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
                error: null
            }
        case 'LOGIN_FAILURE':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
                error: action.payload
            }
        case 'REGISTER_START':
            return {
                ...state,
                loading: true,
                error: null
            }
        case 'REGISTER_SUCCESS':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
                error: null
            }
        case 'REGISTER_FAILURE':
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
                error: null
            }
        case 'LOAD_USER':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload,
                loading: false
            }
        case 'AUTH_ERROR':
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
                error: action.payload
            }
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            }
        default:
            return state
    }
}

// Initial State
const initialState = {
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    error: null
}

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState)

    // Load user on app start
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token')

            if (token) {
                // Set token in axios headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

                try {
                    const res = await axios.get('/api/auth/me')
                    dispatch({
                        type: 'LOAD_USER',
                        payload: res.data.data.user
                    })
                } catch (error) {
                    localStorage.removeItem('token')
                    delete axios.defaults.headers.common['Authorization']
                    dispatch({
                        type: 'AUTH_ERROR',
                        payload: error.response?.data?.message || 'Authentication failed'
                    })
                }
            } else {
                dispatch({
                    type: 'AUTH_ERROR',
                    payload: null
                })
            }
        }

        loadUser()
    }, [])

    // Register user
    const register = async (userData) => {
        dispatch({ type: 'REGISTER_START' })

        try {
            const res = await axios.post('/api/auth/register', userData)

            const { token, data } = res.data
            localStorage.setItem('token', token)
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: { token, user: data.user }
            })

            return { success: true }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed'
            dispatch({
                type: 'REGISTER_FAILURE',
                payload: message
            })
            return { success: false, message }
        }
    }

    // Login user
    const login = async (userData) => {
        dispatch({ type: 'LOGIN_START' })

        try {
            const res = await axios.post('/api/auth/login', userData)

            const { token, data } = res.data
            localStorage.setItem('token', token)
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { token, user: data.user }
            })

            return { success: true }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed'
            dispatch({
                type: 'LOGIN_FAILURE',
                payload: message
            })
            return { success: false, message }
        }
    }

    // Logout user
    const logout = () => {
        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
        dispatch({ type: 'LOGOUT' })
    }

    // Clear errors
    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' })
    }

    return (
        <AuthContext.Provider
            value={{
                ...state,
                register,
                login,
                logout,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthContext
