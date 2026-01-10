import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.navbar') && !event.target.closest('.mobile-menu-overlay')) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  // Close menus when route changes
  useEffect(() => {
    setShowProfileMenu(false)
    setIsMobileMenuOpen(false)
  }, [window.location.pathname])

  const categories = [
    { name: 'Development', path: '/courses?category=web-development' },
    { name: 'Business', path: '/courses?category=business' },
    { name: 'IT & Software', path: '/courses?category=other' },
    { name: 'Design', path: '/courses?category=design' },
    { name: 'Marketing', path: '/courses?category=marketing' },
    { name: 'Personal Development', path: '/courses?category=other' }
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to courses with search query
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const handleLogout = () => {
    logout()
    setShowProfileMenu(false)
  }

  const handleTeachClick = (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login?role=instructor')
    } else if (user.role === 'instructor') {
      navigate('/instructor/dashboard')
    } else {
      navigate('/login?role=instructor')
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setShowProfileMenu(false) // Close profile menu when opening mobile menu
  }

  return (
    <>
      {/* Main Header */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button
              className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          )}

          {/* Left Section: Logo + Categories Dropdown */}
          <div className="navbar-left">
            <Link to="/" className="navbar-logo" onClick={() => setIsMobileMenuOpen(false)}>
              EduVillage
            </Link>
            {!isMobile && (
              <div className="navbar-categories-dropdown">
                <button className="categories-trigger">
                  <span className="categories-icon">☰</span>
                  Explore
                </button>
                {/* Dropdown menu would go here */}
              </div>
            )}
          </div>

          {/* Center Section: Search Bar */}
          <div className="navbar-center">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search for courses, skills, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </form>
          </div>

          {/* Right Section: User Actions */}
          <div className="navbar-right">
            {/* Teach on EduVillage Link */}
            <button onClick={handleTeachClick} className="navbar-action teach-link">
              Teach on EduVillage
            </button>

            {user ? (
              <div className="user-actions">
                {/* Instructor Link */}
                {user.role === 'instructor' && (
                  <Link to="/dashboard" className="navbar-action instructor-link">
                    <span className="action-icon">📚</span>
                    Instructor
                  </Link>
                )}

                {/* Dashboard */}
                <Link to="/dashboard" className="navbar-action">
                  <span className="action-icon">📊</span>
                  Dashboard
                </Link>

                {/* Profile Menu */}
                <div className="profile-menu">
                  <button
                    className="profile-trigger"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <div className="profile-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <span>{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </button>

                  {showProfileMenu && (
                    <div className="profile-dropdown">
                      <div className="profile-info">
                        <div className="profile-avatar-large">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                          ) : (
                            <span>{user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="profile-details">
                          <div className="profile-name">{user.name}</div>
                          <div className="profile-email">{user.email}</div>
                        </div>
                      </div>
                      <div className="profile-actions">
                        <Link to="/dashboard" className="profile-menu-item">
                          <span className="menu-icon">👤</span>
                          Profile
                        </Link>
                        <Link to="/dashboard" className="profile-menu-item">
                          <span className="menu-icon">📚</span>
                          My Courses
                        </Link>
                        <Link to="/dashboard" className="profile-menu-item">
                          <span className="menu-icon">⚙️</span>
                          Settings
                        </Link>
                        <button onClick={handleLogout} className="profile-menu-item logout">
                          <span className="menu-icon">🚪</span>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="guest-actions">
                <Link to="/login" className="navbar-action login">
                  Log In
                </Link>
                <Link to="/register" className="navbar-action register">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Categories Bar - Hidden on mobile */}
      {!isMobile && (
        <div className="categories-bar">
          <div className="categories-container">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.path}
                className="category-link"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-content">
            {/* User Section */}
            <div className="mobile-menu-user">
              {user ? (
                <div className="mobile-user-info">
                  <div className="mobile-profile-avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="mobile-user-details">
                    <div className="mobile-user-name">{user.name}</div>
                    <div className="mobile-user-email">{user.email}</div>
                  </div>
                </div>
              ) : (
                <div className="mobile-auth-section">
                  <Link
                    to="/login"
                    className="mobile-menu-link primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="mobile-menu-link secondary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="mobile-menu-nav">
              <Link
                to="/courses"
                className="mobile-menu-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mobile-link-icon">📚</span>
                Browse Courses
              </Link>

              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="mobile-menu-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mobile-link-icon">📊</span>
                    My Learning
                  </Link>

                  {user.role === 'instructor' && (
                    <Link
                      to="/instructor/dashboard"
                      className="mobile-menu-link"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="mobile-link-icon">👨‍🏫</span>
                      Instructor Dashboard
                    </Link>
                  )}
                </>
              )}

              <button
                onClick={(e) => {
                  e.preventDefault()
                  setIsMobileMenuOpen(false)
                  if (!user) {
                    navigate('/login?role=instructor')
                  } else if (user.role === 'instructor') {
                    navigate('/instructor/dashboard')
                  } else {
                    navigate('/login?role=instructor')
                  }
                }}
                className="mobile-menu-link"
              >
                <span className="mobile-link-icon">👨‍🏫</span>
                Teach on EduVillage
              </button>
            </div>

            {/* Categories Section */}
            <div className="mobile-menu-categories">
              <h4>Categories</h4>
              <div className="mobile-categories-grid">
                {categories.map((category, index) => (
                  <Link
                    key={index}
                    to={category.path}
                    className="mobile-category-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Logout for authenticated users */}
            {user && (
              <div className="mobile-menu-footer">
                <button
                  className="mobile-logout-btn"
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <span className="mobile-link-icon">🚪</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
