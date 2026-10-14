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
  //idk wt this is
  const [sensorAlert, setSensorAlert] = useState(null);


  const refreshData = async () => {
    try {
      const token = localStorage.getItem('nagrikai_token');

      if (!token) {
        console.error('No login token found.');
        return;
      }

      const response = await fetch(
        'http://localhost:5000/api/complaints',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch complaints:', data);
        return;
      }

      const allComplaints = Array.isArray(data)
        ? data
        : data.complaints ??
        data.data?.complaints ??
        [];

      setComplaints(allComplaints);

      // Keep your existing mock notifications for now.
      setNotifications(mockDb.getOfficialNotifications());

      // Refresh the selected complaint if it still exists.
      if (selectedComplaint) {
        const selectedId =
          selectedComplaint.id ?? selectedComplaint._id;

        const updated = allComplaints.find(
          complaint =>
            String(complaint.id ?? complaint._id) ===
            String(selectedId)
        );

        if (updated) {
          setSelectedComplaint(updated);
        }
      }
    } catch (error) {
      console.error('Failed to load officer complaints:', error);
    }
  };


  useEffect(() => {
    refreshData();
  }, []);
  useEffect(() => {
    const checkForSensorComplaint = async () => {
      try {
        const token = localStorage.getItem('nagrikai_token');

        const response = await fetch(
          'http://localhost:5000/api/complaints',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error('Failed to fetch complaints:', data);
          return;
        }

        const allComplaints = Array.isArray(data)
          ? data
          : data.complaints ??
          data.data?.complaints ??
          [];

        setComplaints(allComplaints);

        const sensorComplaints = allComplaints.filter(
          complaint => complaint.source === 'Sensor'
        );

        // Nothing to add
        if (sensorComplaints.length === 0) {
          return;
        }

        // Convert every MongoDB sensor complaint into
        // the notification format used by OfficialNotifications.jsx
        const sensorNotifications = sensorComplaints
          .filter(complaint => complaint.id)
          .map(complaint => ({
            id: `sensor-${complaint.id}`,
            type: 'urgent',
            message: `New sensor complaint #${complaint.id} generated.`,
            timestamp: complaint.createdAt
              ? new Date(complaint.createdAt).toLocaleString()
              : '',
            complaintId: complaint.id,
            unread: true
          }));

        // Merge sensor notifications with the existing mock notifications.
        // Existing sensor notifications are replaced with the latest
        // MongoDB version, so refreshing the page does NOT lose them.
        setNotifications(prev => {
          const mockNotifications = prev.filter(
            notification =>
              !String(notification.id).startsWith('sensor-')
          );

          return [
            ...sensorNotifications,
            ...mockNotifications
          ];
        });

        // The API sorts newest complaints first, so this is the newest one.
        const latestComplaint = sensorComplaints.find(
          complaint => complaint.id
        );

        if (!latestComplaint) {
          return;
        }

        const complaintId = latestComplaint.id;

        const lastSeenSensorComplaint =
          localStorage.getItem('last_seen_sensor_complaint');

        // Show the popup only for a genuinely new complaint.
        if (String(complaintId) !== lastSeenSensorComplaint) {

          setSensorAlert({
            source: 'IoT Sensor',
            urgency: latestComplaint.urgency,
            category: latestComplaint.category
          });

          localStorage.setItem(
            'last_seen_sensor_complaint',
            String(complaintId)
          );
        }

      } catch (error) {
        console.error(
          'Sensor complaint check failed:',
          error
        );
      }
    };

    checkForSensorComplaint();

    const interval = setInterval(
      checkForSensorComplaint,
      1000
    );

    return () => clearInterval(interval);
  }, []);



  const unreadNotifCount = notifications.filter(n => n.unread).length;

  const handleSelectComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setActiveTab('complaint-file');
  };

  const handleSelectComplaintById = async (id) => {
    try {
      const token = localStorage.getItem('nagrikai_token');

      const response = await fetch(
        `http://localhost:5000/api/complaints/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch complaint:', data);
        return;
      }

      setSelectedComplaint(data.complaint);
      setActiveTab('complaint-file');

    } catch (error) {
      console.error('Failed to open complaint:', error);
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

        {sensorAlert && (
          <div className="sensor-alert-overlay">
            <div className="sensor-alert-modal">
              <h3>🚨 New Sensor Complaint</h3>

              <p>
                <strong>Source:</strong> {sensorAlert.source}
              </p>

              <p>
                <strong>Urgency:</strong> {sensorAlert.urgency}
              </p>

              <p>
                <strong>Category:</strong> {sensorAlert.category}
              </p>

              <button onClick={() => setSensorAlert(null)}>
                Close
              </button>
            </div>
          </div>
        )}

        {renderContent()}

      </main>
    </div>
  );
}
