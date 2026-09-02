import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  MapPin, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  X, 
  Check, 
  Sparkles, 
  Send,
  Ban
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

const PRESET_MOCK_IMAGE_URLS = {
  'garbage.jpg': 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&auto=format&fit=crop',
  'pothole.jpg': 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500&auto=format&fit=crop',
  'streetlight.jpg': 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=500&auto=format&fit=crop',
  'leakage.jpg': 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500&auto=format&fit=crop'
};

export default function AdminComplaintManagement({ 
  complaints, 
  officials, 
  onRefresh, 
  selectedComplaint, 
  setSelectedComplaint 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Assignment state inside modal
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedOfficial, setSelectedOfficial] = useState('');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const departments = [
    'Waste & Sanitation',
    'Roads & Infrastructure',
    'Water & Drainage',
    'Public Utilities',
    'Public Health & Safety'
  ];

  const handleOpenComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedDept(complaint.assignedDepartment || complaint.category || 'Waste & Sanitation');
    setSelectedOfficial(complaint.assignedOfficial || '');
    setStatusUpdateNote('');
    setSuccessMessage('');
  };

  const handleCloseModal = () => {
    setSelectedComplaint(null);
    setSuccessMessage('');
  };

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.id.toString().includes(searchTerm) ||
      (c.issue && c.issue.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.citizenName && c.citizenName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') return c.status === 'In Progress' || c.status === 'Assigned';
    if (activeFilter === 'Resolved') return c.status === 'Resolved';
    if (activeFilter === 'Withdrawn') return c.status === 'Withdrawn' || c.status === 'Rejected';
    if (activeFilter === 'Pending') return c.status === 'Pending' || c.status === 'Under Review';
    return true;
  });

  const handleAssignComplaint = (e) => {
    e.preventDefault();
    if (!selectedComplaint || selectedComplaint.status === 'Withdrawn') return;

    mockDb.assignComplaint(
      selectedComplaint.id,
      selectedDept,
      selectedOfficial,
      statusUpdateNote || `Assigned to ${selectedOfficial || selectedDept} by Admin.`
    );

    setSuccessMessage(`Complaint #${selectedComplaint.id} successfully assigned to ${selectedOfficial || selectedDept}!`);
    onRefresh();

    const updated = mockDb.getComplaints().find(c => c.id === selectedComplaint.id);
    if (updated) setSelectedComplaint(updated);
  };

  const handleStatusChange = (newStatus) => {
    if (!selectedComplaint || selectedComplaint.status === 'Withdrawn') return;
    mockDb.updateComplaintStatus(selectedComplaint.id, newStatus, `Status updated to ${newStatus} by Admin.`);
    setSuccessMessage(`Status updated to ${newStatus}.`);
    onRefresh();
    const updated = mockDb.getComplaints().find(c => c.id === selectedComplaint.id);
    if (updated) setSelectedComplaint(updated);
  };

  const filteredOfficialsForDept = officials.filter(o => 
    !selectedDept || o.department.toLowerCase() === selectedDept.toLowerCase()
  );

  const isSelectedWithdrawn = selectedComplaint && selectedComplaint.status === 'Withdrawn';

  return (
    <div className="admin-section-content animate-fade-in">
      {/* Header without subtitle */}
      <div className="admin-header-row">
        <div>
          <h1>Complaint Management</h1>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search-box">
            <Search size={16} className="admin-search-icon" />
            <input 
              type="text" 
              placeholder="Search complaints by issue, citizen name, or complaint number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-filter-tabs">
            {['All', 'Active', 'Pending', 'Resolved', 'Withdrawn'].map(tab => (
              <button
                key={tab}
                className={`admin-filter-tab ${activeFilter === tab ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ISSUE</th>
                <th>CATEGORY</th>
                <th>CITIZEN</th>
                <th>ASSIGNED TO</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No complaints matching current filter.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(c => {
                  const isWithdrawn = c.status === 'Withdrawn';
                  return (
                    <tr key={c.id} className={isWithdrawn ? 'withdrawn-row' : ''}>
                      <td>
                        <strong style={{ color: isWithdrawn ? '#9ca3af' : '#60a5fa', fontSize: '0.95rem' }}>#{c.id}</strong>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: isWithdrawn ? '#cbd5e1' : '#ffffff' }}>{c.issue || c.title}</div>
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{c.locationName}</div>
                      </td>
                      <td>
                        <span style={{ color: isWithdrawn ? '#9ca3af' : '#cbd5e1' }}>{c.category}</span>
                      </td>
                      <td>
                        <div style={{ color: isWithdrawn ? '#cbd5e1' : '#f8fafc', fontWeight: 500 }}>{c.citizenName || 'Citizen'}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{c.citizenPhone || ''}</div>
                      </td>
                      <td>
                        {c.assignedOfficial ? (
                          <span style={{ color: isWithdrawn ? '#9ca3af' : '#38bdf8', fontWeight: 500 }}>{c.assignedOfficial}</span>
                        ) : (
                          <span style={{ color: isWithdrawn ? '#71717a' : '#f87171', fontStyle: 'italic', fontSize: '0.8rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`admin-badge ${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`admin-btn ${isWithdrawn ? 'admin-btn-secondary' : 'admin-btn-primary'} admin-btn-sm`}
                          onClick={() => handleOpenComplaint(c)}
                        >
                          <Eye size={13} />
                          <span>View Complaint</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div 
            className={`admin-modal admin-modal-large ${isSelectedWithdrawn ? 'withdrawn-modal' : ''}`} 
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="admin-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3>COMPLAINT #{selectedComplaint.id}</h3>
                  <span className={`admin-badge ${selectedComplaint.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {selectedComplaint.status}
                  </span>
                  <span className={`admin-badge ${(selectedComplaint.urgency || 'Medium').toLowerCase()}`}>
                    Urgency: {selectedComplaint.urgency || 'Medium'}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Submitted: {selectedComplaint.submittedDate} • Last Updated: {selectedComplaint.lastUpdated || selectedComplaint.submittedDate}
                </span>
              </div>
              <button className="admin-modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="admin-modal-body">
              {isSelectedWithdrawn && (
                <div style={{ padding: '12px 16px', backgroundColor: 'rgba(113, 113, 122, 0.25)', border: '1px solid #71717a', borderRadius: '8px', color: '#e4e4e7', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ban size={16} />
                  <span><strong>Notice:</strong> This complaint was Withdrawn by citizen. It is presented in read-only mode and cannot be modified or reassigned.</span>
                </div>
              )}

              {successMessage && !isSelectedWithdrawn && (
                <div style={{ padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '8px', color: '#34d399', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* User Details Block */}
              <div className="admin-inspector-block">
                <h4><User size={14} /> Citizen & Contact Details</h4>
                <div className="admin-meta-grid" style={{ marginTop: '10px' }}>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Citizen Name</span>
                    <span className="admin-meta-value">{selectedComplaint.citizenName || 'Niharika Maurya'}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Email Address</span>
                    <span className="admin-meta-value">{selectedComplaint.citizenEmail || 'example@gmail.com'}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Phone Number</span>
                    <span className="admin-meta-value">{selectedComplaint.citizenPhone || '+91 9876543210'}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Current Status</span>
                    <span className="admin-meta-value" style={{ color: isSelectedWithdrawn ? '#a1a1aa' : '#60a5fa' }}>{selectedComplaint.status}</span>
                  </div>
                </div>
              </div>

              {/* Citizen Complaint AI Summary */}
              <div className="admin-inspector-block" style={isSelectedWithdrawn ? {} : { borderLeft: '3px solid #38bdf8' }}>
                <h4><Sparkles size={14} /> Citizen Complaint (AI Summary)</h4>
                <div className="admin-inspector-text" style={{ fontSize: '0.94rem', fontWeight: 500 }}>
                  "{selectedComplaint.aiSummary || selectedComplaint.description}"
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span>Category: <strong>{selectedComplaint.category}</strong></span>
                  <span>Urgency: <strong>{selectedComplaint.urgency || 'Medium'}</strong></span>
                </div>
              </div>

              {/* Raw text entered by user & Location */}
              <div className="admin-inspector-block">
                <h4><FileText size={14} /> Actual Text Entered by User</h4>
                <div className="admin-inspector-text">
                  {selectedComplaint.rawText || selectedComplaint.description}
                </div>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.84rem' }}>
                  <MapPin size={16} />
                  <span><strong>Location:</strong> {selectedComplaint.locationName}</span>
                </div>
              </div>

              {/* Evidence Photos */}
              {selectedComplaint.evidence && selectedComplaint.evidence.length > 0 && (
                <div className="admin-inspector-block">
                  <h4>Evidence & Photo Attachments</h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {selectedComplaint.evidence.map((fileName, idx) => {
                      const url = PRESET_MOCK_IMAGE_URLS[fileName] || 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400';
                      return (
                        <div key={idx} style={{ width: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
                          <img src={url} alt={fileName} style={{ width: '100%', height: '90px', objectFit: 'cover' }} />
                          <div style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#94a3b8', backgroundColor: '#0f172a' }}>
                            {fileName}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Assignment Form (Hidden/Disabled if Withdrawn) */}
              {!isSelectedWithdrawn ? (
                <div className="admin-inspector-block" style={{ backgroundColor: '#1e293b', border: '1px solid #3b82f6' }}>
                  <h4>Assigned Department / Official</h4>
                  <form onSubmit={handleAssignComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                    <div className="admin-form-row">
                      <div className="admin-form-group">
                        <label>Select Department</label>
                        <select 
                          value={selectedDept} 
                          onChange={(e) => {
                            setSelectedDept(e.target.value);
                            setSelectedOfficial('');
                          }}
                        >
                          {departments.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div className="admin-form-group">
                        <label>Select Official (Optional)</label>
                        <select 
                          value={selectedOfficial} 
                          onChange={(e) => setSelectedOfficial(e.target.value)}
                        >
                          <option value="">-- Choose Field Official --</option>
                          {filteredOfficialsForDept.map(off => (
                            <option key={off.id} value={off.name}>
                              {off.name} (#{off.id} - {off.role})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="admin-form-group">
                      <label>Assignment Notes / Directives (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Expedite on-site verification before noon."
                        value={statusUpdateNote}
                        onChange={(e) => setStatusUpdateNote(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button type="submit" className="admin-btn admin-btn-primary">
                        <Send size={15} />
                        <span>{selectedComplaint.assignedOfficial ? 'Reassign Complaint' : 'Assign Complaint'}</span>
                      </button>

                      <button 
                        type="button" 
                        className="admin-btn admin-btn-secondary"
                        onClick={() => handleStatusChange('In Progress')}
                      >
                        <span>Mark In Progress</span>
                      </button>

                      <button 
                        type="button" 
                        className="admin-btn admin-btn-secondary"
                        onClick={() => handleStatusChange('Resolved')}
                      >
                        <Check size={14} />
                        <span>Mark Resolved</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="admin-inspector-block">
                  <h4>Assignment & Resolution State</h4>
                  <p style={{ color: '#a1a1aa', fontSize: '0.88rem' }}>
                    Complaint was closed by withdrawal. No further dispatch or assignment actions required.
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={handleCloseModal}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
