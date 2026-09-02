import React, { useState } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Radio, 
  Volume2, 
  Play, 
  Pause, 
  Eye, 
  BrainCircuit, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  X, 
  Clock,
  Layers,
  Phone,
  Mail,
  Zap
} from 'lucide-react';
import OfficialActionModal from './OfficialActionModal';

const PRESET_IMAGE_URLS = {
  'drain_overflow.jpg': 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop',
  'road_condition.jpg': 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop',
  'road_damage.jpg': 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=600&auto=format&fit=crop',
  'garbage.jpg': 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop',
  'streetlight.jpg': 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=600&auto=format&fit=crop',
  'before.jpg': 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop',
  'after.jpg': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop'
};

export default function OfficialComplaintFile({ complaint, onBack, onRefresh }) {
  const [showActionModal, setShowActionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showAiDiagnostic, setShowAiDiagnostic] = useState(false);

  if (!complaint) {
    return (
      <div className="official-card">
        <p>No complaint selected.</p>
        <button className="official-btn official-btn-primary" onClick={onBack}>Return to List</button>
      </div>
    );
  }

  const toggleAudioPlayback = () => {
    setIsPlayingAudio(prev => !prev);
  };

  // Complaints with status "Pending Review", "Pending", or "Under Review" have "Take Action".
  // Once an action is submitted and status updates (e.g. "In Progress", "Resolved", etc.), "View History" is displayed.
  const isPendingReview = 
    complaint.status === 'Pending Review' || 
    complaint.status === 'Pending' || 
    complaint.status === 'Under Review';

  const isActionTaken = !isPendingReview;

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <div style={{ marginBottom: '18px' }}>
        <button className="official-btn official-btn-secondary official-btn-sm" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Assigned Complaints</span>
        </button>
      </div>

      {/* 2) Complaint File Header */}
      <div className="official-card">
        <div className="complaint-file-header">
          <div>
            <div className="complaint-file-id-row">
              <span className="complaint-file-id">COMPLAINT #{complaint.id}</span>
              <span className={`status-pill ${complaint.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {complaint.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {!isActionTaken ? (
              <button 
                className="official-btn official-btn-primary"
                onClick={() => setShowActionModal(true)}
              >
                <Zap size={16} />
                <span>Take Action</span>
              </button>
            ) : (
              <button 
                className="official-btn official-btn-secondary"
                onClick={() => setShowHistoryModal(true)}
              >
                <Clock size={16} />
                <span>View History</span>
              </button>
            )}
          </div>
        </div>

        {/* Issue Highlights & AI Label */}
        <div className="issue-highlight-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ISSUE SUMMARY
            </span>
            <span className="ai-tag">AI Assisted Complaint Label</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 6px 0' }}>
            {complaint.title || complaint.issue}
          </h3>
          <p style={{ color: '#334155', fontSize: '0.92rem', lineHeight: '1.5', margin: 0 }}>
            {complaint.description}
          </p>
        </div>

        {/* Source & Metadata Grid */}
        <div className="file-info-grid">
          {/* Source: Citizen info */}
          <div className="file-info-box">
            <div className="file-info-label">
              <User size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Source Information (Citizen)
            </div>
            <div className="file-info-val">{complaint.citizenName || 'Niharika Maurya'}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              <div><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />{complaint.citizenEmail || 'citizen@nagrik.in'}</div>
              <div><Phone size={12} style={{ display: 'inline', marginRight: '4px' }} />{complaint.citizenPhone || '+91 9876543210'}</div>
            </div>
          </div>

          {/* Category & Urgency */}
          <div className="file-info-box">
            <div className="file-info-label">Category & Urgency</div>
            <div className="file-info-val" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{complaint.category}</span>
              <span className={`urgency-pill ${complaint.urgency?.toLowerCase() || 'medium'}`}>
                <span className={`urgency-dot ${complaint.urgency === 'High' || complaint.urgency === 'Critical' ? 'red' : complaint.urgency === 'Medium' ? 'amber' : 'green'}`}></span>
                {complaint.urgency} Urgency
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
              <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Submitted: {complaint.submittedDate}
            </div>
          </div>

          {/* Location with Map trigger */}
          <div className="file-info-box">
            <div className="file-info-label">
              <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Location
            </div>
            <div className="file-info-val">{complaint.locationName || 'ABC School, XYZ Road'}</div>
            <button 
              className="official-btn official-btn-outline official-btn-sm" 
              style={{ marginTop: '8px', width: '100%' }}
              onClick={() => setShowMapModal(true)}
            >
              <MapPin size={14} />
              <span>View on Map</span>
            </button>
          </div>
        </div>

        {/* 3) Evidence Section */}
        <div className="evidence-section">
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#0284c7" />
            <span>EVIDENCE</span>
          </h4>

          {/* Image Evidence */}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              Images Attached:
            </div>
            <div className="evidence-grid">
              {(complaint.evidence && complaint.evidence.length > 0 ? complaint.evidence : ['drain_overflow.jpg', 'road_condition.jpg']).map((imgName, index) => {
                const imgUrl = PRESET_IMAGE_URLS[imgName] || PRESET_IMAGE_URLS['drain_overflow.jpg'];
                return (
                  <div key={index} className="evidence-card">
                    <img src={imgUrl} alt={imgName} onClick={() => setSelectedImage({ name: imgName, url: imgUrl })} />
                    <div className="evidence-caption">
                      <span>{imgName}</span>
                      <button 
                        className="official-btn-outline official-btn-sm" 
                        style={{ padding: '3px 6px', fontSize: '0.72rem' }}
                        onClick={() => setSelectedImage({ name: imgName, url: imgUrl })}
                      >
                        <Eye size={12} />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sensor Evidence (if supported) */}
          <div style={{ marginTop: '22px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              Sensor Evidence (IoT Telemetry):
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Radio size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                    {complaint.sensorEvidence?.sensorId || 'SENSOR #01'} &bull; {complaint.sensorEvidence?.model || 'HydroTrack Pro v3'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    <MapPin size={11} style={{ display: 'inline', marginRight: '2px' }} />
                    GPS Location: {complaint.sensorEvidence?.location || complaint.locationName || 'ABC School, XYZ Road'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Live Sensor Reading</div>
                  <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '1rem' }}>
                    {complaint.sensorEvidence?.reading || '72% (Surge Warning)'}
                  </div>
                </div>
                <span className="urgency-pill high">Elevated</span>
              </div>
            </div>
          </div>

          {/* Audio Evidence */}
          <div style={{ marginTop: '22px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
              Additional Information - Audio Recording:
            </div>
            <div className="audio-player-card">
              <div className="audio-info">
                <div className="audio-icon-wrap">
                  <Volume2 size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                    {complaint.audioEvidence || 'complaint_audio.mp3'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                    Citizen voice note (0:42) &bull; Recorded on mobile app
                  </div>
                </div>
              </div>

              {/* Waveform Animation */}
              {isPlayingAudio && (
                <div className="audio-waveform">
                  {[40, 70, 90, 60, 80, 100, 50, 85, 65, 45, 95, 75, 55, 80, 60].map((h, i) => (
                    <div 
                      key={i} 
                      className="audio-bar" 
                      style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }}
                    />
                  ))}
                </div>
              )}

              <button 
                className="official-btn official-btn-primary official-btn-sm" 
                onClick={toggleAudioPlayback}
              >
                {isPlayingAudio ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlayingAudio ? 'Pause Audio' : 'Play Audio'}</span>
              </button>
            </div>
          </div>

          {/* AI Assessment Panel Toggle */}
          <div style={{ marginTop: '24px' }}>
            <button 
              className="official-btn official-btn-secondary" 
              style={{ width: '100%', justifyContent: 'space-between' }}
              onClick={() => setShowAiDiagnostic(!showAiDiagnostic)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrainCircuit size={16} color="#0284c7" />
                <span style={{ fontWeight: 600 }}>AI Assessment</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#0284c7' }}>
                {showAiDiagnostic ? 'Hide Details' : 'View AI Assessment'}
              </span>
            </button>

            {showAiDiagnostic && complaint.aiAssessment && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginTop: '10px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Understanding:</span>
                  <p style={{ fontSize: '0.88rem', color: '#1e293b', margin: '4px 0 0 0' }}>{complaint.aiAssessment.understanding}</p>
                </div>

                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Cited Municipal Ordinances:</span>
                  <ul style={{ paddingLeft: '20px', marginTop: '4px', fontSize: '0.84rem', color: '#475569' }}>
                    {complaint.aiAssessment.relevantLaws?.map((law, i) => (
                      <li key={i}>{law}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Assigned Authority:</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0284c7', marginTop: '2px' }}>
                    {complaint.aiAssessment.suggestedAuthority}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="action-modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="action-modal" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="action-modal-header">
              <h3>Evidence Preview: {selectedImage.name}</h3>
              <button className="official-btn-secondary official-btn-sm" onClick={() => setSelectedImage(null)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <img 
                src={selectedImage.url} 
                alt={selectedImage.name} 
                style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '8px', objectFit: 'contain' }} 
              />
            </div>
            <div className="action-modal-footer">
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>GPS metadata and timestamp validated.</span>
              <button className="official-btn official-btn-secondary" onClick={() => setSelectedImage(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Map Preview Modal */}
      {showMapModal && (
        <div className="action-modal-overlay" onClick={() => setShowMapModal(false)}>
          <div className="action-modal" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div className="action-modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700 }}>GEOGRAPHIC LOCATION</span>
                <h3>{complaint.locationName || 'ABC School, XYZ Road'}</h3>
              </div>
              <button className="official-btn-secondary official-btn-sm" onClick={() => setShowMapModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="map-canvas-mock">
                <div className="map-pin-pulse">
                  <div className="map-pin-badge">
                    <MapPin size={14} style={{ display: 'inline', marginRight: '4px', color: '#f87171' }} />
                    #{complaint.id} Location
                  </div>
                  <div style={{ width: '12px', height: '12px', borderRadius: '999px', background: '#ef4444', border: '2px solid #ffffff' }}></div>
                </div>
              </div>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                <span>Coordinates: 28.6139° N, 77.2090° E</span>
                <span>Ward: Zone 4 (Central North)</span>
              </div>
            </div>
            <div className="action-modal-footer">
              <button className="official-btn official-btn-secondary" onClick={() => setShowMapModal(false)}>Close Map</button>
              {!isActionTaken ? (
                <button className="official-btn official-btn-primary" onClick={() => { setShowMapModal(false); setShowActionModal(true); }}>
                  Proceed to Action
                </button>
              ) : (
                <button className="official-btn official-btn-primary" onClick={() => { setShowMapModal(false); setShowHistoryModal(true); }}>
                  View History
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View History Modal (Timeline of action taken) */}
      {showHistoryModal && (
        <div className="action-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="action-modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="action-modal-header">
              <div>
                <span style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase' }}>
                  HISTORY & TIMELINE &bull; #{complaint.id}
                </span>
                <h3 style={{ marginTop: '2px' }}>Action & Status History</h3>
              </div>
              <button className="official-btn-secondary official-btn-sm" onClick={() => setShowHistoryModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="action-modal-body">
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.98rem' }}>
                  {complaint.title || complaint.issue}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#0369a1', marginTop: '4px', fontWeight: 600 }}>
                  Decision: {complaint.officialAction?.decision || 'Verified'} &bull; Action: {complaint.officialAction?.actionSelected || 'Inspection Scheduled'}
                </div>
              </div>

              <div className="timeline-tracker">
                {complaint.history && complaint.history.map((step, idx) => {
                  const isLast = idx === complaint.history.length - 1;
                  return (
                    <div key={idx} className={`timeline-node-item ${isLast ? 'current' : 'done'}`}>
                      <div className="timeline-spine">
                        <div className="timeline-icon-dot">
                          {isLast ? '●' : '✓'}
                        </div>
                        {idx < complaint.history.length - 1 && (
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
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3.1) Action Workflow Modal */}
      {showActionModal && (
        <OfficialActionModal 
          complaint={complaint}
          onClose={() => setShowActionModal(false)}
          onSuccess={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}
