import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  UserCheck, 
  Radio, 
  Bell, 
  User, 
  Zap, 
  LogOut
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';
import AdminDashboard from './AdminDashboard';
import AdminComplaintManagement from './AdminComplaintManagement';
import AdminOfficialManagement from './AdminOfficialManagement';
import AdminCitizenManagement from './AdminCitizenManagement';
import AdminIoTMonitoring from './AdminIoTMonitoring';
import AdminNotifications from './AdminNotifications';
import AdminProfile from './AdminProfile';
import AdminAIMonitoring from './AdminAIMonitoring';
import './admin.css';

export default function AdminPortal({ currentUser, onLogout, onProfileUpdate }) {
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  
  // Data state
  const [complaints, setComplaints] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [detectedEvents, setDetectedEvents] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);

  // Selected item modal pointers
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);

  // Sync data
  const refreshAllData = () => {
    setComplaints(mockDb.getComplaints());
    setOfficials(mockDb.getOfficials());
    setCitizens(mockDb.getCitizens());
    setSensors(mockDb.getSensors());
    setDetectedEvents(mockDb.getDetectedEvents());
    setAiLogs(mockDb.getAILogs());
    setAdminNotifications(mockDb.getAdminNotifications());
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Calculated KPI stats
  const stats = {
    totalComplaints: complaints.length,
    pendingComplaints: complaints.filter(c => c.status === 'Pending' || c.status === 'Under Review').length,
    activeComplaints: complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length,
    resolvedComplaints: complaints.filter(c => c.status === 'Resolved').length,
    activeSensors: sensors.filter(s => s.status === 'Online').length,
    iotAlerts: detectedEvents.length
  };

  const unreadNotifsCount = adminNotifications.filter(n => n.unread).length;

  // Cross navigation handlers
  const handleSelectComplaintFromElsewhere = (complaint) => {
    setSelectedComplaint(complaint);
    setActiveAdminTab('complaints');
  };

  const handleSelectSensorFromElsewhere = (sensor) => {
    setSelectedSensor(sensor);
    setActiveAdminTab('iot-monitoring');
  };

  const renderActiveSection = () => {
    switch (activeAdminTab) {
      case 'dashboard':
        return (
          <AdminDashboard 
            stats={stats}
            complaints={complaints}
            sensors={sensors}
            detectedEvents={detectedEvents}
            aiLogs={aiLogs}
            setActiveAdminTab={setActiveAdminTab}
            onSelectComplaint={handleSelectComplaintFromElsewhere}
            onSelectSensor={handleSelectSensorFromElsewhere}
          />
        );

      case 'complaints':
        return (
          <AdminComplaintManagement 
            complaints={complaints}
            officials={officials}
            onRefresh={refreshAllData}
            selectedComplaint={selectedComplaint}
            setSelectedComplaint={setSelectedComplaint}
          />
        );

      case 'officials':
        return (
          <AdminOfficialManagement 
            officials={officials}
            complaints={complaints}
            onRefresh={refreshAllData}
          />
        );

      case 'citizens':
        return (
          <AdminCitizenManagement 
            citizens={citizens}
            complaints={complaints}
            onSelectComplaintFromCitizen={handleSelectComplaintFromElsewhere}
          />
        );

      case 'iot-monitoring':
        return (
          <AdminIoTMonitoring 
            sensors={sensors}
            detectedEvents={detectedEvents}
            onRefresh={refreshAllData}
            selectedSensor={selectedSensor}
            setSelectedSensor={setSelectedSensor}
          />
        );

      case 'notifications':
        return (
          <AdminNotifications 
            notifications={adminNotifications}
            onRefresh={refreshAllData}
            setActiveAdminTab={setActiveAdminTab}
          />
        );

      case 'profile':
        return (
          <AdminProfile 
            currentUser={currentUser}
            onProfileUpdate={onProfileUpdate}
            onLogout={onLogout}
          />
        );

      case 'ai-monitoring':
        return (
          <AdminAIMonitoring 
            aiLogs={aiLogs}
          />
        );

      default:
        return (
          <AdminDashboard 
            stats={stats}
            complaints={complaints}
            sensors={sensors}
            detectedEvents={detectedEvents}
            aiLogs={aiLogs}
            setActiveAdminTab={setActiveAdminTab}
            onSelectComplaint={handleSelectComplaintFromElsewhere}
            onSelectSensor={handleSelectSensorFromElsewhere}
          />
        );
    }
  };

  return (
    <div className="admin-layout">
      {/* Enterprise Sidebar */}
      <aside className="admin-sidebar">
          <nav className="admin-nav-menu" style={{ paddingTop: '20px' }}>
            <div className="admin-menu-label">Operational Hub</div>
            
            <button 
              className={`admin-nav-item ${activeAdminTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveAdminTab('dashboard'); setSelectedComplaint(null); }}
            >
              <div className="admin-nav-item-left">
                <LayoutDashboard size={18} />
                <span>Admin Dashboard</span>
              </div>
            </button>

            <button 
              className={`admin-nav-item ${activeAdminTab === 'complaints' ? 'active' : ''}`}
              onClick={() => setActiveAdminTab('complaints')}
            >
              <div className="admin-nav-item-left">
                <FileText size={18} />
                <span>Complaints</span>
              </div>
            </button>

            <button 
              className={`admin-nav-item ${activeAdminTab === 'officials' ? 'active' : ''}`}
              onClick={() => setActiveAdminTab('officials')}
            >
              <div className="admin-nav-item-left">
                <UserCheck size={18} />
                <span>Officials</span>
              </div>
            </button>

            <button 
              className={`admin-nav-item ${activeAdminTab === 'citizens' ? 'active' : ''}`}
              onClick={() => setActiveAdminTab('citizens')}
            >
              <div className="admin-nav-item-left">
                <Users size={18} />
                <span>Citizens</span>
              </div>
            </button>

            <button 
              className={`admin-nav-item ${activeAdminTab === 'iot-monitoring' ? 'active' : ''}`}
              onClick={() => setActiveAdminTab('iot-monitoring')}
            >
              <div className="admin-nav-item-left">
                <Radio size={18} />
                <span>IoT Monitoring</span>
              </div>
            </button>

            <div className="admin-menu-label">System & AI</div>

            <button 
              className={`admin-nav-item ${activeAdminTab === 'ai-monitoring' ? 'active' : ''}`}
              onClick={() => setActiveAdminTab('ai-monitoring')}
            >
              <div className="admin-nav-item-left">
                <Zap size={18} />
                <span>AI Monitoring</span>
              </div>
            </button>

            <button 
              className={`admin-nav-item ${activeAdminTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveAdminTab('notifications')}
            >
              <div className="admin-nav-item-left">
                <Bell size={18} />
                <span>Notifications</span>
              </div>
              {/* Only Notifications keeps the bubble badge */}
              {unreadNotifsCount > 0 && (
                <span className="admin-nav-badge">{unreadNotifsCount}</span>
              )}
            </button>

            <button 
              className={`admin-nav-item ${activeAdminTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveAdminTab('profile')}
            >
              <div className="admin-nav-item-left">
                <User size={18} />
                <span>Admin Profile</span>
              </div>
            </button>
          </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-profile-pill" onClick={() => setActiveAdminTab('profile')} style={{ cursor: 'pointer' }}>
            <div className="admin-profile-avatar">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'AD'}
            </div>
            <div className="admin-profile-meta">
              <span className="name">{currentUser?.name || 'Administrator'}</span>
              <span className="role">{currentUser?.email || 'admin@nagrik.ai'}</span>
            </div>
          </div>

          <button className="admin-logout-btn" onClick={onLogout}>
            <LogOut size={15} />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="admin-main-container">
        {renderActiveSection()}
      </main>
    </div>
  );
}
