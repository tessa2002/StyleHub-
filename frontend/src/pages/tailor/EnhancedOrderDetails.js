import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './EnhancedOrderDetails.css';

const EnhancedOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [order, setOrder] = useState(location.state?.orderData || null);
  const [loading, setLoading] = useState(!order);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const imageAttachments = Array.isArray(order?.attachments) && order.attachments.length > 0 
    ? order.attachments 
    : (Array.isArray(order?.referenceImages) ? order.referenceImages : []);

  useEffect(() => {
    const needsFetch = !order || !order.attachments || order.attachments.length === 0 || !order.customizations?.embroidery?.imageUrl;
    if (needsFetch) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/${orderId}`);
      const fullOrder = response.data?.order || response.data;
      setOrder(prev => ({ ...(prev || {}), ...(fullOrder || {}) }));
    } catch (error) {
      console.error('Error fetching order:', error);
      if (location.state?.orderData) {
        setOrder(location.state.orderData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStageUpdate = async (newStatus) => {
    const confirmMessage = newStatus === 'Completed' 
      ? 'Mark this order as finished? This will notify the customer and admin.'
      : `Move order to ${newStatus} stage?`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      // Try tailor-specific endpoint first
      await axios.put(`/api/tailor/orders/${orderId}/status`, { status: newStatus });
      
      if (newStatus === 'Completed') {
        alert('✅ Order marked as finished! The customer and admin have been notified.');
        // Navigate back to orders list after completion
        setTimeout(() => {
          navigate('/dashboard/tailor/new-orders');
        }, 1500);
      } else {
        alert(`✅ Order moved to ${newStatus} stage!`);
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Try alternative endpoint
      try {
        await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
        alert(`✅ Order status updated to ${newStatus}!`);
        if (newStatus === 'Completed') {
          setTimeout(() => {
            navigate('/dashboard/tailor/new-orders');
          }, 1500);
        } else {
          fetchOrderDetails();
        }
      } catch (err) {
        console.error('Error with alternative endpoint:', err);
        alert('Failed to update order status. Please try again.');
      }
    }
  };

  const getMeasurementValue = (key) => {
    if (!order?.measurements) return 'N/A';
    return order.measurements[key] || 'N/A';
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light">
        <div className="text-slate-400">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-light">
        <div className="text-slate-400">Order not found</div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-light font-display text-slate-900">
      {/* Top Navigation */}
      <header className="flex items-center justify-between border-b border-primary/10 bg-white px-6 py-4 lg:px-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-primary cursor-pointer" onClick={() => navigate('/dashboard/tailor')}>
            <span className="material-symbols-outlined text-3xl">architecture</span>
            <h1 className="text-xl font-extrabold tracking-tight">TailorFlow</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/dashboard/tailor/new-orders')}>Orders</a>
            <a className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer">Inventory</a>
            <a className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer">Customers</a>
            <a className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer">Reports</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 text-xl">search</span>
            <input 
              className="rounded-full bg-primary/5 border-none pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 w-64 outline-none" 
              placeholder="Search orders..." 
              type="text"
            />
          </div>
          <button className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <div className="relative">
            <div 
              className="w-10 h-10 rounded-full border-2 border-primary/20 bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img 
                className="object-cover w-full h-full" 
                src={`https://ui-avatars.com/api/?name=${user?.name || 'Tailor'}&background=ee3a6a&color=fff`}
                alt="User profile"
              />
            </div>
            
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
                    navigate('/dashboard/tailor/new-orders');
                  }}
                >
                  <span className="material-symbols-outlined text-lg">list_alt</span>
                  Orders
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

      {/* Main Content Area */}
      <main className="flex-1 px-6 py-8 lg:px-20 max-w-[1600px] mx-auto w-full">
        {/* Breadcrumbs & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary/60 text-sm mb-4">
            <span>Orders</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-medium">Order #{order._id?.slice(-5) || 'N/A'}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-black text-slate-900">
                Order #{order._id?.slice(-5) || 'N/A'}: {order.customer?.name || order.customerName || 'Customer'}
              </h2>
              <p className="text-lg text-primary/70 font-medium">
                {order.itemType || 'Custom Garment'} - Technical Specifications
              </p>
            </div>
            <button 
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-primary/20 bg-white hover:bg-primary/5 text-primary font-bold text-sm transition-all shadow-sm"
              onClick={() => navigate('/dashboard/tailor/new-orders')}
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to List
            </button>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-32">
          {/* Left Column: Measurements */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-symbols-outlined">straighten</span>
                <h3 className="font-bold text-lg">Technical Measurements</h3>
              </div>
              <div className="space-y-4">
                {['neck', 'chest', 'waist', 'hip', 'inseam', 'shoulder', 'sleeve'].map((measurement) => (
                  <div key={measurement} className="flex justify-between items-center py-2 border-b border-primary/5">
                    <span className="text-slate-500 font-medium text-sm uppercase tracking-wider">
                      {measurement}
                    </span>
                    <span className="text-primary font-bold">
                      {getMeasurementValue(measurement)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary">accessibility_new</span>
                  <span className="font-bold text-primary text-sm uppercase tracking-wide">Body Profile</span>
                </div>
                <div className="aspect-square bg-white rounded-lg flex items-center justify-center overflow-hidden border border-primary/10 p-4">
                  <span className="material-symbols-outlined text-[100px] text-primary/20">man</span>
                </div>
                <p className="text-xs text-primary/60 mt-3 text-center font-medium">
                  {order.measurements?.bodyType || 'Standard Profile'}
                </p>
              </div>
            </div>
          </div>

          {/* Center Column: Style Specs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-symbols-outlined">style</span>
                <h3 className="font-bold text-lg">Garment Style & Specs</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Fit Type</p>
                  <p className="font-bold text-slate-800">{order.fitType || 'Standard Fit'}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Garment Type</p>
                  <p className="font-bold text-slate-800">{order.itemType || 'Custom'}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Status</p>
                  <p className="font-bold text-slate-800">{order.status || 'Pending'}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Deadline</p>
                  <p className="font-bold text-slate-800">
                    {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'Not Set'}
                  </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Fabric</p>
                  <p className="font-bold text-slate-800">{order.fabric?.name || 'Custom Fabric'}</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mb-1">Color</p>
                  <p className="font-bold text-slate-800">{order.fabric?.color || 'As Selected'}</p>
                </div>
              </div>

              {order.specialInstructions && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Special Requests</h4>
                  <ul className="space-y-2">
                    <li className="flex gap-3 text-sm font-medium text-slate-600">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                      {order.specialInstructions}
                    </li>
                  </ul>
                </div>
              )}

              {order.notes && (
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10 italic text-slate-600 text-sm leading-relaxed">
                  <p>"{order.notes}"</p>
                  <p className="mt-2 text-primary font-bold not-italic">— Customer Note</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Customer Reference */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-primary/5">
              <div className="flex items-center gap-2 mb-6 text-primary">
                <span className="material-symbols-outlined">collections</span>
                <h3 className="font-bold text-lg">Reference Images</h3>
              </div>
              
              {/* Customer Uploaded Reference Images */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Customer Inspiration</h4>
                {imageAttachments && imageAttachments.length > 0 ? (
                  <>
                    <div className="group relative aspect-[4/5] rounded-xl overflow-hidden shadow-md border border-primary/10">
                      <img 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        src={(imageAttachments[0].url || imageAttachments[0])}
                        alt="Primary reference"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop';
                        }}
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white text-xs font-bold uppercase tracking-widest">Primary Inspiration</p>
                      </div>
                    </div>
                    {imageAttachments.length > 1 && (
                      <div className="grid grid-cols-2 gap-4">
                        {imageAttachments.slice(1).map((attachment, index) => (
                          <div key={index} className="aspect-square rounded-lg overflow-hidden border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                            <img 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                              src={attachment.url || attachment}
                              alt={`Reference ${index + 2}`}
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-md border border-primary/10 bg-primary/5 flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-6xl text-primary/30">image</span>
                      <p className="text-sm text-primary/60 mt-2">No reference images</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fabric Image */}
              {order.fabric && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Selected Fabric</h4>
                  {order.fabric.imageUrl ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-primary/10 shadow-sm">
                      <img 
                        className="w-full h-full object-cover" 
                        src={order.fabric.imageUrl}
                        alt={order.fabric.name || 'Fabric'}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden absolute inset-0 bg-primary/5 items-center justify-center">
                        <div className="w-16 h-16 rounded" style={{backgroundColor: order.fabric.color || '#ee3a6a'}}></div>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white text-xs font-bold">{order.fabric.name || 'Custom Fabric'}</p>
                        <p className="text-white/80 text-[10px]">{order.fabric.type || 'Premium Grade'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 border border-primary/10 rounded-lg">
                      <div className="w-12 h-12 rounded flex-shrink-0" style={{backgroundColor: order.fabric.color || '#ee3a6a'}}></div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{order.fabric.name || 'Custom Fabric'}</p>
                        <p className="text-[10px] text-slate-500">{order.fabric.type || 'Premium Grade'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Embroidery Pattern Image */}
              {order.customizations?.embroidery && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Embroidery Pattern</h4>
                  {order.customizations.embroidery.imageUrl ? (
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-primary/10 shadow-sm">
                      <img 
                        className="w-full h-full object-cover" 
                        src={order.customizations.embroidery.imageUrl}
                        alt="Embroidery pattern"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden absolute inset-0 bg-primary/5 items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-primary/30">auto_awesome</span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <p className="text-white text-xs font-bold">
                          {order.customizations.embroidery.pattern || 'Custom Pattern'}
                        </p>
                        <p className="text-white/80 text-[10px]">
                          {order.customizations.embroidery.type || 'Embroidery'} • {order.customizations.embroidery.method || 'Hand'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-primary/10 rounded-lg bg-primary/5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
                        <p className="text-sm font-bold text-slate-800">
                          {order.customizations.embroidery.pattern || 'Custom Pattern'}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600">
                        {order.customizations.embroidery.type || 'Embroidery'} • {order.customizations.embroidery.method || 'Hand'}
                      </p>
                      {order.customizations.embroidery.placement && (
                        <p className="text-xs text-slate-500 mt-1">
                          Placement: {order.customizations.embroidery.placement}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Order Information */}
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-widest">Order Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order ID:</span>
                    <span className="font-bold">#{order._id?.slice(-5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-bold">{order.customer?.name || order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-primary">{order.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Created:</span>
                    <span className="font-bold">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Footer Actions */}
      <footer className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t border-primary/10 py-6 px-6 lg:px-20 z-50">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg text-white"
            style={{backgroundColor: '#ee3a6a'}}
            onClick={() => handleStageUpdate('Cutting')}
            disabled={order.status === 'Cutting' || order.status === 'Stitching' || order.status === 'Fitting' || order.status === 'Completed'}
          >
            <span className="material-symbols-outlined font-bold">content_cut</span>
            Start Cutting
          </button>
          <button 
            className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg text-white"
            style={{backgroundColor: '#ee3a6a'}}
            onClick={() => handleStageUpdate('Stitching')}
            disabled={order.status !== 'Cutting'}
          >
            <span className="material-symbols-outlined font-bold">precision_manufacturing</span>
            Start Stitching
          </button>
          <button 
            className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2 py-4 px-8 rounded-xl font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg text-white"
            style={{backgroundColor: '#ee3a6a'}}
            onClick={() => handleStageUpdate('Completed')}
            disabled={order.status === 'Completed'}
          >
            <span className="material-symbols-outlined font-bold">verified</span>
            Mark as Finished
          </button>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedOrderDetails;
