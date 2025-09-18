import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import StatusPill from '../../components/StatusPill';
import EmptyState from '../../components/EmptyState';
import { SkeletonCards, SkeletonRow } from '../../components/Skeleton';

const DEFAULTS = { recentOrders: [], upcomingAppointments: [], notifications: [], quickLinks: [] };

export default function PortalDashboard() {
  const [data, setData] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/portal/dashboard');
        setData({ ...DEFAULTS, ...(res.data || {}) });
      } catch (e) {
        setData(DEFAULTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout title="Welcome back" actions={<></>}>
      {/* KPI Cards */}
      {loading ? (
        <SkeletonCards count={4} />
      ) : (
        <div className="cards">
          <div className="card">
            <div className="card-title">Recent Orders</div>
            <div className="card-value">{data.recentOrders?.length ?? 0}</div>
          </div>
          <div className="card">
            <div className="card-title">Upcoming Appointments</div>
            <div className="card-value">{data.upcomingAppointments?.length ?? 0}</div>
          </div>
          <div className="card">
            <div className="card-title">Notifications</div>
            <div className="card-value">{data.notifications?.length ?? 0}</div>
          </div>
          <div className="card">
            <div className="card-title">Active Orders</div>
            <div className="card-value">{data.notifications?.find(n => n.type === 'order') ? data.notifications.find(n => n.type === 'order').message.match(/\d+/)?.[0] : 0}</div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="section">
        <h3 className="section-title">Recent Orders</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Status</th>
              <th>Placed</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {loading && (<>
              <SkeletonRow cols={4} />
              <SkeletonRow cols={4} />
              <SkeletonRow cols={4} />
            </>)}
            {!loading && (data.recentOrders || []).length === 0 && (
              <tr><td colSpan={4}>
                <EmptyState title="No orders yet" subtitle="Place your first order to see it here." />
              </td></tr>
            )}
            {!loading && (data.recentOrders || []).map(o => (
              <tr key={o._id}>
                <td>#{o._id?.slice(-6)}</td>
                <td><StatusPill label={o.status} /></td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-'}</td>
                <td>{typeof o.totalAmount === 'number' ? `₹${o.totalAmount.toFixed(2)}` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upcoming Appointments */}
      <div className="section">
        <h3 className="section-title">Upcoming Appointments</h3>
        {loading ? (
          <SkeletonCards count={2} />
        ) : (
          (data.upcomingAppointments || []).length === 0 ? (
            <EmptyState title="No upcoming appointments" subtitle="Schedule an appointment when you're ready." />
          ) : (
            <div className="cards">
              {(data.upcomingAppointments || []).map(a => (
                <div className="card" key={a._id}>
                  <div className="card-title">{a.service}</div>
                  <div className="card-value" style={{ fontSize: 16, fontWeight: 600 }}>
                    {a.scheduledAt ? new Date(a.scheduledAt).toLocaleString() : '-'}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Notifications */}
      <div className="section">
        <h3 className="section-title">Notifications</h3>
        {loading ? (
          <SkeletonCards count={1} />
        ) : (
          (data.notifications || []).length === 0 ? (
            <EmptyState title="You’re all caught up" subtitle="We’ll notify you when there’s something new." />
          ) : (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {(data.notifications || []).map((n, idx) => (
                <li key={idx}>{n.message}</li>
              ))}
            </ul>
          )
        )}
      </div>

      {/* Quick Links */}
      <div className="section">
        <h3 className="section-title">Quick Links</h3>
        <div className="cards">
          {(data.quickLinks || []).map((q, idx) => (
            <a className="card" key={idx} href={q.path}>
              <div className="card-title">{q.name}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af' }}>Go to {q.name}</div>
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}