import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaThLarge, 
  FaShoppingBag, 
  FaRulerCombined, 
  FaLayerGroup, 
  FaCalendarAlt, 
  FaChild, 
  FaRobot,
  FaSignOutAlt,
  FaPlus
} from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import './Dashboard.css';
import './CustomerSidebar.css';
import logo from '../logo.svg';

// Dashboard layout with header, sidebar and content area
export default function DashboardLayout({ title, actions, children, showTitle = true, showRole = true, onNewTask }) {
  const { user, logout } = useAuth();

  const isCustomer = user?.role === 'Customer';
  const isAdmin = user?.role === 'Admin';

  return (
    <div className="dashboard-root">
      {/* Customer Sidebar */}
      {isCustomer && (
        <aside className="dashboard-sidebar customer-sidebar">
          <div className="sidebar-header">
            <div className="brand">
              <div className="brand-logo-pink">
                <svg viewBox="0 0 24 24" fill="#ff4d8d" width="32" height="32">
                   <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.41,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.59,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
                </svg>
              </div>
              <span className="brand-name">StyleHub</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            <ul className="nav-menu">
              <NavItem to="/portal" label="Dashboard" icon={<FaThLarge />} />
              <NavItem to="/portal/orders/new" label="New Request" icon={<FaPlus />} />
              <NavItem to="/portal/orders" label="My Orders" icon={<FaShoppingBag />} />
              <NavItem to="/portal/measurements" label="Measurements" icon={<FaRulerCombined />} />
              <NavItem to="/portal/fabrics" label="Fabric Catalog" icon={<FaLayerGroup />} />
              <NavItem to="/portal/appointments" label="Appointments" icon={<FaCalendarAlt />} />
              <NavItem to="/portal/kids" label="Kids' Profiles" icon={<FaChild />} />
              <NavItem to="/portal/ai-stylist" label="AI Stylist" icon={<FaRobot />} />
            </ul>
          </nav>
          <div className="sidebar-footer">
            <div className="user-profile-mini">
               <div className="mini-avatar">
                 {user?.avatar ? (
                   <img src={user.avatar} alt={user.name} />
                 ) : (
                   <img src="https://i.pravatar.cc/150?u=sarah" alt="User" />
                 )}
               </div>
               <div className="mini-info">
                  <span className="mini-name">{user?.name || 'User'}</span>
                  <span className="mini-role">{user?.loyaltyTier || (user?.role === 'Customer' ? 'Loyalty Member' : user?.role) || 'Member'}</span>
               </div>
               <button className="mini-logout" onClick={logout} title="Logout">
                 <FaSignOutAlt />
               </button>
            </div>
          </div>
        </aside>
      )}

      {/* Admin Sidebar */}
      {isAdmin && <AdminSidebar />}

      <main className={`dashboard-main ${(isCustomer || isAdmin) ? 'with-sidebar' : ''}`}>
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
      end
    >
      {icon && <span className="nav-icon">{icon}</span>}
      <span className="nav-label">{label}</span>
    </NavLink>
  );
}

function NavButton({ onClick, label }) {
  return (
    <button className="nav-item" onClick={onClick}>
      {label}
    </button>
  );
}