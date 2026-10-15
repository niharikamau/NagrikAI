import React, { useState, useEffect } from 'react';
import { Plus, Clock, FileText, CheckCircle2, ChevronRight, Bell, AlertTriangle } from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

export default function Dashboard({ setActiveTab, setSelectedComplaintId }) {
  const [stats, setStats] = useState({ total: 0, review: 0, progress: 0, resolved: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const complaints = mockDb.getComplaints();
    const notifs = mockDb.getNotifications().slice(0, 3); // top 3 for feed
    
    const calculatedStats = complaints.reduce(
      (acc, c) => {
        acc.total += 1;
        if (c.status === 'Under Review') acc.review += 1;
        if (c.status === 'In Progress') acc.progress += 1;
        if (c.status === 'Resolved') acc.resolved += 1;
        return acc;
      },
      { total: 0, review: 0, progress: 0, resolved: 0 }
    );

    setStats(calculatedStats);
    setRecentComplaints(complaints.slice(0, 3));
    setNotifications(notifs);
  }, []);

  const handleViewComplaint = (id) => {
    setSelectedComplaintId(id);
    setActiveTab('complaint-details');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Under Review': return 'badge badge-review';
      case 'In Progress': return 'badge badge-progress';
      case 'Resolved': return 'badge badge-resolved';
      default: return 'badge';
    }
  };

  return (
    <div className="dashboard-container container animate-fade-in">
      {/* Welcome Banner */}
      <header className="dashboard-welcome glass-card">
        <div className="welcome-text">
          <h2>Welcome, Citizen Portal Hub</h2>
          <p>Report neighborhood concerns and track municipal accountability, all in one place.</p>
        </div>
        <button className="btn-primary" onClick={() => setActiveTab('file-complaint')}>
          <Plus size={18} />
          <span>File Complaint</span>
        </button>
      </header>

      {/* Metrics Row */}
      <section className="metrics-row">
        <div className="metric-card glass-card">
          <div className="metric-icon total">
            <FileText size={20} />
          </div>
          <div className="metric-details">
            <span className="metric-value">{stats.total}</span>
            <span className="metric-label">Total Reports Filed</span>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon review">
            <Clock size={20} />
          </div>
          <div className="metric-details">
            <span className="metric-value">{stats.review}</span>
            <span className="metric-label">Under Review</span>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon progress">
            <Clock size={20} />
          </div>
          <div className="metric-details">
            <span className="metric-value">{stats.progress}</span>
            <span className="metric-label">In Progress</span>
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-icon resolved">
            <CheckCircle2 size={20} />
          </div>
          <div className="metric-details">
            <span className="metric-value">{stats.resolved}</span>
            <span className="metric-label">Resolved Issues</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Recent Complaints + Notifications */}
      <div className="dashboard-grid">
        {/* Left Side: Recent Complaints */}
        <div className="dashboard-left-panel glass-card">
          <div className="panel-header">
            <h3>Recent Complaints</h3>
            <button className="btn-text" onClick={() => setActiveTab('my-complaints')}>
              <span>View all</span>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="dashboard-complaints-list">
            {recentComplaints.length === 0 ? (
              <div className="empty-panel-message">
                <p>No complaints reported yet.</p>
                <button className="btn-secondary" onClick={() => setActiveTab('file-complaint')}>
                  File your first report
                </button>
              </div>
            ) : (
              recentComplaints.map(c => (
                <div key={c.id} className="dashboard-complaint-row" onClick={() => handleViewComplaint(c.id)}>
                  <div className="row-meta">
                    <span className="complaint-id">#{c.id}</span>
                    <span className={getStatusBadgeClass(c.status)}>{c.status}</span>
                  </div>
                  <h4>{c.title}</h4>
                  <div className="row-footer">
                    <span className="category-tag">{c.category}</span>
                    <span className="submission-date">Filed: {c.submittedDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Notifications Activity */}
        <div className="dashboard-right-panel glass-card">
          <div className="panel-header">
            <h3>Recent Activity</h3>
            <span className="activity-bell"><Bell size={18} /></span>
          </div>

          <div className="dashboard-notifications-list">
            {notifications.length === 0 ? (
              <p className="no-activity">No recent activities.</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`activity-row ${n.unread ? 'unread' : ''}`}>
                  <div className={`activity-status-dot ${n.type}`}></div>
                  <div className="activity-details">
                    <p className="activity-message">{n.message}</p>
                    <span className="activity-time">{n.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
