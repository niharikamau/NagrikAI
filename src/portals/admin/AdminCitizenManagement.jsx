import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  User, 
  FileText, 
  X, 
  ExternalLink
} from 'lucide-react';

export default function AdminCitizenManagement({ 
  citizens, 
  complaints, 
  onSelectComplaintFromCitizen 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState(null);

  // Filter citizens
  const filteredCitizens = citizens.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.includes(term))
    );
  });

  const handleOpenCitizen = (citizen) => {
    const userComplaints = complaints.filter(
      comp => (comp.citizenEmail && comp.citizenEmail.toLowerCase() === citizen.email.toLowerCase()) ||
              (comp.citizenName && comp.citizenName.toLowerCase() === citizen.name.toLowerCase())
    );
    setSelectedCitizen({
      ...citizen,
      complaintsHistory: userComplaints
    });
  };

  return (
    <div className="admin-section-content animate-fade-in">
      {/* Header without subtitle */}
      <div className="admin-header-row">
        <div>
          <h1>Citizen Management</h1>
        </div>
      </div>

      {/* Citizens Search & Table */}
      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search-box">
            <Search size={16} className="admin-search-icon" />
            <input 
              type="text" 
              placeholder="Search citizen by name, email, or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>TOTAL COMPLAINTS</th>
                <th>STATUS</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCitizens.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No citizens found matching search.
                  </td>
                </tr>
              ) : (
                filteredCitizens.map((citizen, idx) => {
                  const compCount = citizen.totalComplaints !== undefined ? citizen.totalComplaints : (citizen.complaintsList ? citizen.complaintsList.length : 0);
                  return (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{citizen.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{citizen.address || 'Ward Resident'}</div>
                      </td>
                      <td>
                        <span style={{ color: '#cbd5e1' }}>{citizen.email}</span>
                      </td>
                      <td>
                        <span style={{ color: '#94a3b8' }}>{citizen.phone || '—'}</span>
                      </td>
                      <td>
                        <strong style={{ color: compCount > 0 ? '#60a5fa' : '#94a3b8', fontSize: '1rem' }}>
                          {compCount}
                        </strong>
                      </td>
                      <td>
                        <span className="admin-badge active">Verified</span>
                      </td>
                      <td>
                        <button 
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => handleOpenCitizen(citizen)}
                        >
                          <Eye size={13} />
                          <span>View Details</span>
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

      {/* Citizen Details Modal */}
      {selectedCitizen && (
        <div className="admin-modal-overlay" onClick={() => setSelectedCitizen(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="admin-profile-avatar">
                  {selectedCitizen.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3>CITIZEN DETAILS</h3>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{selectedCitizen.name}</span>
                </div>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedCitizen(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Basic Details Grid */}
              <div className="admin-inspector-block">
                <h4><User size={14} /> Profile Information</h4>
                <div className="admin-meta-grid" style={{ marginTop: '10px' }}>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Name</span>
                    <span className="admin-meta-value">{selectedCitizen.name}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Email</span>
                    <span className="admin-meta-value">{selectedCitizen.email}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Phone</span>
                    <span className="admin-meta-value">{selectedCitizen.phone || '+91 9876543210'}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Total Complaints</span>
                    <span className="admin-meta-value" style={{ color: '#60a5fa', fontWeight: 700 }}>
                      {selectedCitizen.complaintsHistory ? selectedCitizen.complaintsHistory.length : (selectedCitizen.totalComplaints || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Complaints History */}
              <div className="admin-inspector-block">
                <h4><FileText size={14} /> Complaints History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {selectedCitizen.complaintsHistory && selectedCitizen.complaintsHistory.length > 0 ? (
                    selectedCitizen.complaintsHistory.map(comp => (
                      <div 
                        key={comp.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 14px',
                          backgroundColor: '#172338',
                          borderRadius: '8px',
                          border: '1px solid #334155'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#60a5fa' }}>#{comp.id}</strong>
                            <span style={{ color: '#f1f5f9', fontWeight: 500 }}>— {comp.issue || comp.title}</span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                            Category: {comp.category} • Status: <span style={{ color: '#38bdf8' }}>{comp.status}</span>
                          </div>
                        </div>

                        <button 
                          className="admin-btn admin-btn-outline admin-btn-sm"
                          onClick={() => {
                            setSelectedCitizen(null);
                            onSelectComplaintFromCitizen(comp);
                          }}
                        >
                          <span>Details</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '0.86rem' }}>
                      No complaints registered under this citizen account yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setSelectedCitizen(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
