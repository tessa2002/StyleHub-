// frontend/src/App.js
import React, { Suspense } from 'react';
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
import NewOrder from './pages/tailor/Orders/NewOrder';
import AllOrders from './pages/tailor/Orders/AllOrders';
import CustomerList from './pages/tailor/Customers/CustomerList';
import StaffDashboard from './pages/staff/StaffDashboard';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import TailorDashboard from './pages/dashboards/TailorDashboard';
import MyOrders from './pages/tailor/MyOrders';
import InProgress from './pages/tailor/InProgress';
import ReadyToDeliver from './pages/tailor/ReadyToDeliver';
import OrderDetails from './pages/tailor/OrderDetails';
// Admin Dashboard Components
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCustomers from './pages/admin/Customers';
import AdminOrders from './pages/admin/Orders';
import AdminMeasurements from './pages/admin/Measurements';
import AdminStaff from './pages/admin/Staff';
import AdminBilling from './pages/admin/Billing';
import AdminSettings from './pages/admin/Settings';
import AdminFabrics from './pages/admin/Fabrics';
import AdminOffers from './pages/admin/Offers';
import AdminNotifications from './pages/admin/Notifications';
import AdminTest from './pages/admin/AdminTest';
import SimpleAdminDashboard from './pages/admin/SimpleAdminDashboard';
// PortalDashboard removed - using CustomerDashboard instead
import ProfilePage from './pages/portal/Profile';
import OrdersPage from './pages/portal/Orders';
import MeasurementsPage from './pages/portal/Measurements';
import AppointmentsPage from './pages/portal/Appointments';
import PortalNewOrder from './pages/portal/NewOrder';
import ManageUsers from './pages/ManageUsers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Lazy load portal components for better performance
const BillsPage = React.lazy(() => import('./pages/portal/Bills'));
const PaymentsPage = React.lazy(() => import('./pages/portal/Payments'));
const SupportPage = React.lazy(() => import('./pages/portal/Support'));
const NotificationsPage = React.lazy(() => import('./pages/portal/Notifications'));
const SettingsPage = React.lazy(() => import('./pages/portal/Settings'));

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

          <Route
            path="/tailor/orders"
            element={
              <ProtectedRoute allowedRoles={["Tailor"]}>
                <AllOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tailor/orders/new"
            element={
              <ProtectedRoute allowedRoles={["Tailor"]}>
                <NewOrder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tailor/orders/pending"
            element={
              <ProtectedRoute allowedRoles={["Tailor"]}>
                <AllOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tailor/orders/completed"
            element={
              <ProtectedRoute allowedRoles={["Tailor"]}>
                <AllOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tailor/customers"
            element={
              <ProtectedRoute allowedRoles={["Tailor"]}>
                <CustomerList />
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
            path="/dashboard/tailor"
            element={
              <ProtectedRoute allowedRoles={["Tailor"]}>
                <TailorDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Tailor Dashboard Routes - Simplified */}
          <Route
            path="/dashboard/tailor/orders"
            element={
              <ProtectedRoute allowedRoles={["Tailor"]}>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tailor/order/:orderId"
            element={
              <ProtectedRoute allowedRoles={["Tailor"]}>
                <OrderDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tailor/in-progress"
            element={
              <ProtectedRoute allowedRoles={["Tailor"]}>
                <InProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/tailor/ready"
            element={
              <ProtectedRoute allowedRoles={["Tailor"]}>
                <ReadyToDeliver />
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

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/test"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminTest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/simple"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <SimpleAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminCustomers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/measurements"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminMeasurements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/billing"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminBilling />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fabrics"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminFabrics />
              </ProtectedRoute>
            }
          />
              <Route
                path="/admin/offers"
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <AdminOffers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <AdminNotifications />
                  </ProtectedRoute>
                }
              />

          {/* Customer Portal (protected) */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <CustomerDashboard />
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
                <Suspense fallback={<div>Loading...</div>}>
                  <BillsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/payments"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <Suspense fallback={<div>Loading...</div>}>
                  <PaymentsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/support"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <Suspense fallback={<div>Loading...</div>}>
                  <SupportPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/notifications"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <Suspense fallback={<div>Loading...</div>}>
                  <NotificationsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/settings"
            element={
              <ProtectedRoute allowedRoles={["Customer"]}>
                <Suspense fallback={<div>Loading...</div>}>
                  <SettingsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
