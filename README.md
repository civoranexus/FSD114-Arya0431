# EduVillage - Online Learning Platform

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green)](https://www.mongodb.com/)

A modern, full-stack online learning platform built with the MERN stack (MongoDB, Express.js, React, Node.js).

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with React and CSS
- **User Authentication**: Secure login and registration system
- **Role-based Access**: Support for students, instructors, and admins
- **Course Management**: Create, enroll, and track course progress
- **Dashboard**: Personalized user dashboard with course tracking
- **API Health Monitoring**: Built-in health check endpoints
- **Security**: Helmet.js for security headers, CORS support
- **Scalable Architecture**: Well-organized folder structure

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Vite** - Fast build tool and development server
- **CSS3** - Modern styling with responsive design

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for Node.js
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication (future feature)

### Development Tools
- **ESLint** - Code linting
- **Nodemon** - Auto-restart for development
- **Concurrently** - Run multiple scripts simultaneously

## 📁 Project Structure

```
eduvillage/
├── client/                          # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── *.css
│   │   ├── pages/                   # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── *.css
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # App entry point
│   │   └── index.css                # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                          # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── controllers/             # Route controllers
│   │   ├── models/                  # Mongoose models
│   │   │   └── User.js
│   │   ├── routes/                  # API routes
│   │   │   └── health.js
│   │   ├── middleware/              # Custom middleware
│   │   ├── utils/                   # Utility functions
│   │   └── server.js                # Main server file
│   ├── config.env                   # Environment variables
│   └── package.json
├── package.json                     # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/eduvillage.git
   cd eduvillage
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

   Or install manually:
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   npm run install-client

   # Install server dependencies
   npm run install-server
   ```

3. **Set up environment variables**

   Copy the environment configuration:
   ```bash
   cp server/config.env server/.env
   ```

   Update the `.env` file with your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/eduvillage
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduvillage?retryWrites=true&w=majority
   ```

4. **Start MongoDB**

   Make sure MongoDB is running locally:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb/brew/mongodb-community

   # On Linux
   sudo systemctl start mongod

   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

### Running the Application

#### Development Mode
Run both frontend and backend simultaneously:
```bash
npm run dev
```

This will start:
- Frontend server on `http://localhost:3000`
- Backend API on `http://localhost:5000`

#### Production Mode
```bash
# Build the frontend
npm run build

# Start the backend
npm start
```

#### Individual Services
```bash
# Run only the frontend
npm run client

# Run only the backend
npm run server
```

## 🔗 API Endpoints

### Health Check
- `GET /api/health` - Basic health check with system info
- `GET /api/health/ping` - Database connectivity check

## 🧪 Testing

```bash
# Run backend tests
cd server && npm test

# Check API health
curl http://localhost:5000/api/health
```

## 📱 Usage

1. **Home Page**: Landing page with platform overview
2. **Registration**: Create a new account (student/instructor)
3. **Login**: Authenticate with existing credentials
4. **Dashboard**: View enrolled courses and progress (requires authentication)

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Environment-based configuration
- Secure password handling (future implementation)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React documentation and community
- Express.js framework
- MongoDB documentation
- Open source contributors

## 📞 Support

For support, email support@eduvillage.com or create an issue in this repository.

---

**Happy Learning! 🎓**