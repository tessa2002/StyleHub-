import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaTachometerAlt, FaUser, FaShoppingBag, FaCalendarAlt, FaRuler, FaFileInvoiceDollar, FaBell, FaLifeRing, FaCog, FaSignOutAlt } from "react-icons/fa";
import "./CustomerDashboard.css";

export default function CustomerSidebar({ onLogout }) {
  const location = useLocation();
  const [collapsed,setCollapsed] = useState(false);

  const menuItems=[
    {label:"Dashboard",path:"/portal",icon:<FaTachometerAlt/>},
    {label:"Profile",path:"/portal/profile",icon:<FaUser/>},
    {label:"Orders",path:"/portal/orders",icon:<FaShoppingBag/>},
    {label:"Appointments",path:"/portal/appointments",icon:<FaCalendarAlt/>},
    {label:"Measurements",path:"/portal/measurements",icon:<FaRuler/>},
    {label:"Invoices & Payments",path:"/portal/payments",icon:<FaFileInvoiceDollar/>},
    {label:"Notifications",path:"/portal/notifications",icon:<FaBell/>},
    {label:"Support",path:"/portal/support",icon:<FaLifeRing/>},
    {label:"Settings",path:"/portal/settings",icon:<FaCog/>},
    {label:"Logout",path:"/logout",icon:<FaSignOutAlt/>,action:onLogout}
  ];

  return (
    <div className={`sidebar ${collapsed?"collapsed":""}`}>
      <div className="sidebar-header">
        <h2>Style Hub</h2>
        <button className="collapse-btn" onClick={()=>setCollapsed(!collapsed)}>
          {collapsed?"▶":"◀"}
        </button>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item,idx)=>{
          const active = location.pathname.startsWith(item.path);
          return (
            <li key={idx} className={active?"active":""} onClick={item.action||(()=>{})}>
              {item.action ? (
                <span className="menu-item">{item.icon} {!collapsed && <span>{item.label}</span>}</span>
              ) : (
                <Link to={item.path} className="menu-item">{item.icon} {!collapsed && <span>{item.label}</span>}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
