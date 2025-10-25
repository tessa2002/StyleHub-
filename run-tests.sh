#!/bin/bash

echo "🧪 StyleHub Playwright Test Runner"
echo "=================================="
echo ""

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npm/npx not found. Please install Node.js first."
    exit 1
fi

# Install Playwright if needed
if [ ! -d "node_modules/@playwright" ]; then
    echo "📦 Installing Playwright..."
    npm install --save-dev @playwright/test
    echo "🌐 Installing browsers..."
    npx playwright install
fi

# Check if servers are running
echo "🔍 Checking if servers are running..."

# Check backend
if curl -s http://localhost:5000 > /dev/null; then
    echo "✅ Backend server is running on http://localhost:5000"
else
    echo "⚠️  Backend server not detected on http://localhost:5000"
    echo "   Starting backend server..."
    cd backend && npm start &
    BACKEND_PID=$!
    sleep 5
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend server is running on http://localhost:3000"
else
    echo "⚠️  Frontend server not detected on http://localhost:3000"
    echo "   Starting frontend server..."
    cd frontend && npm start &
    FRONTEND_PID=$!
    sleep 10
fi

echo ""
echo "🚀 Running Playwright tests..."
echo ""

# Run tests
npm test

echo ""
echo "📊 Test run complete!"
echo ""
echo "📝 To view the HTML report:"
echo "   npm run test:report"
echo ""

