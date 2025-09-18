// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword'; // ✅ Added ResetPassword
import Customers from './pages/Customers';
import AddCustomer from './pages/AddCustomer';
import EditCustomer from './pages/EditCustomer';
import CustomerProfile from './pages/CustomerProfile';
import CustomerMeasurements from './pages/CustomerMeasurements';
import Orders from './pages/Orders';
import OrderForm from './pages/OrderForm';
import OrderDetail from './pages/OrderDetail';
import Reports from './pages/Reports';
import Fabrics from './pages/Fabrics';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import TailorDashboard from './pages/dashboards/TailorDashboard';
import StaffDashboard from './pages/dashboards/StaffDashboard';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import PortalDashboard from './pages/portal/Dashboard';
import ProfilePage from './pages/portal/Profile';
import OrdersPage from './pages/portal/Orders';
import MeasurementsPage from './pages/portal/Measurements';
import AppointmentsPage from './pages/portal/Appointments';
import PortalNewOrder from './pages/portal/NewOrder';
import ManageUsers from './pages/ManageUsers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Global toast container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="colored"
        />
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} /> {/* ✅ Added */}

          {/* Customers list restricted to Admin & Staff to match API */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <Customers />
              </ProtectedRoute>
            }
          />

          {/* Customers - protected for Admin & Staff */}
          <Route
            path="/add-customer"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <AddCustomer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-customer/:id"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <EditCustomer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <CustomerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/:id/measurements"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <CustomerMeasurements />
              </ProtectedRoute>
            }
          />

          {/* Orders (protected for Admin & Staff) */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/new"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <OrderForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff"]}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fabrics"
            element={
              <ProtectedRoute allowedRoles={["Admin", "Staff", "Tailor"]}>
                <Fabrics />
              </ProtectedRoute>
            }
          />

          {/* Dashboards (protected) */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tailor"
            element={
              <ProtectedRoute allowedRoles={["Tailor"]}>
                <TailorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff"
            element={
              <ProtectedRoute allowedRoles={["Staff"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/customer"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer Portal (protected) */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <PortalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/profile"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/orders"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/orders/new"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <PortalNewOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/measurements"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <MeasurementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/appointments"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/bills"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <React.Suspense fallback={null}>
                  {React.createElement(require('./pages/portal/Bills.js').default)}
                </React.Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
