import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Users, 
  ShieldCheck, 
  Eye, 
  Send, 
  PlusCircle, 
  X,
  FileCheck,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

const PRESET_EVIDENCE_URLS = {
  'before.jpg': 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop',
  'after.jpg': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop'
};

export default function OfficialFieldAction({ complaints, onRefresh }) {
  const [fieldActions, setFieldActions] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(1048);

  // Form states for dispatching a field action
  const [actionType, setActionType] = useState('Drain Cleaning');
  const [assignedTeam, setAssignedTeam] = useState('Drainage Team 03');
  const [priority, setPriority] = useState('High');
  const [targetDate, setTargetDate] = useState('2026-08-15');
  const [instructions, setInstructions] = useState('Perform mechanical desilting and remove accumulated sediment blockage from stormwater line.');

  // Resolution workflow states
  const [showResolutionForm, setShowResolutionForm] = useState(false);
  const [resolutionRemarks, setResolutionRemarks] = useState('Field remediation verified. Site drainage restored to normal parameters.');
  const [previewImage, setPreviewImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const refreshActions = () => {
    setFieldActions(mockDb.getFieldActions());
  };

  useEffect(() => {
    refreshActions();
  }, []);

  // When complaint is selected, reset resolution form toggle
  const handleSelectComplaintChange = (id) => {
    setSelectedComplaintId(Number(id));
    setShowResolutionForm(false);
  };

  // Find specifically for the chosen complaint ID (NO fallback to other complaints!)
  const activeAction = fieldActions.find(a => a.complaintId === Number(selectedComplaintId));

  const handleAssignFieldAction = (e) => {
    e.preventDefault();
    mockDb.saveFieldAction({
      complaintId: Number(selectedComplaintId),
      action: actionType,
      assignedTeam,
      priority,
      targetDate,
      instructions
    });

    setSuccessMessage(`Field action '${actionType}' successfully assigned to ${assignedTeam}!`);
    setTimeout(() => setSuccessMessage(''), 4000);
    refreshActions();
    if (onRefresh) onRefresh();
  };

  const handleVerifyAndResolve = () => {
    if (!activeAction) return;
    mockDb.verifyFieldActionAndResolve(activeAction.complaintId, resolutionRemarks);
    setSuccessMessage(`Complaint #${activeAction.complaintId} marked as Resolved!`);
    setShowResolutionForm(false);
    setTimeout(() => setSuccessMessage(''), 4000);
    refreshActions();
    if (onRefresh) onRefresh();
  };

  return (
    <div className="animate-fade-in">
      <div className="official-top-banner">
        <div>
          <h1>Field Action</h1>
        </div>
      </div>

      {successMessage && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Target Complaint Selector */}
      <div className="official-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Select Active Complaint:</span>
            <select
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                backgroundColor: '#f8fafc',
                fontWeight: 600,
                color: '#0f172a'
              }}
              value={selectedComplaintId}
              onChange={(e) => handleSelectComplaintChange(e.target.value)}
            >
              {complaints.map(c => (
                <option key={c.id} value={c.id}>
                  #{c.id} - {c.title || c.issue} ({c.status})
                </option>
              ))}
            </select>
          </div>

          <span style={{ fontSize: '0.8rem', color: activeAction ? '#0284c7' : '#64748b', background: activeAction ? '#f0f9ff' : '#f1f5f9', padding: '4px 10px', borderRadius: '999px', fontWeight: 600 }}>
            {activeAction ? 'Active Field Action Deployed' : 'No Action Taken'}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Left Column: Field Action Form */}
        <div className="official-card">
          <div className="official-card-header">
            <h3>
              <Truck size={18} color="#0284c7" />
              <span>Field Action</span>
            </h3>
          </div>

          <form onSubmit={handleAssignFieldAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Select Action */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Select Action:
              </label>
              <select
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: '#ffffff' }}
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
              >
                <option value="Drain Cleaning">Drain Cleaning</option>
                <option value="Site Inspection">Site Inspection</option>
                <option value="Repair / Maintenance">Repair / Maintenance</option>
                <option value="Waste Collection / Cleanup">Waste Collection / Cleanup</option>
                <option value="Blockage Removal">Blockage Removal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Assigned Team / Unit */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Assigned Team / Unit:
              </label>
              <select
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: '#ffffff' }}
                value={assignedTeam}
                onChange={(e) => setAssignedTeam(e.target.value)}
              >
                <option value="Drainage Team 03">Drainage Team 03 (Heavy Suction Unit)</option>
                <option value="PWD Road Crew 01">PWD Road Crew 01 (Asphalt Repair)</option>
                <option value="Sanitation Squad Alpha">Sanitation Squad Alpha (Waste Collection)</option>
                <option value="Rapid Response Unit 02">Rapid Response Unit 02</option>
                <option value="Electrical Operations Unit">Electrical Operations Unit</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Priority:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['High', 'Medium', 'Low'].map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`official-btn official-btn-sm ${priority === p ? 'official-btn-primary' : 'official-btn-secondary'}`}
                    style={{ flex: 1, padding: '8px' }}
                    onClick={() => setPriority(p)}
                  >
                    <span className={`urgency-dot ${p === 'High' ? 'red' : p === 'Medium' ? 'amber' : 'green'}`}></span>
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Target Completion Date:
              </label>
              <input
                type="date"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>

            {/* Instructions */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Instructions for Team:
              </label>
              <textarea
                style={{ width: '100%', minHeight: '90px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter specific instructions for the dispatched unit..."
                required
              />
            </div>

            <button type="submit" className="official-btn official-btn-primary" style={{ marginTop: '8px' }}>
              <Send size={15} />
              <span>Assign Field Action</span>
            </button>
          </form>
        </div>

        {/* Right Column: Highlighted Field Status Card */}
        <div 
          className="official-card" 
          style={{ 
            background: '#ffffff', 
            border: '2px solid #0284c7', 
            boxShadow: '0 6px 20px rgba(2, 132, 199, 0.12)',
            borderRadius: '12px'
          }}
        >
          <div className="official-card-header" style={{ borderBottom: '1px solid #e0f2fe', paddingBottom: '12px' }}>
            <h3 style={{ color: '#0369a1' }}>
              <FileCheck size={18} color="#0284c7" />
              <span>Field Status</span>
            </h3>
            {activeAction ? (
              <span className={`status-pill ${activeAction.status === 'Completed' ? 'resolved' : 'in-progress'}`}>
                {activeAction.status}
              </span>
            ) : (
              <span className="status-pill pending">No action taken</span>
            )}
          </div>

          {activeAction ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status Overview Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Action</span>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{activeAction.action}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Team</span>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{activeAction.assignedTeam}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Assigned On</span>
                    <div style={{ color: '#334155', marginTop: '2px' }}>{activeAction.assignedOn || '14 Aug 2026'}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Target Date</span>
                    <div style={{ color: '#334155', marginTop: '2px' }}>{activeAction.targetDate || '15 Aug 2026'}</div>
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', fontSize: '0.82rem', color: '#475569' }}>
                  <strong>Instructions:</strong> {activeAction.instructions}
                </div>
              </div>

              {/* Completion Report Section */}
              <div style={{ border: '1px solid #bae6fd', background: '#f0f9ff', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0369a1', margin: 0 }}>
                    Completion Report
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#0284c7' }}>Completed on: 15 Aug 2026</span>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#0c4a6e', marginBottom: '12px' }}>
                  <strong>Note:</strong>
                  <p style={{ margin: '4px 0 0 0' }}>
                    {activeAction.completionReport?.completionNote || "Drain desilted and sediment blockage removed from ABC School junction. Flow normalized."}
                  </p>
                </div>

                {/* Evidence Photos (before / after) */}
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0369a1', textTransform: 'uppercase' }}>
                    Evidence:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                    {['before.jpg', 'after.jpg'].map(img => (
                      <div 
                        key={img} 
                        style={{ border: '1px solid #bae6fd', borderRadius: '6px', overflow: 'hidden', background: '#ffffff', cursor: 'pointer' }}
                        onClick={() => setPreviewImage({ name: img, url: PRESET_EVIDENCE_URLS[img] })}
                      >
                        <img src={PRESET_EVIDENCE_URLS[img]} alt={img} style={{ width: '100%', height: '90px', objectFit: 'cover' }} />
                        <div style={{ padding: '4px 8px', fontSize: '0.74rem', fontWeight: 600, color: '#0369a1', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{img}</span>
                          <Eye size={12} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button 
                    type="button" 
                    className="official-btn official-btn-primary" 
                    style={{ flex: 1 }}
                    onClick={() => setShowResolutionForm(true)}
                  >
                    <CheckCircle2 size={15} />
                    <span>Verify Completion</span>
                  </button>

                  <button 
                    type="button" 
                    className="official-btn official-btn-secondary" 
                    style={{ flex: 1 }}
                    onClick={() => alert("Request for additional field work has been dispatched to the assigned team.")}
                  >
                    <span>Request Further Action</span>
                  </button>
                </div>
              </div>

              {/* RESOLUTION PANEL (If Verified) */}
              {(showResolutionForm || activeAction.status === 'Completed') && (
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#166534', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={18} />
                    <span>RESOLUTION VERIFICATION</span>
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem', color: '#15803d', marginBottom: '14px' }}>
                    <div>✓ Field action completed</div>
                    <div>✓ Evidence reviewed</div>
                    <div>✓ Issue resolved</div>
                  </div>

                  {activeAction.status !== 'Completed' ? (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#166534', marginBottom: '6px' }}>
                        Resolution Note (Official's Final Remarks):
                      </label>
                      <textarea
                        style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #86efac', fontSize: '0.85rem' }}
                        value={resolutionRemarks}
                        onChange={(e) => setResolutionRemarks(e.target.value)}
                        placeholder="Official's final remarks..."
                      />
                      <button 
                        type="button" 
                        className="official-btn official-btn-primary" 
                        style={{ width: '100%', marginTop: '10px', background: '#16a34a' }}
                        onClick={handleVerifyAndResolve}
                      >
                        <CheckCircle2 size={16} />
                        <span>Mark Complaint as Resolved</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                      <strong>Status:</strong> Case resolved and verified by Official.
                      <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                        "{activeAction.resolutionDetails?.resolutionNote || resolutionRemarks}"
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
              <Truck size={38} style={{ opacity: 0.35, marginBottom: '10px' }} />
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155' }}>No action taken</div>
              <p style={{ fontSize: '0.84rem', marginTop: '4px', color: '#64748b' }}>
                No field operation has been dispatched yet for Complaint #{selectedComplaintId}.
              </p>
              <p style={{ fontSize: '0.8rem', color: '#0284c7' }}>Use the form on the left to assign an action to an on-ground crew.</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="action-modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="action-modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="action-modal-header">
              <h3>Field Evidence: {previewImage.name}</h3>
              <button className="official-btn-secondary official-btn-sm" onClick={() => setPreviewImage(null)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <img src={previewImage.url} alt={previewImage.name} style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} />
            </div>
            <div className="action-modal-footer">
              <button className="official-btn official-btn-secondary" onClick={() => setPreviewImage(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
