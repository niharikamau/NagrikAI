import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Sparkles, 
  BrainCircuit, 
  X, 
  Layers
} from 'lucide-react';

export default function AdminAIMonitoring({ aiLogs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  // Filter logs
  const filteredLogs = aiLogs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      log.id.toLowerCase().includes(term) ||
      log.complaintId.toLowerCase().includes(term) ||
      log.source.toLowerCase().includes(term) ||
      log.task.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    if (activeFilter === 'Success') return log.status === 'Success';
    if (activeFilter === 'Low Confidence') return log.status === 'Low Confidence';
    if (activeFilter === 'Failed') return log.status === 'Failed';
    if (activeFilter === 'Review') return log.status === 'Review';
    return true;
  });

  return (
    <div className="admin-section-content animate-fade-in">
      {/* Header without subtitle */}
      <div className="admin-header-row">
        <div>
          <h1>AI Monitoring</h1>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="admin-card">
        <div className="admin-toolbar">
          <div className="admin-search-box">
            <Search size={16} className="admin-search-icon" />
            <input 
              type="text" 
              placeholder="Search by Complaint ID or Keyword (e.g. #1042)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-filter-tabs">
            {['All', 'Success', 'Low Confidence', 'Failed', 'Review'].map(tab => (
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

        {/* AI Logs Table with MODEL column next to TIME, NO Confidence column */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>MODEL</th>
                <th>SOURCE</th>
                <th>COMPLAINT ID</th>
                <th>TASK</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No AI execution logs match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const isSummarization = log.task === 'Summarization';
                  const modelName = isSummarization ? 'Gemini' : 'Hugging Face';
                  return (
                    <tr key={log.id}>
                      <td>
                        <span style={{ color: '#cbd5e1', fontSize: '0.84rem' }}>{log.time}</span>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{log.date}</div>
                      </td>
                      <td>
                        <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
                          {modelName}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{log.source}</span>
                      </td>
                      <td>
                        <strong style={{ color: '#38bdf8' }}>{log.complaintId}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.86rem', color: '#cbd5e1' }}>{log.task}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${log.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {log.status === 'Success' ? '✓ ' : log.status === 'Failed' ? '✕ ' : '⚠ '}
                          {log.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
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

      {/* AI ANALYSIS INSPECTOR MODAL */}
      {selectedLog && (
        <div className="admin-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="admin-modal admin-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BrainCircuit size={22} className="text-cyan-400" />
                <div>
                  <h3>AI ANALYSIS – {selectedLog.task === 'Summarization' ? 'Gemini' : 'Hugging Face'}</h3>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Log Reference #{selectedLog.id}
                  </span>
                </div>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedLog(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Meta Grid (No Confidence) */}
              <div className="admin-inspector-block">
                <div className="admin-meta-grid">
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Time & Date</span>
                    <span className="admin-meta-value">{selectedLog.date}, {selectedLog.time}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Model</span>
                    <span className="admin-meta-value" style={{ color: selectedLog.task === 'Summarization' ? '#38bdf8' : '#fbbf24', fontWeight: 700 }}>
                      {selectedLog.task === 'Summarization' ? 'Gemini' : 'Hugging Face'}
                    </span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Source</span>
                    <span className="admin-meta-value">{selectedLog.source}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Related Target</span>
                    <span className="admin-meta-value" style={{ color: '#38bdf8', fontWeight: 700 }}>
                      {selectedLog.complaintId}
                    </span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">AI Task</span>
                    <span className="admin-meta-value">{selectedLog.task}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Execution Status</span>
                    <span className="admin-meta-value">
                      <span className={`admin-badge ${selectedLog.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {selectedLog.status}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Task-specific inspection: Summarization ONLY for summary task */}
              {selectedLog.task === 'Summarization' && (
                <div className="admin-inspector-block" style={{ borderLeft: '3px solid #38bdf8' }}>
                  <h4><Sparkles size={14} className="text-cyan-400" /> Complaint Summarization</h4>
                  
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      INPUT description:
                    </span>
                    <div className="admin-inspector-text" style={{ marginTop: '4px', fontStyle: 'italic' }}>
                      "{selectedLog.inputDescription}"
                    </div>
                  </div>

                  <div style={{ marginTop: '14px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      OUTPUT summary:
                    </span>
                    <div className="admin-inspector-text" style={{ marginTop: '4px', color: '#38bdf8', fontWeight: 600 }}>
                      "{selectedLog.outputSummary}"
                    </div>
                  </div>
                </div>
              )}

              {/* Task-specific inspection: Categorization ONLY for categorization task */}
              {selectedLog.task !== 'Summarization' && (
                <div className="admin-inspector-block" style={{ borderLeft: '3px solid #10b981' }}>
                  <h4><Layers size={14} className="text-emerald-400" /> Categorization</h4>

                  <div style={{ marginTop: '10px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      INPUT:
                    </span>
                    <div className="admin-inspector-text" style={{ marginTop: '4px' }}>
                      {selectedLog.categorizationInput || `Summary: ${selectedLog.outputSummary}`}
                    </div>
                  </div>

                  <div style={{ marginTop: '14px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      OUTPUT:
                    </span>
                    <div className="admin-inspector-text" style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>Category: <strong style={{ color: '#ffffff' }}>{selectedLog.categorizationOutput?.category || 'General'}</strong></div>
                      <div>Urgency: <strong style={{ color: '#fbbf24' }}>{selectedLog.categorizationOutput?.urgency || 'Medium'}</strong></div>
                      {selectedLog.categorizationOutput?.assignedDepartment && (
                        <div>Routing: <strong style={{ color: '#38bdf8' }}>{selectedLog.categorizationOutput.assignedDepartment}</strong></div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setSelectedLog(null)}>
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
