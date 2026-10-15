import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Image, ArrowLeft, BrainCircuit, CheckCircle, ShieldAlert, Sparkles, RefreshCw, Edit3 } from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

const PRESET_MOCK_IMAGE_URLS = {
  'garbage.jpg': 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&auto=format&fit=crop',
  'pothole.jpg': 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=400&auto=format&fit=crop',
  'streetlight.jpg': 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=400&auto=format&fit=crop',
  'leakage.jpg': 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&auto=format&fit=crop'
};

export default function ComplaintDetails({ activeComplaintId, setActiveTab, setSelectedComplaintId, triggerNotificationsUpdate }) {
  const [complaint, setComplaint] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);

  useEffect(() => {
    if (activeComplaintId) {
      const complaints = mockDb.getComplaints();
      const match = complaints.find(c => c.id === activeComplaintId);
      if (match) {
        setComplaint(match);
      }
    }
  }, [activeComplaintId]);

  if (!complaint) {
    return (
      <div className="container details-error-view">
        <p>Loading complaint details...</p>
        <button className="btn-primary" onClick={() => setActiveTab('my-complaints')}>
          Return to List
        </button>
      </div>
    );
  }

  // Developer testing tool to advance the status dynamically in the mock-up
  const handleAdvanceStatus = () => {
    let nextStatus = 'Under Review';
    let note = '';
    
    if (complaint.status === 'Under Review') {
      nextStatus = 'In Progress';
      note = 'Assigned to Municipal Zonal Department. Work crew dispatched to site.';
    } else if (complaint.status === 'In Progress') {
      nextStatus = 'Resolved';
      note = 'Municipal inspector verified remediation work is complete. Closed.';
    } else {
      nextStatus = 'Under Review';
      note = 'Resetting complaint state to verification stage.';
    }

    mockDb.updateComplaintStatus(complaint.id, nextStatus, note);
    
    // Refresh local state
    const complaints = mockDb.getComplaints();
    const match = complaints.find(c => c.id === complaint.id);
    if (match) {
      setComplaint(match);
    }
    triggerNotificationsUpdate();
  };

  const handleEditComplaint = () => {
    setSelectedComplaintId(complaint.id);
    setActiveTab('file-complaint');
  };

  return (
    <div className="complaint-details-container container animate-fade-in">
      {/* Back navigation */}
      <button className="back-link-btn" onClick={() => setActiveTab('my-complaints')}>
        <ArrowLeft size={16} />
        <span>Back to My Complaints</span>
      </button>

      {/* Details Banner */}
      <div className="details-header-card glass-card">
        <div className="details-meta-block">
          <div className="title-row">
            <span className="complaint-id-label">COMPLAINT #{complaint.id}</span>
            <span className="category-label">{complaint.category}</span>
          </div>
          <h2>{complaint.title}</h2>
          <div className="horizontal-meta-row">
            <div className="meta-item">
              <Calendar size={14} />
              <span>Filed: {complaint.submittedDate}</span>
            </div>
            <div className="meta-item">
              <MapPin size={14} />
              <span>{complaint.locationName}</span>
            </div>
          </div>
        </div>

        <div className="details-header-actions">
          <div className="status-indicator">
            <span className="status-label">Current Status</span>
            <span className={`status-badge-large ${complaint.status.replace(/\s+/g, '-').toLowerCase()}`}>
              {complaint.status}
            </span>
          </div>

          <div className="header-action-buttons">
            {complaint.status === 'Under Review' && (
              <button className="btn-secondary" onClick={handleEditComplaint}>
                <Edit3 size={16} />
                <span>Edit Report</span>
              </button>
            )}
            
            {/* Interactive workflow simulator */}
            <button className="btn-tertiary-small" onClick={handleAdvanceStatus} title="Simulate municipal agent progress updating">
              <RefreshCw size={14} />
              <span>Simulate Status Progress</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Description + Map vs Timeline Tracker */}
      <div className="details-layout-grid">
        {/* Left Column: Details & Images */}
        <div className="details-left-pane">
          {/* Detailed description */}
          <div className="details-section-card glass-card">
            <h3>Complaint Description</h3>
            <p className="description-content">{complaint.description}</p>
          </div>

          {/* Location details */}
          <div className="details-section-card glass-card">
            <h3>Geographic Location Details</h3>
            <p className="location-name-text">{complaint.locationName}</p>
            {complaint.locationCoordinates && (
              <div className="mini-coords-box">
                <span>Map Pin Location: X:{Math.round(complaint.locationCoordinates.x)} | Y:{Math.round(complaint.locationCoordinates.y)}</span>
              </div>
            )}
          </div>

          {/* Evidence photos */}
          {complaint.evidence && complaint.evidence.length > 0 && (
            <div className="details-section-card glass-card">
              <h3>Evidence Files Attached</h3>
              <div className="evidence-preview-gallery">
                {complaint.evidence.map((fileName) => {
                  const url = PRESET_MOCK_IMAGE_URLS[fileName] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200';
                  return (
                    <div key={fileName} className="gallery-item-card">
                      <img src={url} alt={fileName} />
                      <span className="file-caption">{fileName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Toggle buttons for Assessment & Timeline */}
          <div className="detail-tab-controls">
            <button 
              className={`toggle-tab-btn ${showAssessment ? 'active' : ''}`}
              onClick={() => setShowAssessment(!showAssessment)}
            >
              <BrainCircuit size={16} />
              <span>{showAssessment ? 'Hide AI Assessment' : 'View Full Assessment'}</span>
            </button>

            <button 
              className={`toggle-tab-btn ${showTimeline ? 'active' : ''}`}
              onClick={() => setShowTimeline(!showTimeline)}
            >
              <Sparkles size={16} />
              <span>Track Complaint Timeline</span>
            </button>
          </div>

          {/* AI Assessment Overlay/Section */}
          {showAssessment && complaint.aiAssessment && (
            <div className="details-section-card ai-assessment-card glass-card animate-scale-in">
              <div className="ai-card-title">
                <BrainCircuit className="ai-icon" />
                <h3>AI Diagnostic Summary</h3>
              </div>
              <div className="card-divider"></div>
              
              <div className="ai-detail-section">
                <span className="section-label">Category Code</span>
                <span className="category-value">{complaint.aiAssessment.category}</span>
              </div>

              <div className="ai-detail-section highlight">
                <span className="section-label">Automated Triage Summary</span>
                <p>{complaint.aiAssessment.understanding}</p>
              </div>

              <div className="ai-detail-section">
                <span className="section-label">Cited Regulations & Ordinances</span>
                <ul className="laws-list">
                  {complaint.aiAssessment.relevantLaws.map((law, index) => (
                    <li key={index}>
                      <ShieldAlert size={14} className="law-icon" />
                      <span>{law}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ai-detail-section">
                <span className="section-label">Routed Municipal Authority</span>
                <div className="authority-box">
                  <CheckCircle size={14} className="check-icon" />
                  <span>{complaint.aiAssessment.suggestedAuthority}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Tracking Timeline */}
        {showTimeline && (
          <div className="details-right-pane">
            <div className="timeline-tracker-card glass-card animate-slide-right">
              <h3>Resolution Timeline Tracker</h3>
              <p className="timeline-subtitle">Real-time status logs of the complaint lifetime</p>

              <div className="tracker-timeline-nodes">
                {complaint.history.map((h, index) => {
                  const isLast = index === complaint.history.length - 1;
                  return (
                    <div key={index} className={`tracker-node ${isLast ? 'current' : 'past'}`}>
                      <div className="node-marker">
                        <div className="node-dot">
                          {isLast ? <span className="pulse-dot"></span> : '✓'}
                        </div>
                        {index < complaint.history.length - 1 && <div className="node-line"></div>}
                      </div>

                      <div className="node-content-block">
                        <div className="node-header">
                          <h4>{h.status}</h4>
                          <span className="node-date">{h.date} - {h.time}</span>
                        </div>
                        <p className="node-notes">{h.notes}</p>
                      </div>
                    </div>
                  );
                })}

                {complaint.status !== 'Resolved' && (
                  <div className="tracker-node future">
                    <div className="node-marker">
                      <div className="node-dot">•</div>
                    </div>
                    <div className="node-content-block">
                      <div className="node-header">
                        <h4>Resolution Complete</h4>
                        <span className="node-date">Pending Action</span>
                      </div>
                      <p className="node-notes">Official confirmation and before/after verification will be uploaded here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
