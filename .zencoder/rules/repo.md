---
description: Repository Information Overview
alwaysApply: true
---

# Style Hub Information

## Summary
Style Hub is a boutique management system with a React frontend and Node.js/Express backend. The application provides different dashboards for administrators, staff, tailors, and customers to manage orders, appointments, measurements, and more in a fashion boutique context.

## Structure
- **frontend/**: React application built with Create React App
- **backend/**: Express.js API server with MongoDB database
- **.zencoder/**: Configuration directory for Zencoder

## Projects

### Frontend (React Application)
**Configuration File**: frontend/package.json

#### Language & Runtime
**Language**: JavaScript (React)
**Version**: React 19.1.1
**Build System**: Create React App (react-scripts 5.0.1)
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- react: ^19.1.1
- react-dom: ^19.1.1
- react-router-dom: ^7.8.1
- axios: ^1.11.0
- react-toastify: ^11.0.5
- recharts: ^3.2.1
- react-icons: ^5.5.0

**Development Dependencies**:
- @testing-library/react: ^16.3.0
- @testing-library/jest-dom: ^6.7.0
- webpack-dev-server: ^5.2.2

#### Build & Installation
```bash
cd frontend
npm install
npm start  # Development server
npm run build  # Production build
```

#### Testing
**Framework**: Jest with React Testing Library
**Test Location**: frontend/src/__tests__
**Configuration**: frontend/src/setupTests.js
**Run Command**:
```bash
npm test
```

### Backend (Express API)
**Configuration File**: backend/package.json

#### Language & Runtime
**Language**: JavaScript (Node.js)
**Version**: Node.js (compatible with Express 4.18.2)
**Build System**: Node.js scripts
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express: ^4.18.2
- mongoose: ^8.0.3
- bcryptjs: ^2.4.3
- jsonwebtoken: ^9.0.2
- cors: ^2.8.5
- dotenv: ^16.3.1
- multer: ^2.0.2

**Development Dependencies**:
- nodemon: ^3.0.2

#### Build & Installation
```bash
cd backend
npm install
npm run dev  # Development with auto-reload
npm start    # Production
```

#### Database
**Type**: MongoDB
**Connection**: Environment variable MONGODB_URI or localhost:27017/stylehub
**Models**: User, Customer, Order, Appointment, Bill, Fabric, Feedback, Loyalty, etc.

#### API Routes
- **/api/auth**: Authentication endpoints
- **/api/customers**: Customer management
- **/api/orders**: Order processing
- **/api/measurements**: Customer measurements
- **/api/appointments**: Appointment scheduling
- **/api/admin**: Admin-only operations
- **/api/staff**: Staff operations
- **/api/tailor**: Tailor-specific endpoints
- **/api/portal**: Customer portal endpoints

## Application Features
- **Multi-role Access**: Admin, Staff, Tailor, and Customer roles with specific permissions
- **Customer Management**: Add, edit, view customer profiles and measurements
- **Order Processing**: Create and track clothing orders
- **Appointment Scheduling**: Book and manage appointments
- **Billing System**: Generate and manage bills
- **Fabric Management**: Track available fabrics
- **Customer Portal**: Self-service area for customers
- **Reporting**: Business analytics and reports