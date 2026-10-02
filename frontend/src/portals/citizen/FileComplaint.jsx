import React, { useState, useEffect, useRef } from 'react';
import { Save, AlertCircle, Check, ArrowRight, ArrowLeft, MapPin, Upload, X, BrainCircuit, ShieldAlert, CheckCircle, FileText } from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

const PRESET_MOCK_IMAGES = [
  { name: 'garbage.jpg', category: 'Waste Management', url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=150&auto=format&fit=crop' },
  { name: 'pothole.jpg', category: 'Infrastructure / Roads', url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=150&auto=format&fit=crop' },
  { name: 'streetlight.jpg', category: 'Public Utilities', url: 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=150&auto=format&fit=crop' },
  { name: 'leakage.jpg', category: 'Water & Sanitation', url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=150&auto=format&fit=crop' }
];

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
    const randomX = Math.floor(60 + Math.random() * 260);
    const randomY = Math.floor(60 + Math.random() * 180);
    setFormData({
      ...formData,
      locationCoordinates: { x: randomX, y: randomY },
      locationName: `Sector 4, GPS Coordinates: (${randomX}.42, ${randomY}.76)`
    });
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
    if (step === 1) {
      if (!formData.title.trim() || !formData.description.trim()) {
        setError('Please enter both title and description details.');
        return;
      }
      setError('');
    }
    if (step === 2) {
      if (!formData.locationName.trim()) {
        setError('Please specify the location address or click on the map.');
        return;
      }
      setError('');
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSelectPresetImage = (presetName) => {
    if (formData.evidence.includes(presetName)) {
      setFormData({
        ...formData,
        evidence: formData.evidence.filter(img => img !== presetName)
      });
    } else {
      setFormData({
        ...formData,
        evidence: [...formData.evidence, presetName]
      });
    }
  };

  const handleAnalyzeComplaint = () => {
    setAnalyzing(true);
    setTimeout(() => {
      const assessment = mockDb.analyzeComplaintDescription(formData.description);
      setFormData(prev => ({
        ...prev,
        aiAssessment: assessment,
        category: assessment.category // Update category to AI predicted category
      }));
      setAnalyzing(false);
      setStep(5);
    }, 1500);
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
          { num: 4, label: "Review" },
          { num: 5, label: "Assessment" }
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
              <label htmlFor="complaint-title">Complaint Title</label>
              <input
                type="text"
                id="complaint-title"
                placeholder="e.g. Garbage accumulation near school gate"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

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

            <div className="form-group">
              <label htmlFor="complaint-category">Initial Category</label>
              <select
                id="complaint-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Waste Management">Waste Management</option>
                <option value="Public Utilities">Public Utilities</option>
                <option value="Infrastructure / Roads">Infrastructure / Roads</option>
                <option value="Water & Sanitation">Water & Sanitation</option>
                <option value="General Municipal Issue">General Municipal Issue</option>
              </select>
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
            <p className="step-subtitle">Adding photographs helps verify reports and speeds up division approvals. (You may skip this step if no photos are available).</p>

            <div className="preset-upload-header">
              <span>Select mock photos matching your report category:</span>
            </div>

            <div className="preset-images-grid">
              {PRESET_MOCK_IMAGES.map((img) => {
                const isSelected = formData.evidence.includes(img.name);
                return (
                  <div 
                    key={img.name} 
                    className={`preset-image-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectPresetImage(img.name)}
                  >
                    <img src={img.url} alt={img.name} />
                    <div className="preset-meta">
                      <span className="preset-name">{img.name}</span>
                      <span className="preset-badge">{img.category}</span>
                    </div>
                    {isSelected && (
                      <div className="selected-check-overlay">
                        <Check size={18} className="check-icon" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {formData.evidence.length > 0 && (
              <div className="uploaded-list-box">
                <h4>Selected Evidence to Upload:</h4>
                <div className="selected-image-chips">
                  {formData.evidence.map(name => (
                    <div key={name} className="image-chip">
                      <span>{name}</span>
                      <button onClick={() => handleSelectPresetImage(name)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="wizard-actions">
              <button className="btn-secondary" onClick={handlePrevStep}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <div className="right-actions-group">
                {formData.evidence.length === 0 && (
                  <button className="btn-text" onClick={handleNextStep}>
                    Skip Evidence
                  </button>
                )}
                <button className="btn-primary" onClick={handleNextStep}>
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: AI PRE-ASSESSMENT SCREEN */}
        {step === 4 && (
          <div className="wizard-step-content animate-fade-up">
            <h3>Step 4: AI Assessment Screen</h3>
            <p className="step-subtitle">Review your documented details before triggering our AI verification assessment model.</p>

            <div className="review-details-box">
              <div className="review-row">
                <span className="review-label">Title</span>
                <span className="review-value font-bold">{formData.title}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Category Selection</span>
                <span className="review-value">{formData.category}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Description</span>
                <span className="review-value desc-text">{formData.description}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Location Address</span>
                <span className="review-value">{formData.locationName}</span>
              </div>
              <div className="review-row">
                <span className="review-label">Image Evidence</span>
                <span className="review-value">
                  {formData.evidence.length === 0 ? 'No evidence attached' : formData.evidence.join(', ')}
                </span>
              </div>
            </div>

            <div className="wizard-actions">
              <button className="btn-secondary" onClick={handlePrevStep}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button 
                className="btn-primary-large glowing-btn" 
                onClick={handleAnalyzeComplaint}
                disabled={analyzing}
              >
                <BrainCircuit size={18} />
                <span>{analyzing ? 'Analyzing Complaint Details...' : 'Analyze Complaint'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: AI REPORT CARD */}
        {step === 5 && formData.aiAssessment && (
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
