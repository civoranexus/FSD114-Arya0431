#!/bin/bash

echo "🚀 Starting EduVillage Online Learning Platform..."
echo "================================================="

# Check if MongoDB is running
echo "📊 Checking MongoDB status..."
if brew services list | grep -q "mongodb-community.*started"; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running. Starting MongoDB..."
    brew services start mongodb-community
    sleep 3
fi

# Check if Node.js version is compatible
NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -gt 20 ]; then
    echo "⚠️  Node.js version $NODE_VERSION detected. Some versions may have macOS security restrictions."
    echo "   If you encounter port binding errors, consider using Node.js 18."
fi

echo "🏗️  Starting backend server..."
source server/config.env
cd server && npm start &
BACKEND_PID=$!

echo "🌐 Starting frontend client..."
cd ../client && npm run dev &
FRONTEND_PID=$!

echo "✅ Services started successfully!"
echo "📱 Frontend: http://localhost:5173"
echo "🔗 Backend API: http://localhost:3001"
echo ""
echo "To stop the services, press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"

# Wait for services to be ready
sleep 5

# Check if services are still running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend server is running (PID: $BACKEND_PID)"
else
    echo "❌ Backend server failed to start"
fi

if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "✅ Frontend client is running (PID: $FRONTEND_PID)"
else
    echo "❌ Frontend client failed to start"
fi

# Keep the script running
wait