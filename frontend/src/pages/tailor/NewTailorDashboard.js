import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './NewTailorDashboard.css';

const NewTailorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [newOrders, setNewOrders] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders/assigned');
      const allOrders = response.data.orders || response.data || [];
      
      // Split orders
      const newOnes = allOrders.filter(order => 
        ['Assigned', 'Pending', 'Order Placed'].includes(order.status)
      ).slice(0, 3);
      
      const activeOnes = allOrders.filter(order => 
        ['In Progress', 'Cutting', 'Stitching', 'Finishing'].includes(order.status)
      );
      
      setOrders(allOrders);
      setNewOrders(newOnes);
      setActiveProjects(activeOnes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (orderId) => {
    if (!window.confirm('Accept this job?')) return;
    
    try {
      await axios.put(`/api/orders/${orderId}/accept`);
      alert('✅ Job accepted!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error accepting job:', error);
      alert('Failed to accept job');
    }
  };

  const handleViewOrder = (order) => {
    navigate(`/dashboard/tailor/order/${order._id}`, { 
      state: { orderData: order }
    });
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return 'Not Set';
    const date = new Date(dateString);
    const daysUntil = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
    return `Due in ${daysUntil} Days`;
  };

  const getPriorityBadge = (order) => {
    const dueDate = new Date(order.expectedDelivery || order.deliveryDate);
    const daysUntil = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 7) return { label: 'High', class: 'text-[10px] font-extrabold text-primary border border-primary/30 px-3 py-1.5 rounded-full tracking-widest uppercase bg-white' };
    return { label: 'Normal', class: 'text-[10px] font-extrabold text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full tracking-widest uppercase bg-white' };
  };

  const getStageClasses = (status) => {
    const stages = {
      'Cutting': { cutting: true, stitching: false, finishing: false },
      'Stitching': { cutting: true, stitching: true, finishing: false },
      'Finishing': { cutting: true, stitching: true, finishing: true },
      'In Progress': { cutting: true, stitching: false, finishing: false }
    };
    return stages[status] || { cutting: false, stitching: false, finishing: false };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-full z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF3366] flex items-center justify-center text-white shadow-lg shadow-[#FF3366]/20">
            <span className="material-symbols-outlined text-2xl">apparel</span>
          </div>
          <div>
            <h1 className="text-[#FF3366] font-extrabold text-xl leading-tight tracking-tight">TailorMaster</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Production Pro</p>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-2">
          <a className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#FF3366] text-white font-semibold shadow-lg shadow-[#FF3366]/25" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a 
            className="flex items-center gap-3 px-5 py-3 rounded-xl text-slate-400 hover:text-[#FF3366] transition-all font-medium cursor-pointer" 
            onClick={() => navigate('/dashboard/tailor/new-orders')}
          >
            <span className="material-symbols-outlined">notifications_active</span>
            <span>New Orders</span>
            {newOrders.length > 0 && (
              <span className="ml-auto bg-[#FF3366] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {newOrders.length}
              </span>
            )}
          </a>
          <a 
            className="flex items-center gap-3 px-5 py-3 rounded-xl text-slate-400 hover:text-[#FF3366] transition-all font-medium cursor-pointer"
            href="#"
          >
            <span className="material-symbols-outlined">straighten</span>
            <span>Measurements</span>
          </a>
          <a className="flex items-center gap-3 px-5 py-3 rounded-xl text-slate-400 hover:text-[#FF3366] transition-all font-medium cursor-pointer" href="#">
            <span className="material-symbols-outlined">person</span>
            <span>Profile</span>
          </a>
          <a className="flex items-center gap-3 px-5 py-3 rounded-xl text-slate-400 hover:text-[#FF3366] transition-all font-medium cursor-pointer" href="#">
            <span className="material-symbols-outlined">inventory_2</span>
            <span>Inventory</span>
          </a>
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-[#FF3366]/20 transition-colors">
            <div 
              className="w-10 h-10 rounded-full bg-cover bg-center ring-2 ring-[#FF3366]/10"
              style={{backgroundImage: `url('https://ui-avatars.com/api/?name=${user?.name || 'Tailor'}&background=FF3366&color=fff')`}}
            ></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Master Tailor'}</p>
              <p className="text-xs text-slate-400 truncate">Master Tailor</p>
            </div>
            <span className="material-symbols-outlined text-slate-300 text-sm hover:text-[#FF3366] cursor-pointer transition-colors">settings</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header */}
        <header className="h-24 flex items-center justify-between px-10 bg-white border-b border-slate-50">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Production Dashboard</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-300 group-focus-within:text-[#FF3366] transition-colors">
                <span className="material-symbols-outlined text-xl">search</span>
              </span>
              <input 
                className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#FF3366]/20 w-80 text-sm placeholder-slate-400 transition-all outline-none" 
                placeholder="Search orders, clients..." 
                type="text"
              />
            </div>
            <button className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-[#FF3366] hover:border-[#FF3366]/20 flex items-center justify-center relative transition-all">
              <span className="material-symbols-outlined">notifications</span>
              {newOrders.length > 0 && (
                <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-[#FF3366] rounded-full border-2 border-white"></span>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          {/* Today's Schedule */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Today's Schedule</h3>
              <button className="text-[#FF3366] text-sm font-bold hover:underline px-2 py-1">View Calendar</button>
            </div>
            <div className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2">
              <div className="min-w-[300px] bg-white border border-slate-100 rounded-2xl p-5 flex gap-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
                  <span className="text-sm font-extrabold text-[#FF3366]">10:00</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">AM</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-lg">Maria Gonzalez</h4>
                  <p className="text-sm text-slate-500">Final Trial • Wedding Gown</p>
                  <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full border border-[#FF3366]/20 bg-white text-[10px] font-extrabold text-[#FF3366] tracking-wider">FITTING ROOM 1</span>
                </div>
              </div>
              <div className="min-w-[300px] bg-white border border-slate-100 rounded-2xl p-5 flex gap-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
                  <span className="text-sm font-extrabold text-[#FF3366]">11:30</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">AM</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-lg">James Lebron</h4>
                  <p className="text-sm text-slate-500">Measurement • Custom Suit</p>
                  <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full border border-[#FF3366]/20 bg-white text-[10px] font-extrabold text-[#FF3366] tracking-wider">ATELIER A</span>
                </div>
              </div>
              <div className="min-w-[300px] bg-white border border-slate-100 rounded-2xl p-5 flex gap-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
                  <span className="text-sm font-extrabold text-[#FF3366]">02:00</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">PM</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-lg">Sarah Kim</h4>
                  <p className="text-sm text-slate-500">First Fitting • Silk Dress</p>
                  <span className="inline-flex items-center mt-3 px-3 py-1 rounded-full border border-[#FF3366]/20 bg-white text-[10px] font-extrabold text-[#FF3366] tracking-wider">FITTING ROOM 2</span>
                </div>
              </div>
            </div>
          </section>

          {/* New Orders */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">New Orders for You</h3>
              <div className="flex gap-2">
                <button className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:text-[#FF3366] hover:border-[#FF3366] transition-all">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-2 rounded-xl bg-[#FF3366] text-white shadow-lg shadow-[#FF3366]/20 hover:brightness-110 transition-all">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newOrders.length === 0 ? (
                <div className="col-span-full text-center py-12 text-slate-400">No new orders</div>
              ) : (
                newOrders.map((order) => {
                  const priority = getPriorityBadge(order);
                  return (
                    <div key={order._id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:border-[#FF3366]/5 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                        <div 
                          className="w-14 h-14 rounded-2xl bg-cover bg-center border-4 border-white shadow-md ring-1 ring-slate-100"
                          style={{backgroundImage: `url('https://ui-avatars.com/api/?name=${order.customer?.name || 'Client'}&background=random')`}}
                        ></div>
                        <span className={priority.class}>Priority: {priority.label}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-xl mb-1">{order.itemType || 'Custom Order'}</h4>
                      <p className="text-sm text-slate-400 mb-6 font-medium">
                        Client: {order.customer?.name || order.customerName || 'Unknown'} • Fabric: {order.fabric?.name || 'Custom'}
                      </p>
                      <div className="flex items-center gap-2 mb-8 text-xs font-bold text-slate-500">
                        <span className="material-symbols-outlined text-lg text-[#FF3366]/60">calendar_today</span>
                        <span>{formatDueDate(order.expectedDelivery || order.deliveryDate)}</span>
                      </div>
                      <button 
                        onClick={() => handleAcceptJob(order._id)}
                        className="w-full py-4 bg-[#FF3366] text-white rounded-2xl font-extrabold text-sm tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#FF3366]/25 uppercase"
                      >
                        ACCEPT JOB
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Active Projects */}
          <section className="pb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">My Active Projects</h3>
              <span className="text-[11px] font-extrabold border border-[#FF3366]/20 text-[#FF3366] px-4 py-1.5 rounded-full tracking-wider bg-white">
                {activeProjects.length} PROJECTS IN PROGRESS
              </span>
            </div>
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Garment Detail</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest">Deadline</th>
                    <th className="px-8 py-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest w-[450px]">Production Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeProjects.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-8 py-12 text-center text-slate-400">No active projects</td>
                    </tr>
                  ) : (
                    activeProjects.map((project) => {
                      const stages = getStageClasses(project.status);
                      return (
                        <tr 
                          key={project._id} 
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() => handleViewOrder(project)}
                        >
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-[#FF3366]/5 flex items-center justify-center text-[#FF3366] border border-[#FF3366]/10">
                                <span className="material-symbols-outlined text-2xl">checkroom</span>
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-base">{project.itemType || 'Custom Order'}</p>
                                <p className="text-xs text-slate-400 font-medium">
                                  ID: #{project._id.slice(-5)} • Client: {project.customer?.name || project.customerName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-600">
                            {new Date(project.expectedDelivery || project.deliveryDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-1 w-full h-10 p-1 bg-slate-50 rounded-xl">
                              <div className={`flex-1 h-full flex items-center justify-center text-[10px] font-extrabold rounded-lg shadow-sm cursor-pointer ${stages.cutting ? 'bg-[#FF3366] text-white hover:brightness-110' : 'bg-white text-slate-300 hover:text-[#FF3366]'} transition-colors`}>
                                CUTTING
                              </div>
                              <div className={`flex-1 h-full flex items-center justify-center text-[10px] font-extrabold rounded-lg shadow-sm cursor-pointer ${stages.stitching ? 'bg-[#FF3366] text-white hover:brightness-110' : 'bg-white text-slate-300 hover:text-[#FF3366]'} transition-colors`}>
                                STITCHING
                              </div>
                              <div className={`flex-1 h-full flex items-center justify-center text-[10px] font-extrabold rounded-lg shadow-sm cursor-pointer ${stages.finishing ? 'bg-[#FF3366] text-white hover:brightness-110' : 'bg-white text-slate-300 hover:text-[#FF3366]'} transition-colors`}>
                                FINISHING
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default NewTailorDashboard;
