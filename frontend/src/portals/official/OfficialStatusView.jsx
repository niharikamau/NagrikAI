import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  History, 
  X, 
  ArrowLeft, 
  Search,
  Layers,
  FileCheck
} from 'lucide-react';

export default function OfficialStatusView({ complaints, onSelectComplaint }) {
  const [selectedTimelineComplaint, setSelectedTimelineComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComplaints = complaints.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.title && c.title.toLowerCase().includes(term)) ||
      (c.id && c.id.toString().includes(term)) ||
      (c.category && c.category.toLowerCase().includes(term)) ||
      (c.status && c.status.toLowerCase().includes(term))
    );
  });

  return (
    <div className="animate-fade-in">
      <div className="official-top-banner">
        <div>
          <h1>Status</h1>
        </div>
      </div>

      <div className="official-card">
        <div className="official-card-header">
          <h3>
            <Activity size={18} color="#0284c7" />
            <span>ALL COMPLAINTS STATUS OVERVIEW</span>
          </h3>
          <div className="official-search-box" style={{ maxWidth: '320px' }}>
            <Search size={16} className="official-search-icon" />
            <input 
              type="text" 
              placeholder="Filter by ID, category, status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="official-table-container">
          <table className="official-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>COMPLAINT ID</th>
                <th style={{ width: '160px' }}>CATEGORY</th>
                <th style={{ width: '180px' }}>ACTION</th>
                <th style={{ width: '140px' }}>STATUS</th>
                <th>REMARKS (OFFICIAL)</th>
                <th style={{ width: '140px', textAlign: 'right' }}>HISTORY</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map(complaint => {
                const officialRemark = 
                  complaint.officialAction?.remarks || 
                  complaint.history?.[complaint.history.length - 1]?.notes || 
                  'Official review in progress.';
                const actionTaken = 
                  complaint.officialAction?.actionSelected || 
                  (complaint.status === 'Resolved' ? 'Completed & Verified' : 'Inspection Scheduled');

                return (
                  <tr key={complaint.id}>
                    <td>
                      <strong style={{ color: '#0f172a' }}>#{complaint.id}</strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#334155' }}>{complaint.category}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#0369a1', background: '#f0f9ff', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {actionTaken}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${complaint.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.84rem', color: '#475569' }}>
                        "{officialRemark}"
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="official-btn official-btn-outline official-btn-sm"
                        onClick={() => setSelectedTimelineComplaint(complaint)}
                      >
                        <History size={13} />
                        <span>View History</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6.1) View History / COMPLAINT TIMELINE MODAL */}
      {selectedTimelineComplaint && (
        <div className="action-modal-overlay" onClick={() => setSelectedTimelineComplaint(null)}>
          <div className="action-modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="action-modal-header">
              <div>
                <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>
                  6.1 AUDIT TRAIL &bull; #{selectedTimelineComplaint.id}
                </span>
                <h3 style={{ marginTop: '2px' }}>COMPLAINT TIMELINE</h3>
              </div>
              <button className="official-btn-secondary official-btn-sm" onClick={() => setSelectedTimelineComplaint(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="action-modal-body">
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.98rem' }}>
                  {selectedTimelineComplaint.title || selectedTimelineComplaint.issue}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                  Category: {selectedTimelineComplaint.category} &bull; Current Status: <strong>{selectedTimelineComplaint.status}</strong>
                </div>
              </div>

              {/* Timeline Nodes Matching Section 6.1 */}
              <div className="timeline-tracker">
                {selectedTimelineComplaint.history && selectedTimelineComplaint.history.length > 0 ? (
                  selectedTimelineComplaint.history.map((step, idx) => {
                    const isLast = idx === selectedTimelineComplaint.history.length - 1;
                    return (
                      <div key={idx} className={`timeline-node-item ${isLast ? 'current' : 'done'}`}>
                        <div className="timeline-spine">
                          <div className="timeline-icon-dot">
                            {isLast ? '●' : '✓'}
                          </div>
                          {idx < selectedTimelineComplaint.history.length - 1 && (
                            <div className="timeline-line"></div>
                          )}
                        </div>

                        <div className="timeline-content-card">
                          <div className="timeline-content-header">
                            <span className="timeline-status-name">{step.status}</span>
                            <span className="timeline-timestamp">{step.date} &bull; {step.time}</span>
                          </div>
                          <div className="timeline-remarks">{step.notes}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div>
                    <div className="timeline-node-item done">
                      <div className="timeline-spine">
                        <div className="timeline-icon-dot">✓</div>
                        <div className="timeline-line"></div>
                      </div>
                      <div className="timeline-content-card">
                        <div className="timeline-content-header">
                          <span className="timeline-status-name">Submitted</span>
                          <span className="timeline-timestamp">Aug 12, 10:20 AM</span>
                        </div>
                        <div className="timeline-remarks">Complaint received and encrypted.</div>
                      </div>
                    </div>

                    <div className="timeline-node-item done">
                      <div className="timeline-spine">
                        <div className="timeline-icon-dot">✓</div>
                        <div className="timeline-line"></div>
                      </div>
                      <div className="timeline-content-card">
                        <div className="timeline-content-header">
                          <span className="timeline-status-name">Assigned to Water Department</span>
                          <span className="timeline-timestamp">Aug 12, 11:05 AM</span>
                        </div>
                        <div className="timeline-remarks">Routed to officer queue.</div>
                      </div>
                    </div>

                    <div className="timeline-node-item done">
                      <div className="timeline-spine">
                        <div className="timeline-icon-dot">✓</div>
                        <div className="timeline-line"></div>
                      </div>
                      <div className="timeline-content-card">
                        <div className="timeline-content-header">
                          <span className="timeline-status-name">Official started review</span>
                          <span className="timeline-timestamp">Aug 12, 01:30 PM</span>
                        </div>
                        <div className="timeline-remarks">Technical evaluation underway.</div>
                      </div>
                    </div>

                    <div className="timeline-node-item current">
                      <div className="timeline-spine">
                        <div className="timeline-icon-dot">●</div>
                        <div className="timeline-line"></div>
                      </div>
                      <div className="timeline-content-card">
                        <div className="timeline-content-header">
                          <span className="timeline-status-name">Inspection Scheduled</span>
                          <span className="timeline-timestamp">Aug 12, 03:10 PM</span>
                        </div>
                        <div className="timeline-remarks">Site inspection team dispatched.</div>
                      </div>
                    </div>

                    <div className="timeline-node-item">
                      <div className="timeline-spine">
                        <div className="timeline-icon-dot">○</div>
                      </div>
                      <div className="timeline-content-card" style={{ opacity: 0.7 }}>
                        <div className="timeline-content-header">
                          <span className="timeline-status-name">Resolved</span>
                          <span className="timeline-timestamp">Pending Completion</span>
                        </div>
                        <div className="timeline-remarks">Awaiting final site verification.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
