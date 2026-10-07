import React, { useState, useEffect, useRef } from 'react';
import { Save, AlertCircle, Check, ArrowRight, ArrowLeft, MapPin, Upload, X, BrainCircuit, ShieldAlert, CheckCircle, FileText } from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

export default function FileComplaint({ setActiveTab, initialEditComplaintId = null }) {
  const [step, setStep] = useState(1);
  const [complaintId, setComplaintId] = useState(initialEditComplaintId);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Waste Management',
    description: '',
    locationName: '',
    locationCoordinates: { x: 150, y: 150 },
    evidence: [],
    aiAssessment: null
  });

  const [error, setError] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const mapCanvasRef = useRef(null);
  const [evidenceFile, setEvidenceFile] = useState(null);

  // Load draft or existing complaint details on mount
  useEffect(() => {
    if (initialEditComplaintId) {
      const complaints = mockDb.getComplaints();
      const existing = complaints.find(c => c.id === initialEditComplaintId);
      if (existing) {
        setFormData({
          title: existing.title,
          category: existing.category,
          description: existing.description,
          locationName: existing.locationName,
          locationCoordinates: existing.locationCoordinates || { x: 150, y: 150 },
          evidence: existing.evidence || [],
          aiAssessment: existing.aiAssessment || null
        });
      }
    } else {
      const draft = mockDb.getDraft();
      if (draft) {
        setFormData(draft);
      }
    }
  }, [initialEditComplaintId]);

  // Redraw mock map when coordinates change or step changes to 2
  useEffect(() => {
    if (step === 2 && mapCanvasRef.current) {
      drawMap();
    }
  }, [step, formData.locationCoordinates]);

  const drawMap = () => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background city map design
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw block grids representing city streets
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    for (let i = 40; i < canvas.width; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let j = 40; j < canvas.height; j += 60) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(canvas.width, j);
      ctx.stroke();
    }

    // Draw main avenue boulevard labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText("Civic Boulevard", 50, 30);
    ctx.fillText("Sector 4 Avenue", 200, 160);
    ctx.fillText("Metro Crossing", 80, 240);

    // Draw some parks/buildings
    ctx.fillStyle = '#dcfce7'; // green park
    ctx.fillRect(20, 60, 100, 60);
    ctx.fillStyle = '#16a34a';
    ctx.fillText("Public Park", 35, 95);

    ctx.fillStyle = '#fee2e2'; // hospital / school zone
    ctx.fillRect(220, 50, 110, 70);
    ctx.fillStyle = '#dc2626';
    ctx.fillText("School Zone", 245, 90);

    // Draw current pin location
    const { x, y } = formData.locationCoordinates;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#2563eb';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Secondary pulse ring
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  const handleMapClick = (e) => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Auto name location based on grid
    let sector = "Sector 4";
    if (x > 200 && y < 150) sector = "School Zone Area";
    else if (x < 150 && y < 150) sector = "Public Park Lane";
    else if (y > 200) sector = "Metro Crossing Road";

    const mockAddress = `${sector}, Grid Coordinates: (${Math.round(x)}, ${Math.round(y)})`;

    setFormData({
      ...formData,
      locationCoordinates: { x, y },
      locationName: mockAddress
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setFormData(prev => ({
          ...prev,
          locationName: `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }));
      },
      (error) => {
        if (error.code === 1) {
          setError('Location permission denied. Please allow location access in your browser settings.');
        } else if (error.code === 2) {
          setError('Your location could not be determined. Please try again.');
        } else {
          setError('Location request timed out. Please try again.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleSaveDraft = () => {
    setSavingDraft(true);
    mockDb.saveDraft(formData);
    setTimeout(() => {
      setSavingDraft(false);
      alert('Draft saved successfully! You can resume filing this complaint later.');
    }, 600);
  };

  const handleNextStep = () => {
    if (step === 1 && !formData.description.trim()) {
      setError('Please describe the civic issue before proceeding.');
      return;
    }

    if (step === 2 && !formData.locationName.trim()) {
      setError('Please specify the location address or click on the map.');
      return;
    }

    setError('');
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleAnalyzeComplaint = async () => {
  if (!evidenceFile) {
    setError('Please upload a photo first.');
    return;
  }

  if (!formData.description.trim()) {
    setError('Please describe the civic issue first.');
    return;
  }

  setAnalyzing(true);
  setError('');

  try {
    // Retrieve the login token.
const token = localStorage.getItem('nagrikai_token');
    if (!token) {
      throw new Error('Please log in again to analyze your complaint.');
    }

    const response = await fetch(
      'http://localhost:5000/api/complaints/analyze',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: formData.description
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || 'AI assessment failed.'
      );
    }

    const assessment = data.assessment;

    setFormData(prev => ({
      ...prev,
      aiAssessment: assessment,
      category: assessment.category || prev.category,
      title: assessment.subcategory || prev.title
    }));

    setStep(4);

  } catch (error) {
    setError(
      error.message || 'Could not connect to the AI service.'
    );
  } finally {
    setAnalyzing(false);
  }
};

  const handleFileComplaint = () => {
    const finalComplaint = {
      id: complaintId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      locationName: formData.locationName,
      locationCoordinates: formData.locationCoordinates,
      evidence: formData.evidence,
      aiAssessment: formData.aiAssessment
    };

    mockDb.saveComplaint(finalComplaint);
    mockDb.clearDraft();
    setActiveTab('my-complaints');
  };

  return (
    <div className="file-complaint-container container animate-fade-in">
      {/* Page Header */}
      <div className="wizard-header">
        <div className="wizard-title-block">
          <h2>File Civic Complaint</h2>
          <p>Submit neighborhood issues with details, map coordinates, and visual evidence</p>
        </div>
        <button className="btn-secondary" onClick={handleSaveDraft} disabled={savingDraft}>
          <Save size={16} />
          <span>{savingDraft ? 'Saving...' : 'Save Draft'}</span>
        </button>
      </div>

      {/* Progress Wizard Steps */}
      <div className="wizard-steps-indicator">
        {[
          { num: 1, label: "Description" },
          { num: 2, label: "Location" },
          { num: 3, label: "Evidence" },
          { num: 4, label: "Assessment" }
        ].map((s) => (
          <div key={s.num} className={`step-indicator-node ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
            <div className="node-circle">
              {step > s.num ? <Check size={14} /> : s.num}
            </div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Wizard Form Frame */}
      <div className="wizard-card glass-card">
        {error && (
          <div className="form-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: DESCRIBE ISSUE */}
        {step === 1 && (
          <div className="wizard-step-content animate-fade-up">
            <h3>Step 1: Describe the Civic Issue</h3>
            <p className="step-subtitle">Explain the incident or issue in detail so operators can triage it correctly.</p>

            <div className="form-group">
              <label htmlFor="complaint-desc">What happened?</label>
              <textarea
                id="complaint-desc"
                rows={6}
                placeholder="Provide a detailed description of what happened, where exactly, and when you first noticed it..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <span className="input-hint">Tell us what happened, where and when.</span>
            </div>

            <div className="wizard-actions">
              <div></div> {/* Empty for alignment */}
              <button className="btn-primary" onClick={handleNextStep}>
                <span>Next: Location</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION SELECTOR */}
        {step === 2 && (
          <div className="wizard-step-content animate-fade-up">
            <h3>Step 2: Pin Location</h3>
            <p className="step-subtitle">Indicate exactly where the issue is. Pin coordinates allow field teams to locate the problem immediately.</p>

            <div className="location-control-buttons">
              <button className="btn-secondary" onClick={handleUseCurrentLocation}>
                <MapPin size={16} />
                <span>Use Current Location</span>
              </button>
            </div>

            <div className="map-mockup-frame">
              <canvas
                ref={mapCanvasRef}
                width={360}
                height={260}
                onClick={handleMapClick}
                className="map-canvas-element"
                title="Click anywhere to place the issue pin"
              />
              <span className="map-instruction-overlay">Click on map grid to place pin</span>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label htmlFor="location-address">Selected Location Address</label>
              <input
                type="text"
                id="location-address"
                placeholder="e.g. Near main park gate, sector 4"
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              />
            </div>

            <div className="wizard-actions">
              <button className="btn-secondary" onClick={handlePrevStep}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button className="btn-primary" onClick={handleNextStep}>
                <span>Next: Evidence</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: EVIDENCE UPLOAD */}
        {step === 3 && (
          <div className="wizard-step-content animate-fade-up">
            <h3>Step 3: Upload Evidence</h3>
            <p className="step-subtitle">
              Upload a photograph of the civic issue. A photo is required
              to proceed.
            </p>

            <div className="form-group">
              <label htmlFor="complaint-evidence">
                Choose a photo
              </label>

              <input
                type="file"
                id="complaint-evidence"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;

                  setEvidenceFile(file);
                  setFormData(prev => ({
                    ...prev,
                    evidence: file ? [file.name] : []
                  }));
                  setError('');
                }}
              />

              {evidenceFile && (
                <div className="uploaded-list-box">
                  <h4>Selected Photo</h4>
                  <div className="selected-image-chips">
                    <div className="image-chip">
                      <span>{evidenceFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEvidenceFile(null);
                          setFormData(prev => ({
                            ...prev,
                            evidence: []
                          }));

                          const input = document.getElementById(
                            'complaint-evidence'
                          );

                          if (input) input.value = '';
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="wizard-actions">
              <button
                className="btn-secondary"
                onClick={handlePrevStep}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>

              {evidenceFile && (
                <button
                  className="btn-primary-large glowing-btn"
                  onClick={handleAnalyzeComplaint}
                  disabled={analyzing}
                >
                  <BrainCircuit size={18} />
                  <span>
                    {analyzing
                      ? 'Analyzing Complaint Details...'
                      : 'Analyze Complaint'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: AI REPORT CARD */}
        {step === 4 && formData.aiAssessment && (
          <div className="wizard-step-content animate-fade-up">
            <div className="assessment-success-banner">
              <BrainCircuit className="banner-ai-icon" size={28} />
              <div>
                <h3>AI Assessment Completed</h3>
                <p>The system has analyzed your report, cited relevant legal codes, and suggested the local department.</p>
              </div>
            </div>

            <div className="ai-report-card">
              <div className="ai-card-section">
                <span className="ai-section-label">Verified Issue Category</span>
                <span className="ai-category-badge">{formData.aiAssessment.category}</span>
              </div>

              <div className="ai-card-section highlighted">
                <span className="ai-section-label">AI Understanding Summary</span>
                <p className="ai-understanding-text">{formData.aiAssessment.understanding}</p>
              </div>

              <div className="ai-card-section">
                <span className="ai-section-label">Relevant Legal Citations & Civic Rights</span>
                <ul className="ai-laws-list">
                  {formData.aiAssessment.relevantLaws.map((law, index) => (
                    <li key={index}>
                      <ShieldAlert size={14} className="law-icon" />
                      <span>{law}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ai-card-section">
                <span className="ai-section-label">Suggested Municipal Authority</span>
                <div className="ai-authority-box">
                  <CheckCircle size={14} className="auth-icon" />
                  <span>{formData.aiAssessment.suggestedAuthority}</span>
                </div>
              </div>
            </div>

            <div className="wizard-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                <ArrowLeft size={16} />
                <span>Edit Complaint</span>
              </button>
              <div className="right-actions-group">
                <button className="btn-primary" onClick={handleFileComplaint}>
                  <span>File Complaint</span>
                  <Check size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

