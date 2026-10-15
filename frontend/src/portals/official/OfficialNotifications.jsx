import React from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  FileText 
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

export default function OfficialNotifications({ 
  notifications, 
  onRefresh, 
  onSelectComplaintById 
}) {
  const handleMarkAllRead = () => {
    mockDb.markOfficialNotificationsRead();
    if (onRefresh) onRefresh();
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div className="official-top-banner">
        <div>
          <h1>Notifications</h1>
          <p>Real-time routing alerts, citizen evidence submissions, and escalation notices.</p>
        </div>

        {unreadCount > 0 && (
          <button className="official-btn official-btn-outline official-btn-sm" onClick={handleMarkAllRead}>
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="official-card">
        <div className="official-card-header">
          <h3>
            <Bell size={18} color="#0284c7" />
            <span>RECENT NOTIFICATIONS</span>
          </h3>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <Bell size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p>No notifications at this time.</p>
            </div>
          ) : (
            notifications.map(notif => {
              let iconBg = '#eff6ff';
              let iconColor = '#0284c7';
              if (notif.type === 'urgent') {
                iconBg = '#fef2f2';
                iconColor = '#ef4444';
              } else if (notif.type === 'resolved') {
                iconBg = '#f0fdf4';
                iconColor = '#16a34a';
              } else if (notif.type === 'reassigned') {
                iconBg = '#faf5ff';
                iconColor = '#9333ea';
              }

              return (
                <div 
                  key={notif.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 18px',
                    borderRadius: '8px',
                    backgroundColor: notif.unread ? '#f0f9ff' : '#ffffff',
                    border: `1px solid ${notif.unread ? '#bae6fd' : '#e2e8f0'}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '999px', background: iconBg, color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bell size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: notif.unread ? 700 : 600, color: '#0f172a', fontSize: '0.92rem' }}>
                        {notif.message}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                        {notif.timestamp || notif.time}
                        {notif.complaintId && ` • Complaint #${notif.complaintId}`}
                      </div>
                    </div>
                  </div>

                  {notif.complaintId && (
                    <button 
                      className="official-btn official-btn-secondary official-btn-sm"
                      onClick={() => onSelectComplaintById(notif.complaintId)}
                    >
                      <span>View File</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
