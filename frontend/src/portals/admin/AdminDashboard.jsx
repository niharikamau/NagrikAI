import React from 'react';
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  Radio, 
  ArrowRight,
  Eye
} from 'lucide-react';

export default function AdminDashboard({ 
  stats, 
  complaints, 
  sensors, 
  detectedEvents, 
  aiLogs, 
  setActiveAdminTab, 
  onSelectComplaint, 
  onSelectSensor 
}) {
  const recentComplaints = complaints.slice(0, 4);
  const recentAlerts = detectedEvents.slice(0, 3);
  const recentAiLogs = aiLogs.slice(0, 4);

  return (
    <div className="admin-section-content animate-fade-in">
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <h1>Good morning, Admin</h1>
        </div>
      </div>

      {/* 6 KPI Status Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card" onClick={() => setActiveAdminTab('complaints')} style={{ cursor: 'pointer' }}>
          <div className="admin-kpi-icon-clean text-blue-400">
            <FileText size={28} />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{stats.totalComplaints}</span>
            <span className="admin-kpi-label">Total Complaints</span>
          </div>
        </div>

        <div className="admin-kpi-card" onClick={() => setActiveAdminTab('complaints')} style={{ cursor: 'pointer' }}>
          <div className="admin-kpi-icon-clean text-amber-400">
            <Clock size={28} />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{stats.pendingComplaints}</span>
            <span className="admin-kpi-label">Pending Review</span>
          </div>
        </div>

        <div className="admin-kpi-card" onClick={() => setActiveAdminTab('complaints')} style={{ cursor: 'pointer' }}>
          <div className="admin-kpi-icon-clean text-yellow-400">
            <Activity size={28} />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{stats.activeComplaints}</span>
            <span className="admin-kpi-label">Active / In Progress</span>
          </div>
        </div>

        <div className="admin-kpi-card" onClick={() => setActiveAdminTab('complaints')} style={{ cursor: 'pointer' }}>
          <div className="admin-kpi-icon-clean text-emerald-400">
            <CheckCircle2 size={28} />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{stats.resolvedComplaints}</span>
            <span className="admin-kpi-label">Resolved Issues</span>
          </div>
        </div>

        <div className="admin-kpi-card" onClick={() => setActiveAdminTab('iot-monitoring')} style={{ cursor: 'pointer' }}>
          <div className="admin-kpi-icon-clean text-cyan-400">
            <Radio size={28} />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{stats.activeSensors}</span>
            <span className="admin-kpi-label">Active IoT Sensors</span>
          </div>
        </div>

        <div className="admin-kpi-card" onClick={() => setActiveAdminTab('iot-monitoring')} style={{ cursor: 'pointer' }}>
          <div className="admin-kpi-icon-clean text-rose-400">
            <AlertCircle size={28} />
          </div>
          <div className="admin-kpi-info">
            <span className="admin-kpi-value">{stats.iotAlerts}</span>
            <span className="admin-kpi-label">IoT Sensor Alerts</span>
          </div>
        </div>
      </div>

      {/* Grid: Complaints & Sensors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        
        {/* Complaints Section */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Complaints</h3>
            <button 
              className="admin-btn admin-btn-outline admin-btn-sm"
              onClick={() => setActiveAdminTab('complaints')}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Issue / Citizen</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.map(c => {
                  const isWithdrawn = c.status === 'Withdrawn';
                  return (
                    <tr key={c.id} className={isWithdrawn ? 'withdrawn-row' : ''}>
                      <td>
                        <strong style={{ color: isWithdrawn ? '#9ca3af' : '#60a5fa' }}>#{c.id}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: isWithdrawn ? '#cbd5e1' : '#ffffff' }}>{c.issue || c.title}</div>
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>By {c.citizenName || 'Citizen'}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: isWithdrawn ? '#9ca3af' : '#cbd5e1' }}>{c.category}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => onSelectComplaint(c)}
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sensors Section */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Sensors</h3>
            <button 
              className="admin-btn admin-btn-outline admin-btn-sm"
              onClick={() => setActiveAdminTab('iot-monitoring')}
            >
              <span>All Sensors</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentAlerts.map(evt => (
              <div 
                key={evt.id} 
                className="admin-inspector-block"
                style={{ borderLeft: evt.status === 'New' ? '3px solid #ef4444' : '3px solid #3b82f6' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>
                    {evt.sensorId} • {evt.eventType}
                  </span>
                  <span className={`admin-badge ${evt.status === 'New' ? 'critical' : 'active'}`}>
                    {evt.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span>Reading: <strong style={{ color: '#f87171' }}>{evt.reading}</strong> (Limit: {evt.threshold})</span>
                  <span>{evt.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Logs Section */}
      <div className="admin-card" style={{ marginTop: '24px' }}>
        <div className="admin-card-header">
          <h3>AI logs</h3>
          <button 
            className="admin-btn admin-btn-outline admin-btn-sm"
            onClick={() => setActiveAdminTab('ai-monitoring')}
          >
            <span>Open AI Console</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Model</th>
                <th>Source</th>
                <th>Target ID</th>
                <th>Task</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAiLogs.map(log => {
                const modelName = log.task === 'Summarization' ? 'Gemini' : 'Hugging Face';
                return (
                  <tr key={log.id}>
                    <td>{log.time}</td>
                    <td>
                      <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
                        {modelName}
                      </span>
                    </td>
                    <td>{log.source}</td>
                    <td><strong style={{ color: '#38bdf8' }}>{log.complaintId}</strong></td>
                    <td>{log.task}</td>
                    <td>
                      <span className={`admin-badge ${log.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {log.status === 'Success' ? '✓ ' : '⚠ '}{log.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
