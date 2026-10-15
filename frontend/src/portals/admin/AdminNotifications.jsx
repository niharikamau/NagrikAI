import React from 'react';
import { 
  Bell, 
  Check
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

export default function AdminNotifications({ notifications, onRefresh, setActiveAdminTab }) {
  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    mockDb.markAdminNotificationsRead();
    onRefresh();
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'urgent':
        return <div className="admin-notif-bell urgent">🔔</div>;
      case 'warning':
        return <div className="admin-notif-bell warning">⚠️</div>;
      case 'update':
        return <div className="admin-notif-bell update">ℹ️</div>;
      default:
        return <div className="admin-notif-bell update">🔔</div>;
    }
  };

  const handleActionClick = (notif) => {
    if (notif.message.includes('Complaint #')) {
      setActiveAdminTab('complaints');
    } else if (notif.message.includes('Sensor') || notif.message.includes('IoT')) {
      setActiveAdminTab('iot-monitoring');
    }
  };

  return (
    <div className="admin-section-content animate-fade-in">
      <div className="admin-header-row">
        <div>
          <h1>Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button className="admin-btn admin-btn-secondary" onClick={handleMarkAllRead}>
            <Check size={16} />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Activity Feed ({notifications.length})</h3>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="admin-notif-feed">
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <Bell size={32} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <p>All caught up! No notifications pending review.</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`admin-notif-item ${notif.unread ? 'unread' : ''}`}
                onClick={() => handleActionClick(notif)}
                style={{ cursor: 'pointer' }}
              >
                {getNotifIcon(notif.type)}
                <div className="admin-notif-content">
                  <div className="admin-notif-title">{notif.title}</div>
                  <div className="admin-notif-msg">{notif.message}</div>
                  <div className="admin-notif-time">{notif.time}</div>
                </div>
                {notif.unread && (
                  <span className="admin-badge critical" style={{ fontSize: '0.68rem' }}>New</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
