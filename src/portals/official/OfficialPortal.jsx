import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Activity, 
  Truck, 
  Bell, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Layers,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';
import OfficialDashboard from './OfficialDashboard';
import OfficialComplaintFile from './OfficialComplaintFile';
import OfficialStatusView from './OfficialStatusView';
import OfficialFieldAction from './OfficialFieldAction';
import OfficialNotifications from './OfficialNotifications';
import OfficialProfile from './OfficialProfile';
import './official.css';

export default function OfficialPortal({ currentUser, onLogout, onProfileUpdate }) {
  // Navigation tab: 'dashboard' | 'complaint-file' | 'status' | 'field-action' | 'notifications' | 'profile'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data state
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const refreshData = () => {
    const allComplaints = mockDb.getComplaints();
    // In official portal, show all assigned complaints or filter to assigned
    setComplaints(allComplaints);
    setNotifications(mockDb.getOfficialNotifications());

    if (selectedComplaint) {
      const updated = allComplaints.find(c => c.id === selectedComplaint.id);
      if (updated) setSelectedComplaint(updated);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const unreadNotifCount = notifications.filter(n => n.unread).length;

  const handleSelectComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setActiveTab('complaint-file');
  };

  const handleSelectComplaintById = (id) => {
    const allComplaints = mockDb.getComplaints();
    const match = allComplaints.find(c => c.id === Number(id));
    if (match) {
      setSelectedComplaint(match);
      setActiveTab('complaint-file');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <OfficialDashboard 
            complaints={complaints}
            currentUser={currentUser}
            onSelectComplaint={handleSelectComplaint}
          />
        );

      case 'complaint-file':
        return (
          <OfficialComplaintFile 
            complaint={selectedComplaint || complaints[0]}
            onBack={() => setActiveTab('dashboard')}
            onRefresh={refreshData}
          />
        );

      case 'status':
        return (
          <OfficialStatusView 
            complaints={complaints}
            onSelectComplaint={handleSelectComplaint}
          />
        );

      case 'field-action':
        return (
          <OfficialFieldAction 
            complaints={complaints}
            onRefresh={refreshData}
          />
        );

      case 'notifications':
        return (
          <OfficialNotifications 
            notifications={notifications}
            onRefresh={refreshData}
            onSelectComplaintById={handleSelectComplaintById}
          />
        );

      case 'profile':
        return (
          <OfficialProfile 
            currentUser={currentUser}
            onProfileUpdate={onProfileUpdate}
            onLogout={onLogout}
          />
        );

      default:
        return (
          <OfficialDashboard 
            complaints={complaints}
            currentUser={currentUser}
            onSelectComplaint={handleSelectComplaint}
          />
        );
    }
  };

  return (
    <div className="official-layout">
      {/* 5) Official Sidebar */}
      <aside className="official-sidebar">
        <nav className="official-nav-menu" style={{ paddingTop: '20px' }}>
          <div className="official-menu-label">Official Console</div>

          <button 
            className={`official-nav-item ${activeTab === 'dashboard' || activeTab === 'complaint-file' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); }}
          >
            <div className="official-nav-item-left">
              <LayoutDashboard size={18} />
              <span>Assigned Complaints</span>
            </div>
          </button>

          <button 
            className={`official-nav-item ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <div className="official-nav-item-left">
              <Activity size={18} />
              <span>Status</span>
            </div>
          </button>

          <button 
            className={`official-nav-item ${activeTab === 'field-action' ? 'active' : ''}`}
            onClick={() => setActiveTab('field-action')}
          >
            <div className="official-nav-item-left">
              <Truck size={18} />
              <span>Field Action</span>
            </div>
          </button>

          <div className="official-menu-label">Communication</div>

          <button 
            className={`official-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <div className="official-nav-item-left">
              <Bell size={18} />
              <span>Notifications</span>
            </div>
            {unreadNotifCount > 0 && (
              <span className="official-nav-badge">{unreadNotifCount}</span>
            )}
          </button>

          <button 
            className={`official-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <div className="official-nav-item-left">
              <User size={18} />
              <span>Official Profile</span>
            </div>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="official-sidebar-footer">
          <div className="official-profile-pill" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
            <div className="official-profile-avatar">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'RS'}
            </div>
            <div className="official-profile-meta">
              <span className="name">{currentUser?.name || 'Rahul Sharma'}</span>
              <span className="dept">{currentUser?.department || 'Water & Drainage'}</span>
            </div>
          </div>

          <button className="official-logout-btn" onClick={onLogout}>
            <LogOut size={15} />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="official-main-container">
        {renderContent()}
      </main>
    </div>
  );
}
