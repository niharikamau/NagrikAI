import React, { useState, useEffect } from 'react';
import { Bell, User, LogOut, CheckCircle2, AlertTriangle, Info, ShieldAlert, Shield } from 'lucide-react';
import { mockDb } from '../utils/mockDb';

export default function Navbar({ activeTab, setActiveTab, currentUser, onLogout, notificationsUpdated }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    setNotifications(mockDb.getNotifications());
  }, [notificationsUpdated, activeTab]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAsRead = () => {
    mockDb.markNotificationsRead();
    setNotifications(mockDb.getNotifications());
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
    if (!showNotifications && unreadCount > 0) {
      handleMarkAsRead();
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'tracking':
        return <CheckCircle2 className="notif-icon tracking" />;
      case 'potential':
        return <AlertTriangle className="notif-icon potential" />;
      case 'official':
        return <ShieldAlert className="notif-icon official" />;
      default:
        return <Info className="notif-icon info" />;
    }
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'admin@nagrik.ai';
  const isOfficial = currentUser?.role === 'official' || currentUser?.email === 'grievance.officer@nagrikai.in' || currentUser?.email === 'rahul@department.gov';
  const showAdminTheme = isAdmin && activeTab === 'admin';
  const showOfficialTheme = isOfficial && activeTab === 'official';

  return (
    <nav className={`navbar-container ${showAdminTheme ? 'admin-navbar' : ''}`}>
      <div className="navbar-content container">
        <div className="navbar-left" onClick={() => setActiveTab(isAdmin ? 'admin' : isOfficial ? 'official' : 'landing')}>
          <div className="logo-badge" style={isOfficial ? { background: '#0284c7' } : {}}>Nagrik</div>
          <span className="logo-text">AI</span>
        </div>

        {currentUser ? (
          <div className="navbar-right">
            {isOfficial ? (
              <div className="nav-links">
                <button 
                  className={`nav-link-btn ${activeTab === 'official' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('official'); setShowNotifications(false); }}
                  style={{ color: '#0284c7', fontWeight: 600 }}
                >
                  <Shield size={15} style={{ display: 'inline', marginRight: '4px' }} />
                  Official Console
                </button>
              </div>
            ) : !isAdmin ? (
              <div className="nav-links">
                <button 
                  className={`nav-link-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('dashboard'); setShowNotifications(false); }}
                >
                  Dashboard
                </button>
                <button 
                  className={`nav-link-btn ${activeTab === 'file-complaint' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('file-complaint'); setShowNotifications(false); }}
                >
                  File Complaint
                </button>
                <button 
                  className={`nav-link-btn ${activeTab === 'my-complaints' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('my-complaints'); setShowNotifications(false); }}
                >
                  My Complaints
                </button>
              </div>
            ) : (
              <div className="nav-links">
                <button 
                  className={`nav-link-btn ${activeTab === 'admin' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('admin'); setShowNotifications(false); }}
                  style={{ color: '#60a5fa', fontWeight: 600 }}
                >
                  <Shield size={15} style={{ display: 'inline', marginRight: '4px' }} />
                  Admin Operations
                </button>
                <button 
                  className={`nav-link-btn ${activeTab === 'landing' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('landing'); setShowNotifications(false); }}
                >
                  Public View
                </button>
              </div>
            )}

            {/* Notification Center for Citizen */}
            {!isAdmin && !isOfficial && (
              <div className="nav-notification-wrapper">
                <button className="nav-icon-btn" onClick={toggleNotifications} title="Notifications">
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>

                {showNotifications && (
                  <div className="notifications-dropdown glass-card animate-scale-in">
                    <div className="notif-header">
                      <h4>Activity Updates</h4>
                      {unreadCount > 0 && (
                        <button className="mark-read-btn" onClick={handleMarkAsRead}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <p className="no-notif">No new notifications</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                            {getNotifIcon(n.type)}
                            <div className="notif-details">
                              <p className="notif-message">{n.message}</p>
                              <span className="notif-time">{n.timestamp}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Dropdown */}
            <div className="nav-profile-wrapper">
              <button 
                className={`nav-profile-btn ${showProfileMenu ? 'active' : ''}`}
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
              >
                <div className="avatar-placeholder" style={isAdmin ? { background: '#2563eb' } : isOfficial ? { background: '#0284c7' } : {}}>
                  {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('') : <User size={16} />}
                </div>
                <span className="username-label">{currentUser.name.split(' ')[0]}</span>
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown glass-card animate-scale-in">
                  <button className="dropdown-item" onClick={() => { setActiveTab(isAdmin ? 'admin' : isOfficial ? 'official' : 'profile'); setShowProfileMenu(false); }}>
                    <User size={16} />
                    <span>{isAdmin ? 'Admin Console' : isOfficial ? 'Official Console' : 'My Profile'}</span>
                  </button>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout" onClick={() => { onLogout(); setShowProfileMenu(false); }}>
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="navbar-right">
            <button className="nav-link-btn" onClick={() => setActiveTab('landing')}>Home</button>
            <button className="btn-secondary" onClick={() => setActiveTab('login')}>Log In</button>
            <button className="btn-primary" onClick={() => setActiveTab('signup')}>Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  );
}
