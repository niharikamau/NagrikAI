import React, { useState } from 'react';
import { 
  Radio, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Eye, 
  Sliders, 
  X, 
  Check, 
  History, 
  Cpu
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

export default function AdminIoTMonitoring({ 
  sensors, 
  detectedEvents, 
  onRefresh, 
  selectedSensor, 
  setSelectedSensor 
}) {
  const [activeTab, setActiveTab] = useState('sensors');
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Edit threshold state inside sensor modal
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [newThresholdValue, setNewThresholdValue] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Stats
  const activeSensorsCount = sensors.filter(s => s.status === 'Online').length;
  const offlineSensorsCount = sensors.filter(s => s.status === 'Offline').length;
  const recentEventsCount = detectedEvents.length;

  const handleOpenSensor = (sensor) => {
    setSelectedSensor(sensor);
    setNewThresholdValue(sensor.thresholdValue || 85);
    setIsEditingThreshold(false);
    setActionSuccess('');
  };

  const handleSaveThreshold = (e) => {
    e.preventDefault();
    if (!selectedSensor) return;

    const unit = selectedSensor.unit || '%';
    const updated = mockDb.updateSensor(selectedSensor.id, {
      threshold: `${newThresholdValue} ${unit}`,
      thresholdValue: Number(newThresholdValue)
    });

    if (updated) {
      setSelectedSensor(updated);
      setActionSuccess(`Threshold updated to ${newThresholdValue} ${unit} successfully.`);
      setIsEditingThreshold(false);
      onRefresh();
    }
  };

  const handleMarkEventReviewed = (eventId) => {
    mockDb.markEventReviewed(eventId);
    setActionSuccess(`Event ${eventId} marked as Reviewed.`);
    onRefresh();
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(prev => ({ ...prev, status: 'Reviewed' }));
    }
  };

  return (
    <div className="admin-section-content animate-fade-in">
      {/* Header without subtitle */}
      <div className="admin-header-row">
        <div>
          <h1>IoT Monitoring</h1>
        </div>

        {/* Badges strip */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ padding: '8px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>ACTIVE SENSORS:</span>
            <strong style={{ color: '#34d399', fontSize: '1rem' }}>{activeSensorsCount}</strong>
          </div>

          <div style={{ padding: '8px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>OFFLINE:</span>
            <strong style={{ color: '#f87171', fontSize: '1rem' }}>{offlineSensorsCount}</strong>
          </div>

          <div style={{ padding: '8px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>RECENT EVENTS:</span>
            <strong style={{ color: '#60a5fa', fontSize: '1rem' }}>{recentEventsCount}</strong>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div style={{ padding: '10px 14px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '8px', color: '#34d399', fontSize: '0.86rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="admin-toolbar" style={{ marginBottom: '16px' }}>
        <div className="admin-filter-tabs">
          <button 
            className={`admin-filter-tab ${activeTab === 'sensors' ? 'active' : ''}`}
            onClick={() => setActiveTab('sensors')}
          >
            <Radio size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Sensor Fleet ({sensors.length})
          </button>
          <button 
            className={`admin-filter-tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px' }} />
            Detected Events ({detectedEvents.length})
          </button>
        </div>
      </div>

      {/* SENSOR FLEET CARDS GRID */}
      {activeTab === 'sensors' && (
        <div className="admin-sensor-grid">
          {sensors.map(sensor => (
            <div key={sensor.id} className="admin-sensor-card">
              <div className="admin-sensor-header">
                <div className="admin-sensor-id">
                  <Cpu size={18} className="text-blue-400" />
                  <span>{sensor.id}</span>
                </div>
                <span className={`admin-badge ${sensor.status.toLowerCase()}`}>
                  <span className={sensor.status === 'Online' ? 'admin-online-dot' : 'admin-offline-dot'}></span>
                  {sensor.status}
                </span>
              </div>

              <div className="admin-sensor-body">
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f1f5f9' }}>
                  {sensor.type}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <MapPin size={14} className="text-rose-400" />
                  <span>{sensor.location}</span>
                </div>

                <div className="admin-sensor-metric-row">
                  <span>Urgency Level</span>
                  <span className={`admin-badge ${sensor.urgency.toLowerCase()}`}>
                    {sensor.urgency}
                  </span>
                </div>

                <div className="admin-sensor-metric-row">
                  <span>Current Reading</span>
                  <span className="val" style={{ color: sensor.status === 'Online' ? '#38bdf8' : '#94a3b8' }}>
                    {sensor.currentReading}
                  </span>
                </div>

                <div className="admin-sensor-metric-row">
                  <span>Alert Threshold</span>
                  <span className="val" style={{ color: '#fbbf24' }}>
                    {sensor.threshold}
                  </span>
                </div>

                {sensor.lastEvent && (
                  <div style={{ fontSize: '0.74rem', color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '6px 8px', borderRadius: '6px', marginTop: '4px' }}>
                    <strong>Alert:</strong> {sensor.lastEvent}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button 
                  className="admin-btn admin-btn-primary admin-btn-sm full-width"
                  onClick={() => handleOpenSensor(sensor)}
                >
                  <Eye size={13} />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETECTED EVENTS VIEW */}
      {activeTab === 'events' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Detected Events Log</h3>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>EVENT ID</th>
                  <th>EVENT TYPE</th>
                  <th>SENSOR / LOCATION</th>
                  <th>READING vs THRESHOLD</th>
                  <th>TIME</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {detectedEvents.map(evt => (
                  <tr key={evt.id}>
                    <td>
                      <strong style={{ color: '#f87171' }}>{evt.id}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{evt.eventType}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{evt.notes}</div>
                    </td>
                    <td>
                      <span style={{ color: '#38bdf8', fontWeight: 500 }}>{evt.sensorId}</span>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{evt.location}</div>
                    </td>
                    <td>
                      <strong style={{ color: '#ef4444' }}>{evt.reading}</strong>
                      <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}> (Limit: {evt.threshold})</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{evt.time}</span>
                    </td>
                    <td>
                      <span className={`admin-badge ${evt.status === 'New' ? 'critical' : 'active'}`}>
                        {evt.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setSelectedEvent(evt)}
                        >
                          <Eye size={12} />
                          <span>View Evidence</span>
                        </button>
                        {evt.status === 'New' && (
                          <button 
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            onClick={() => handleMarkEventReviewed(evt.id)}
                          >
                            <Check size={12} />
                            <span>Mark Reviewed</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SENSOR DETAILS MODAL */}
      {selectedSensor && (
        <div className="admin-modal-overlay" onClick={() => setSelectedSensor(null)}>
          <div className="admin-modal admin-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={22} className="text-blue-400" />
                <div>
                  <h3>{selectedSensor.id} ({selectedSensor.modelName})</h3>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {selectedSensor.type} • {selectedSensor.location}
                  </span>
                </div>
              </div>
              <button className="admin-modal-close" onClick={() => setSelectedSensor(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Sensor Parameters Grid */}
              <div className="admin-inspector-block">
                <h4><Radio size={14} /> Configuration</h4>
                <div className="admin-meta-grid" style={{ marginTop: '10px' }}>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Sensor Type</span>
                    <span className="admin-meta-value">{selectedSensor.type}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Location</span>
                    <span className="admin-meta-value">{selectedSensor.location}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Status</span>
                    <span className="admin-meta-value">
                      <span className={selectedSensor.status === 'Online' ? 'admin-online-dot' : 'admin-offline-dot'}></span>
                      {selectedSensor.status}
                    </span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Current Reading</span>
                    <span className="admin-meta-value" style={{ color: '#38bdf8', fontWeight: 700 }}>
                      {selectedSensor.currentReading}
                    </span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Configured Alert Threshold</span>
                    <span className="admin-meta-value" style={{ color: '#fbbf24', fontWeight: 700 }}>
                      {selectedSensor.threshold}
                    </span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Last Maintained</span>
                    <span className="admin-meta-value">{selectedSensor.lastMaintained}</span>
                  </div>
                </div>

                <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                  <button 
                    className="admin-btn admin-btn-outline admin-btn-sm"
                    onClick={() => setIsEditingThreshold(!isEditingThreshold)}
                  >
                    <Sliders size={13} />
                    <span>{isEditingThreshold ? 'Cancel Threshold Edit' : 'Edit Alert Threshold'}</span>
                  </button>
                </div>

                {isEditingThreshold && (
                  <form onSubmit={handleSaveThreshold} style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="number"
                      placeholder={`Threshold in ${selectedSensor.unit || '%'}`}
                      value={newThresholdValue}
                      onChange={(e) => setNewThresholdValue(e.target.value)}
                      style={{ width: '180px', padding: '8px 12px', backgroundColor: '#0f172a', border: '1px solid #3b82f6', borderRadius: '6px', color: '#ffffff', outline: 'none' }}
                      required
                    />
                    <button type="submit" className="admin-btn admin-btn-primary admin-btn-sm">
                      <Check size={13} />
                      <span>Save Threshold</span>
                    </button>
                  </form>
                )}
              </div>

              {/* RECENT READINGS */}
              <div className="admin-inspector-block">
                <h4><Clock size={14} /> Recent Readings</h4>
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {selectedSensor.recentReadings && selectedSensor.recentReadings.map((r, idx) => (
                    <div 
                      key={idx}
                      style={{
                        flex: '1',
                        minWidth: '130px',
                        padding: '12px',
                        backgroundColor: '#1e293b',
                        borderRadius: '8px',
                        border: '1px solid #334155'
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.time}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>
                        {r.value}
                      </div>
                      <span className={`admin-badge ${(r.urgency || 'Low').toLowerCase()}`}>
                        {r.urgency || 'Normal'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* READINGS HISTORY TABLE */}
              <div className="admin-inspector-block">
                <h4><History size={14} /> Readings History</h4>

                <div className="admin-table-container" style={{ marginTop: '10px' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>SNO.</th>
                        <th>READING</th>
                        <th>LOCATION</th>
                        <th>TIME</th>
                        <th>URGENCY</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSensor.historyLogs && selectedSensor.historyLogs.length > 0 ? (
                        selectedSensor.historyLogs.map(log => (
                          <tr key={log.sno}>
                            <td>#{log.sno}</td>
                            <td><strong style={{ color: '#f87171' }}>{log.reading}</strong></td>
                            <td>{log.location}</td>
                            <td>{log.time}</td>
                            <td>
                              <span className={`admin-badge ${log.urgency.toLowerCase()}`}>
                                {log.urgency}
                              </span>
                            </td>
                            <td>{log.status}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
                            No threshold breaches logged in recent cycles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setSelectedSensor(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVENT EVIDENCE MODAL */}
      {selectedEvent && (
        <div className="admin-modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>ANOMALY EVENT #{selectedEvent.id}</h3>
              <button className="admin-modal-close" onClick={() => setSelectedEvent(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-inspector-block">
                <h4>Event Summary</h4>
                <div className="admin-meta-grid" style={{ marginTop: '8px' }}>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Event Type</span>
                    <span className="admin-meta-value">{selectedEvent.eventType}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Sensor ID</span>
                    <span className="admin-meta-value">{selectedEvent.sensorId}</span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Trigger Value</span>
                    <span className="admin-meta-value" style={{ color: '#f87171', fontWeight: 700 }}>
                      {selectedEvent.reading} (Threshold: {selectedEvent.threshold})
                    </span>
                  </div>
                  <div className="admin-meta-field">
                    <span className="admin-meta-label">Detected Time</span>
                    <span className="admin-meta-value">{selectedEvent.time}</span>
                  </div>
                </div>
              </div>

              <div className="admin-inspector-block">
                <h4>Raw Payload</h4>
                <div className="admin-inspector-text" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {`{
  "event_id": "${selectedEvent.id}",
  "sensor_id": "${selectedEvent.sensorId}",
  "sample_rate_hz": 100,
  "reading_peak": "${selectedEvent.reading}",
  "safety_threshold": "${selectedEvent.threshold}",
  "checksum": "0x7F2A99",
  "dispatch_recommended": true
}`}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              {selectedEvent.status === 'New' && (
                <button 
                  className="admin-btn admin-btn-primary"
                  onClick={() => {
                    handleMarkEventReviewed(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                >
                  <Check size={14} />
                  <span>Mark Reviewed</span>
                </button>
              )}
              <button className="admin-btn admin-btn-secondary" onClick={() => setSelectedEvent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
