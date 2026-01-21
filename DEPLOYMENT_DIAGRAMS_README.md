# Deployment Diagrams - PlantUML

This folder contains PlantUML deployment diagrams for the Tailoring Management System showing the system architecture and deployment structure.

## Files Available

### 1. `deployment_diagram_complete.puml` (Recommended)
- **Complete Deployment Diagram**
- Shows all components: Frontend, Backend, ML Service, Database, External Services
- Best for comprehensive system overview
- Includes all technology stack components

### 2. `deployment_diagram_architecture.puml`
- **Scalable Architecture Diagram**
- Shows load balancer, multiple servers, replication
- Best for understanding production architecture
- Includes redundancy and scalability

### 3. `deployment_diagram_simple.puml`
- **Simple Deployment Diagram**
- Basic three-tier architecture
- Easy to understand
- Good for presentations

### 4. `deployment_diagram_3tier.puml`
- **Three-Tier Architecture**
- Clear separation: Presentation, Application, Data tiers
- Best for understanding layered architecture
- Shows component organization

### 5. `deployment_diagram_cloud.puml`
- **Cloud Deployment Architecture**
- Shows cloud-based deployment (Render/AWS)
- Includes MongoDB Atlas, cloud storage
- Best for production deployment view

## Technology Stack

### Frontend
- **React.js** - UI Framework
- **React Router** - Navigation
- **Axios** - HTTP Client
- **Razorpay** - Payment Integration

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Multer** - File Upload

### Database
- **MongoDB** - NoSQL Database
- **MongoDB Atlas** - Cloud Database Service

### ML Service
- **Python** - ML Runtime
- **Flask/FastAPI** - ML API Framework
- **ML Libraries** - KNN, SVM, Naive Bayes

### External Services
- **Razorpay** - Payment Gateway
- **Cloud Storage** - File Storage
- **Email Service** - Notifications

## Deployment Architecture

### Three-Tier Architecture
1. **Presentation Tier** - React Frontend
2. **Application Tier** - Node.js Backend + Python ML
3. **Data Tier** - MongoDB Database

### Components

#### Frontend Server
- Serves React application
- Static file hosting
- CDN for assets

#### Backend Server
- Express.js API server
- RESTful endpoints
- Authentication & Authorization
- Business logic

#### ML Service
- Python API server
- Machine learning models
- Prediction services

#### Database
- MongoDB primary instance
- Replica sets for high availability
- Automatic backups

## Network Connections

- **HTTP/HTTPS** - Client to Frontend
- **REST API** - Frontend to Backend
- **MongoDB Connection** - Backend to Database
- **HTTP API** - Backend to ML Service
- **Payment API** - Backend to Razorpay
- **File Storage API** - Backend to Storage

## Ports and Services

- **Frontend**: Port 3000 (Development), 80/443 (Production)
- **Backend**: Port 5000
- **ML Service**: Port 5001
- **MongoDB**: Port 27017

## Environment Variables

### Backend
- `PORT` - Server port
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - Authentication secret
- `RAZORPAY_KEY_ID` - Payment gateway key
- `RAZORPAY_KEY_SECRET` - Payment gateway secret

### Frontend
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_RAZORPAY_KEY` - Payment gateway key

## How to Use

### Option 1: Online (Easiest)
1. Go to http://www.plantuml.com/plantuml/uml/
2. Copy and paste the content from any `.puml` file
3. The diagram will be generated automatically
4. Export as PNG/SVG

### Option 2: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open any `.puml` file
3. Press `Alt + D` to preview the diagram
4. Export as PNG/SVG using the extension

### Option 3: Command Line
```bash
# Install PlantUML (requires Java)
# Download from: http://plantuml.com/download

# Generate PNG
java -jar plantuml.jar deployment_diagram_complete.puml

# Generate SVG
java -jar plantuml.jar -tsvg deployment_diagram_complete.puml
```

## Recommended for Project Report

Use **`deployment_diagram_complete.puml`** for comprehensive view, or:
- **`deployment_diagram_3tier.puml`** - For three-tier architecture
- **`deployment_diagram_cloud.puml`** - For cloud deployment
- **`deployment_diagram_simple.puml`** - For simple overview

## Key Features

✅ **Component View** - Shows all system components  
✅ **Connection Lines** - Shows data flow  
✅ **Technology Stack** - Shows technologies used  
✅ **Port Information** - Shows service ports  
✅ **Black & White** - Print-friendly formatting  

## Deployment Scenarios

### Development
- Local MongoDB
- Local Node.js server
- Local React dev server
- Local Python ML service

### Production
- MongoDB Atlas (Cloud)
- Render/Heroku (Backend)
- Static hosting (Frontend)
- Cloud ML service
- Cloud storage

All diagrams are formatted in black and white for easy printing and inclusion in project reports.


