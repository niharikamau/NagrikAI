import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  X, 
  Check, 
  History,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

export default function AdminOfficialManagement({ officials, complaints, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // View: 'list' | 'detail'
  const [view, setView] = useState('list');
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [showCaseHistory, setShowCaseHistory] = useState(false);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Department edit
  const [editingDepartment, setEditingDepartment] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Form
  const [newOfficialData, setNewOfficialData] = useState({
    name: '', email: '', password: '', phone: '',
    department: 'Waste & Sanitation', role: 'Department Officer'
  });
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const departments = [
    'Waste & Sanitation',
    'Roads & Infrastructure',
    'Water & Drainage',
    'Public Utilities',
    'Public Health & Safety'
  ];

  const roles = [
    'Official / Department Officer',
    'Zonal Sanitation Officer',
    'Senior Road Engineer',
    'Water & Sewage Inspector',
    'Electrical Operations Officer',
    'Ward Inspector'
  ];

  const filteredOfficials = officials.filter(o => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toString().includes(searchTerm) ||
      (o.department && o.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDeptFilter === 'All' || o.department === selectedDeptFilter;
    const matchesStatus = selectedStatusFilter === 'All'
      || o.complaintStatus === selectedStatusFilter
      || o.status === selectedStatusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleOpenOfficial = (off) => {
    setSelectedOfficial(off);
    setEditingDepartment(off.department || 'Waste & Sanitation');
    setSaveSuccessMsg('');
    setShowCaseHistory(false);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedOfficial(null);
    setShowCaseHistory(false);
    setSaveSuccessMsg('');
  };

  const handleUpdateDepartment = (newDept) => {
    setEditingDepartment(newDept);
    if (!selectedOfficial) return;
    const updated = mockDb.updateOfficial(selectedOfficial.id, { department: newDept });
    if (updated) {
      setSelectedOfficial(updated);
      setSaveSuccessMsg(`Department updated to ${newDept}.`);
      onRefresh();
    }
  };

  const handleAddOfficialSubmit = (e) => {
    e.preventDefault();
    if (!newOfficialData.name || !newOfficialData.password || !newOfficialData.email) {
      setFormError('Please fill in all required fields (Name, Email, Password).');
      return;
    }
    mockDb.addOfficial(newOfficialData);
    setSuccessMsg(`Official ${newOfficialData.name} successfully registered.`);
    onRefresh();
    setShowAddModal(false);
    setNewOfficialData({ name: '', email: '', password: '', phone: '', department: 'Waste & Sanitation', role: 'Department Officer' });
    setFormError('');
  };

  const getBadgeClass = (status) => {
    if (!status) return 'pending';
    return status.toLowerCase().replace(/\s+/g, '-');
  };

  // ─── DETAIL VIEW ─────────────────────────────────────────────────────────────
  if (view === 'detail' && selectedOfficial) {
    return (
      <div className="admin-section-content animate-fade-in">
        {/* Breadcrumb back */}
        <div className="admin-header-row" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={handleBack}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /><span>Officials</span>
            </button>
            <span style={{ color: '#334155' }}>/</span>
            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{selectedOfficial.name}</span>
          </div>
        </div>

        {saveSuccessMsg && (
          <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '8px', color: '#34d399', fontSize: '0.84rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={14} /><span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Profile card */}
        <div className="admin-card" style={{ marginBottom: '16px', padding: 0, overflow: 'hidden' }}>
          {/* Header strip */}
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #1e293b' }}>
            <div className="admin-profile-avatar" style={{ width: '50px', height: '50px', fontSize: '1rem', flexShrink: 0 }}>
              {selectedOfficial.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9' }}>{selectedOfficial.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>#{selectedOfficial.id}</span>
                <span className={`admin-badge ${getBadgeClass(selectedOfficial.status || 'Active')}`} style={{ fontSize: '0.72rem' }}>
                  {selectedOfficial.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {[
              { label: 'Full Name', value: selectedOfficial.name },
              { label: 'Official Email', value: selectedOfficial.email || `${selectedOfficial.name.toLowerCase().replace(/\s+/g,'.')}@nagrik.gov.in`, blue: true },
              { label: 'Phone', value: selectedOfficial.phone || '+91 9876541100' },
              { label: 'Role', value: selectedOfficial.role },
              {
                label: 'Resolution Rate (Resolved / Assigned)',
                value: `${selectedOfficial.resolutionRate || '—'}  (${selectedOfficial.totalResolved || 0} / ${selectedOfficial.totalAssigned || 0} resolved)`,
                green: true
              }
            ].map(({ label, value, blue, green }) => (
              <div key={label} style={{ padding: '16px 24px', borderRight: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</div>
                <div style={{ fontSize: '0.9rem', color: green ? '#34d399' : blue ? '#60a5fa' : '#e2e8f0', fontWeight: green || blue ? 600 : 400 }}>{value}</div>
              </div>
            ))}

            {/* Department dropdown */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Department</div>
              <select
                value={editingDepartment}
                onChange={(e) => handleUpdateDepartment(e.target.value)}
                className="admin-select"
                style={{ width: '100%', fontSize: '0.88rem' }}
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Case History */}
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            onClick={() => setShowCaseHistory(!showCaseHistory)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={15} style={{ color: '#60a5fa' }} />
              <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.95rem' }}>Case History</span>
              {selectedOfficial.caseHistory?.length > 0 && (
                <span style={{ fontSize: '0.76rem', color: '#64748b' }}>({selectedOfficial.caseHistory.length} records)</span>
              )}
            </div>
            <ChevronRight size={16} style={{ color: '#475569', transform: showCaseHistory ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }} />
          </div>

          {showCaseHistory && (
            <div className="admin-table-container" style={{ borderTop: '1px solid #1e293b' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Complaint ID Assigned</th>
                    <th>Issue</th>
                    <th>Date of Assign</th>
                    <th>Current Status with Date &amp; Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOfficial.caseHistory && selectedOfficial.caseHistory.length > 0 ? (
                    selectedOfficial.caseHistory.map((c, i) => (
                      <tr key={i}>
                        <td><strong style={{ color: '#60a5fa' }}>#{c.id}</strong></td>
                        <td><span style={{ color: '#e2e8f0' }}>{c.issue}</span></td>
                        <td><span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>{c.assignedDate}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className={`admin-badge ${getBadgeClass(c.status)}`}>{c.status}</span>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{c.timestamp || '—'}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#475569' }}>No case history logged for this official.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── LIST VIEW ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-section-content animate-fade-in">
      {/* Header */}
      <div className="admin-header-row">
        <h1>Officials</h1>
        <button className="admin-btn admin-btn-primary"
          onClick={() => { setShowAddModal(true); setSuccessMsg(''); setFormError(''); }}>
          <UserPlus size={16} /><span>+ Add Official</span>
        </button>
      </div>

      {successMsg && (
        <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '8px', color: '#34d399', fontSize: '0.84rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={14} /><span>{successMsg}</span>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="admin-toolbar" style={{ padding: '14px 16px', borderBottom: '1px solid #1e293b', margin: 0 }}>
          <div className="admin-search-box">
            <Search size={15} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search official..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="admin-select" value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}>
            <option value="All">Department ▼</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select className="admin-select" value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Assigned">Assigned</option>
            <option value="Review">Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
            <option value="Free">Free</option>
          </select>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>ID</th>
                <th>DEPARTMENT</th>
                <th>COMPLAINT STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOfficials.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
                    No officials found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredOfficials.map(off => (
                  <tr key={off.id} onClick={() => handleOpenOfficial(off)}
                    style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #1e3a5f 0%, #164e63 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 700, color: '#7dd3fc', flexShrink: 0,
                          border: '1px solid #1e293b'
                        }}>
                          {off.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{off.name}</span>
                      </div>
                    </td>
                    <td><span style={{ color: '#60a5fa', fontWeight: 600 }}>#{off.id}</span></td>
                    <td><span style={{ color: '#94a3b8' }}>{off.department || '—'}</span></td>
                    <td>
                      <span className={`admin-badge ${getBadgeClass(off.complaintStatus || off.status)}`}>
                        {off.complaintStatus || off.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredOfficials.length > 0 && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid #1e293b', color: '#475569', fontSize: '0.78rem' }}>
            {filteredOfficials.length} official{filteredOfficials.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Add Official Modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>ADD OFFICIAL ACCOUNT</h3>
              <button className="admin-modal-close" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddOfficialSubmit}>
              <div className="admin-modal-body">
                {formError && (
                  <div style={{ color: '#f87171', fontSize: '0.84rem', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px', marginBottom: '12px' }}>
                    {formError}
                  </div>
                )}

                <div className="admin-form-group">
                  <label>Full Name *</label>
                  <input type="text" placeholder="e.g. Rahul Sharma"
                    value={newOfficialData.name}
                    onChange={(e) => setNewOfficialData({ ...newOfficialData, name: e.target.value })} required />
                </div>

                <div className="admin-form-group">
                  <label>Official Email *</label>
                  <input type="email" placeholder="rahul.sharma@nagrik.gov.in"
                    value={newOfficialData.email}
                    onChange={(e) => setNewOfficialData({ ...newOfficialData, email: e.target.value })} required />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Official Password *</label>
                    <input type="password" placeholder="••••••••"
                      value={newOfficialData.password}
                      onChange={(e) => setNewOfficialData({ ...newOfficialData, password: e.target.value })} required />
                  </div>
                  <div className="admin-form-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+91 9876541100"
                      value={newOfficialData.phone}
                      onChange={(e) => setNewOfficialData({ ...newOfficialData, phone: e.target.value })} />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Department</label>
                    <select value={newOfficialData.department}
                      onChange={(e) => setNewOfficialData({ ...newOfficialData, department: e.target.value })}>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label>Role</label>
                    <select value={newOfficialData.role}
                      onChange={(e) => setNewOfficialData({ ...newOfficialData, role: e.target.value })}>
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <UserPlus size={15} /><span>Create Official Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
