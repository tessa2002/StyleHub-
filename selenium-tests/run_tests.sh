#!/bin/bash
# StyleHub Selenium Test Runner for Linux/Mac

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           StyleHub Selenium Test Suite                     ║"
echo "║                                                            ║"
echo "║  Testing: Admin, Customer, and Tailor Login & Dashboards  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "Please install Python 3.7+ from https://www.python.org/"
    exit 1
fi

echo "✓ Python is installed"
echo ""

# Check if selenium is installed
if ! python3 -c "import selenium" &> /dev/null; then
    echo "📦 Installing Selenium..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✓ Selenium installed successfully"
else
    echo "✓ Selenium is already installed"
fi

echo ""
echo "⚙️  Pre-flight Checks:"
echo ""
echo "1. Make sure Chrome browser is installed"
echo "2. Make sure StyleHub backend is running"
echo "3. Make sure StyleHub frontend is running on http://localhost:3000"
echo ""
echo "Press Enter to start tests or Ctrl+C to cancel..."
read

echo ""
echo "🚀 Starting tests..."
echo ""

# Create screenshots directory if it doesn't exist
mkdir -p screenshots

# Run tests
python3 test_stylehub.py

echo ""
echo "📸 Screenshots saved in: screenshots/"
echo ""
