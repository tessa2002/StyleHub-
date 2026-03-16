import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './IncomingOrders.css';

const IncomingOrders = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [newOrders, setNewOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('pending');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [stats, setStats] = useState({
    completedThisMonth: 0,
    pendingRequests: 0,
    efficiency: 85
  });

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, activeFilter]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders/assigned');
      const allOrders = response.data.orders || response.data || [];
      setOrders(allOrders);
      
      // Calculate stats
      const pending = allOrders.filter(o => 
        ['Assigned', 'Pending', 'Order Placed'].includes(o.status)
      ).length;
      
      setStats(prev => ({
        ...prev,
        pendingRequests: pending
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    
    switch(activeFilter) {
      case 'pending':
        filtered = orders.filter(o => ['Assigned', 'Pending', 'Order Placed'].includes(o.status));
        break;
      case 'cutting':
        filtered = orders.filter(o => o.status === 'Cutting');
        break;
      case 'stitching':
        filtered = orders.filter(o => o.status === 'Stitching');
        break;
      case 'fitting':
        filtered = orders.filter(o => o.status === 'Fitting');
        break;
      case 'completed':
        filtered = orders.filter(o => o.status === 'Completed');
        break;
      case 'all':
        // All orders EXCEPT completed ones
        filtered = orders.filter(o => o.status !== 'Completed');
        break;
      default:
        // Default shows all non-completed orders
        filtered = orders.filter(o => o.status !== 'Completed');
    }
    
    setFilteredOrders(filtered);
  };

  const handleAcceptOrder = async (orderId) => {
    if (!window.confirm('Accept this order?')) return;
    
    try {
      // Try tailor-specific endpoint first
      await axios.put(`/api/tailor/orders/${orderId}/status`, { status: 'In Progress' });
      alert('✅ Order accepted!');
      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      // Try alternative endpoint
      try {
        await axios.put(`/api/orders/${orderId}/status`, { status: 'In Progress' });
        alert('✅ Order accepted!');
        fetchOrders();
      } catch (err) {
        console.error('Error with alternative endpoint:', err);
        alert('Failed to accept order');
      }
    }
  };

  const handleMarkStage = async (orderId, stage) => {
    try {
      // Try tailor-specific endpoint first
      await axios.put(`/api/tailor/orders/${orderId}/status`, { status: stage });
      alert(`✅ Marked as ${stage}!`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating stage:', error);
      // Try alternative endpoint
      try {
        await axios.put(`/api/orders/${orderId}/status`, { status: stage });
        alert(`✅ Marked as ${stage}!`);
        fetchOrders();
      } catch (err) {
        console.error('Error with alternative endpoint:', err);
        alert('Failed to update stage');
      }
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/dashboard/tailor/order/${order._id}`, { 
      state: { orderData: order }
    });
  };

  const getInitials = (name) => {
    if (!name) return 'NA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getWorkflowProgress = (status) => {
    const stages = ['Cutting', 'Stitching', 'Fitting', 'Completed'];
    const currentIndex = stages.indexOf(status);
    return stages.map((stage, index) => index <= currentIndex);
  };

  const formatDeadline = (dateString) => {
    if (!dateString) return 'Unassigned';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light">
        <div className="text-slate-400">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light font-display">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/10 bg-white px-10 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-primary cursor-pointer" onClick={() => navigate('/dashboard/tailor')}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined">straighten</span>
            </div>
            <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-[-0.015em]">TailorMaster</h2>
          </div>
          <label className="flex flex-col min-w-64 !h-11">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
              <div className="text-primary/60 flex border-none bg-primary/5 items-center justify-center pl-4 rounded-l-xl">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input 
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-xl text-slate-900 focus:outline-0 focus:ring-0 border-none bg-primary/5 focus:border-none h-full placeholder:text-primary/40 px-4 pl-2 text-base font-normal leading-normal" 
                placeholder="Search orders or clients..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </label>
        </div>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <nav className="flex items-center gap-8 mr-4">
            <a className="text-primary font-bold text-sm leading-normal border-b-2 border-primary pb-1 cursor-pointer">Orders</a>
            <a className="text-slate-600 text-sm font-medium leading-normal hover:text-primary transition-colors cursor-pointer">Inventory</a>
            <a className="text-slate-600 text-sm font-medium leading-normal hover:text-primary transition-colors cursor-pointer">Customers</a>
            <a className="text-slate-600 text-sm font-medium leading-normal hover:text-primary transition-colors cursor-pointer">Schedule</a>
          </nav>
          <div className="flex gap-3">
            <button className="flex items-center justify-center rounded-xl w-10 h-10 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="flex items-center justify-center rounded-xl w-10 h-10 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div className="relative">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors"
              style={{backgroundImage: `url('https://ui-avatars.com/api/?name=${user?.name || 'Tailor'}&background=ee3a6a&color=fff')`}}
              onClick={() => setShowUserMenu(!showUserMenu)}
            ></div>
            
            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-primary/10 py-2 z-50">
                <div className="px-4 py-2 border-b border-primary/10">
                  <p className="text-sm font-bold text-slate-900">{user?.name || 'Tailor'}</p>
                  <p className="text-xs text-slate-500">{user?.email || ''}</p>
                </div>
                <button 
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-primary/5 flex items-center gap-2 transition-colors"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard/tailor');
                  }}
                >
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  Dashboard
                </button>
                <button 
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-primary/5 flex items-center gap-2 transition-colors"
                  onClick={() => {
                    setShowUserMenu(false);
                  }}
                >
                  <span className="material-symbols-outlined text-lg">person</span>
                  Profile
                </button>
                <div className="border-t border-primary/10 my-1"></div>
                <button 
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                  onClick={handleLogout}
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 px-10 py-8 gap-8">
        {/* Sidebar */}
        <aside className="w-72 flex flex-col gap-6">
          <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm">
            <h3 className="text-slate-900 text-lg font-bold mb-4">My Stats</h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-primary/60 text-xs font-bold uppercase tracking-wider">Completed this month</p>
                <p className="text-primary text-3xl font-black mt-1">{stats.completedThisMonth}</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-primary/60 text-xs font-bold uppercase tracking-wider">Pending Requests</p>
                <p className="text-primary text-3xl font-black mt-1">{stats.pendingRequests.toString().padStart(2, '0')}</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-primary/60 text-xs font-bold uppercase tracking-wider">Total Efficiency</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-white rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{width: `${stats.efficiency}%`}}></div>
                  </div>
                  <span className="text-primary font-bold text-sm">{stats.efficiency}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-primary/10 shadow-sm">
            <h3 className="text-slate-900 text-sm font-bold mb-3 uppercase tracking-wider">Priority Deadlines</h3>
            <div className="space-y-3">
              {filteredOrders.slice(0, 2).map((order) => (
                <div key={order._id} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-slate-600 text-sm">#{order._id.slice(-4)} (Tomorrow)</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em]">Tailor Queue</h1>
              <p className="text-slate-500 text-base font-normal">Manage new requests and current production workflow</p>
            </div>
            <button 
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-6 bg-primary text-white text-sm font-bold transition-transform active:scale-95"
              onClick={() => navigate('/portal/orders/new')}
            >
              <span className="material-symbols-outlined mr-2">add</span>
              <span>New Order</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 bg-white p-2 rounded-xl border border-primary/10 shadow-sm flex-wrap">
            <button 
              className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium ${activeFilter === 'all' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
              onClick={() => setActiveFilter('all')}
            >
              <span>All Orders</span>
            </button>
            <button 
              className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 text-sm ${activeFilter === 'pending' ? 'bg-primary text-white font-bold shadow-md shadow-primary/20' : 'bg-primary/5 text-primary font-medium hover:bg-primary/10'}`}
              onClick={() => setActiveFilter('pending')}
            >
              <span className="material-symbols-outlined text-sm">notification_important</span>
              <span>Pending Requests</span>
            </button>
            <button 
              className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium ${activeFilter === 'cutting' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
              onClick={() => setActiveFilter('cutting')}
            >
              <span className="material-symbols-outlined text-sm">content_cut</span>
              <span>Cutting</span>
            </button>
            <button 
              className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium ${activeFilter === 'stitching' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
              onClick={() => setActiveFilter('stitching')}
            >
              <span className="material-symbols-outlined text-sm">checkroom</span>
              <span>Stitching</span>
            </button>
            <button 
              className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium ${activeFilter === 'fitting' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
              onClick={() => setActiveFilter('fitting')}
            >
              <span className="material-symbols-outlined text-sm">accessibility_new</span>
              <span>Fitting</span>
            </button>
            <button 
              className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium ${activeFilter === 'completed' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
              onClick={() => setActiveFilter('completed')}
            >
              <span className="material-symbols-outlined text-sm">verified</span>
              <span>Completed</span>
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-6 py-4 text-primary font-bold text-sm uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-primary font-bold text-sm uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-primary font-bold text-sm uppercase tracking-wider">Garment</th>
                  <th className="px-6 py-4 text-primary font-bold text-sm uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-4 text-primary font-bold text-sm uppercase tracking-wider">Workflow / Stage</th>
                  <th className="px-6 py-4 text-primary font-bold text-sm uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => {
                    const isUnassigned = ['Assigned', 'Pending', 'Order Placed'].includes(order.status);
                    const progress = getWorkflowProgress(order.status);
                    
                    return (
                      <tr 
                        key={order._id} 
                        className={`hover:bg-primary/5 transition-colors ${index % 2 === 0 ? 'bg-primary/[0.02]' : ''}`}
                      >
                        <td className="px-6 py-6 font-bold text-slate-900">#{order._id.slice(-4)}</td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isUnassigned ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
                              {getInitials(order.customer?.name || order.customerName)}
                            </div>
                            <span className="text-slate-700 font-medium">{order.customer?.name || order.customerName || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-slate-600">{order.itemType || 'Custom Order'}</td>
                        <td className={`px-6 py-6 font-bold ${isUnassigned ? 'text-primary italic' : 'text-slate-500'}`}>
                          {isUnassigned ? 'Unassigned' : formatDeadline(order.expectedDelivery || order.deliveryDate)}
                        </td>
                        <td className="px-6 py-6">
                          {isUnassigned ? (
                            <button 
                              className="w-full px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg text-white"
                              style={{backgroundColor: '#ee3a6a'}}
                              onClick={() => handleAcceptOrder(order._id)}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#d63359'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = '#ee3a6a'}
                            >
                              <span className="material-symbols-outlined text-lg">check_circle</span>
                              Accept Job
                            </button>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                  <div 
                                    key={i}
                                    className="h-1.5 flex-1 rounded-full"
                                    style={{backgroundColor: progress[i] ? '#ee3a6a' : 'rgba(238, 58, 106, 0.2)'}}
                                  ></div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase" style={{color: '#ee3a6a'}}>
                                  {order.status === 'Cutting' ? 'Cutting Done?' : 
                                   order.status === 'Stitching' ? 'Stitching Done?' : 
                                   order.status === 'Fitting' ? 'Fitting Done?' : 'Complete?'}
                                </span>
                                <button 
                                  className="px-2 py-0.5 rounded text-white text-[10px] font-bold"
                                  style={{backgroundColor: '#ee3a6a'}}
                                  onClick={() => {
                                    const nextStage = order.status === 'Cutting' ? 'Stitching' : 
                                                     order.status === 'Stitching' ? 'Fitting' : 
                                                     order.status === 'Fitting' ? 'Completed' : 'Completed';
                                    handleMarkStage(order._id, nextStage);
                                  }}
                                >
                                  Mark {order.status === 'Cutting' ? 'Cutting' : 
                                        order.status === 'Stitching' ? 'Stitching' : 
                                        order.status === 'Fitting' ? 'Fitting' : 'Done'}
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-2">
                            {!isUnassigned && (
                              <a 
                                className="text-primary hover:underline text-sm font-bold flex items-center gap-1 cursor-pointer"
                                onClick={() => handleViewOrder(order)}
                              >
                                <span className="material-symbols-outlined text-sm">straighten</span>
                                Measurements
                              </a>
                            )}
                            <a 
                              className="text-primary hover:underline text-sm font-bold flex items-center gap-1 cursor-pointer"
                              onClick={() => handleViewOrder(order)}
                            >
                              <span className="material-symbols-outlined text-sm">{isUnassigned ? 'visibility' : 'palette'}</span>
                              View Specs
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="px-6 py-4 bg-primary/5 border-t border-primary/10 flex justify-between items-center">
              <span className="text-slate-500 text-sm font-medium">
                Showing {filteredOrders.length} of {orders.length} orders
              </span>
              <div className="flex gap-2">
                <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IncomingOrders;
