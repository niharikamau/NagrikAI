import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './portals/citizen/LandingPage';
import Auth from './components/Auth';
import Dashboard from './portals/citizen/Dashboard';
import FileComplaint from './portals/citizen/FileComplaint';
import MyComplaints from './portals/citizen/MyComplaints';
import ComplaintDetails from './portals/citizen/ComplaintDetails';
import UserProfile from './portals/citizen/UserProfile';
import AdminPortal from './portals/admin/AdminPortal';
import OfficialPortal from './portals/official/OfficialPortal';
import { mockDb } from './utils/mockDb';

function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [notifTrigger, setNotifTrigger] = useState(0);

  // Sync user session on mount
  useEffect(() => {
    const user = mockDb.getCurrentUser();
    setCurrentUser(user);
    if (user && (user.role === 'admin' || user.email === 'admin@nagrik.ai')) {
      setActiveTab('admin');
    } else if (user && (user.role === 'official' || user.email === 'grievance.officer@nagrikai.in' || user.email === 'rahul@department.gov')) {
      setActiveTab('official');
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user && (user.role === 'admin' || user.email === 'admin@nagrik.ai')) {
      setActiveTab('admin');
    } else if (user && (user.role === 'official' || user.email === 'grievance.officer@nagrikai.in' || user.email === 'rahul@department.gov')) {
      setActiveTab('official');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    mockDb.logout();
    setCurrentUser(null);
    setActiveTab('landing');
  };

  const triggerNotificationsUpdate = () => {
    setNotifTrigger(prev => prev + 1);
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'admin@nagrik.ai';
  const isOfficial = currentUser?.role === 'official' || currentUser?.email === 'grievance.officer@nagrikai.in' || currentUser?.email === 'rahul@department.gov';

  // Route protection redirect helper
  const renderContent = () => {
    // If Official is logged in
    if (isOfficial && (activeTab === 'official' || activeTab === 'dashboard' || activeTab === 'profile')) {
      return (
        <OfficialPortal 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onProfileUpdate={setCurrentUser} 
        />
      );
    }

    // If Admin is logged in and on admin tab or dashboard
    if (isAdmin && (activeTab === 'admin' || activeTab === 'dashboard' || activeTab === 'profile')) {
      return (
        <AdminPortal 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onProfileUpdate={setCurrentUser} 
        />
      );
    }

    // If not logged in and requesting dashboard/portal pages, force login
    const protectedRoutes = ['dashboard', 'admin', 'official', 'file-complaint', 'my-complaints', 'complaint-details', 'profile'];
    if (protectedRoutes.includes(activeTab) && !currentUser) {
      return (
        <Auth 
          mode="login" 
          setActiveTab={setActiveTab} 
          onLoginSuccess={handleLogin} 
        />
      );
    }

    switch (activeTab) {
      case 'landing':
        return <LandingPage setActiveTab={setActiveTab} currentUser={currentUser} />;
      case 'login':
        return <Auth mode="login" setActiveTab={setActiveTab} onLoginSuccess={handleLogin} />;
      case 'signup':
        return <Auth mode="signup" setActiveTab={setActiveTab} onLoginSuccess={handleLogin} />;
      case 'official':
        return (
          <OfficialPortal 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            onProfileUpdate={setCurrentUser} 
          />
        );
      case 'admin':
        return (
          <AdminPortal 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            onProfileUpdate={setCurrentUser} 
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            setSelectedComplaintId={setSelectedComplaintId} 
          />
        );
      case 'file-complaint':
        return (
          <FileComplaint 
            setActiveTab={setActiveTab} 
            initialEditComplaintId={selectedComplaintId} 
          />
        );
      case 'my-complaints':
        return (
          <MyComplaints 
            setActiveTab={setActiveTab} 
            setSelectedComplaintId={setSelectedComplaintId} 
          />
        );
      case 'complaint-details':
        return (
          <ComplaintDetails 
            activeComplaintId={selectedComplaintId} 
            setActiveTab={setActiveTab} 
            setSelectedComplaintId={setSelectedComplaintId}
            triggerNotificationsUpdate={triggerNotificationsUpdate}
          />
        );
      case 'profile':
        return (
          <UserProfile 
            currentUser={currentUser} 
            onProfileUpdate={setCurrentUser} 
            onLogout={handleLogout} 
          />
        );
      default:
        return <LandingPage setActiveTab={setActiveTab} currentUser={currentUser} />;
    }
  };

  return (
    <div className="app-layout">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        notificationsUpdated={notifTrigger}
      />
      <main className="main-content-area" style={(isAdmin && activeTab === 'admin') || (isOfficial && activeTab === 'official') ? { paddingBottom: 0 } : {}}>
        {renderContent()}
      </main>
      {(!isAdmin || activeTab !== 'admin') && (!isOfficial || activeTab !== 'official') && (
        <footer className="portal-footer">
          <div className="container footer-content">
            <p>&copy; 2026 NagrikAI Portal. All rights reserved.</p>
            <div className="footer-links">
              <button onClick={() => setActiveTab('landing')}>Privacy Policy</button>
              <span>&bull;</span>
              <button onClick={() => setActiveTab('landing')}>Terms of Service</button>
              <span>&bull;</span>
              <button onClick={() => setActiveTab('landing')}>Help Support</button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
