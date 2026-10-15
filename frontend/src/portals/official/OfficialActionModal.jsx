import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  XCircle, 
  Send,
  Building2,
  Calendar,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

export default function OfficialActionModal({ complaint, onClose, onSuccess }) {
  // Step 1: Decision Selection ('Verified' | 'Requires Information' | 'Unable to Verify' | 'Not Applicable')
  const [decision, setDecision] = useState('Verified');

  // currentStep index: 1, 2, 3 (for Verified) or 1, 2, 3, 4 (for other selections)
  const [currentStep, setCurrentStep] = useState(1);
  const [stepHistory, setStepHistory] = useState([1]);

  // Step 2 Conditional States:
  // 3.1.1 Requires Information
  const [requiredInfoTypes, setRequiredInfoTypes] = useState({
    exactLocation: false,
    additionalImage: true,
    dateTime: false,
    description: false,
    other: false
  });
  const [infoMessage, setInfoMessage] = useState('Please provide a clearer image of the affected drain.');

  // 3.1.2 Unable to verify
  const [unableReason, setUnableReason] = useState('Insufficient evidence');
  const [unableRemarks, setUnableRemarks] = useState('');

  // 3.1.3 Not Applicable
  const [notApplicableReason, setNotApplicableReason] = useState('Issue does not fall under this department');
  const [notApplicableRemarks, setNotApplicableRemarks] = useState('');

  // Action Planning
  const [selectedAction, setSelectedAction] = useState('Inspection Scheduled');

  // Status & Remarks
  const [statusChange, setStatusChange] = useState('In Progress');
  const [officialRemarks, setOfficialRemarks] = useState(
    'Inspection team has been notified. Site inspection scheduled for 13 Aug.'
  );

  const isVerifiedFlow = decision === 'Verified';
  const totalSteps = isVerifiedFlow ? 3 : 4;

  const goToNextStep = () => {
    const next = currentStep + 1;
    setStepHistory(prev => [...prev, next]);
    setCurrentStep(next);
  };

  const handleBack = () => {
    if (stepHistory.length > 1) {
      const newHistory = [...stepHistory];
      newHistory.pop();
      const previousStep = newHistory[newHistory.length - 1];
      setStepHistory(newHistory);
      setCurrentStep(previousStep);
    } else {
      onClose();
    }
  };

  const handleFinalSubmit = (e) => {
    if (e) e.preventDefault();

    let step2Payload = {};
    let remarksText = officialRemarks;

    if (decision === 'Requires Information') {
      const requestedItems = Object.keys(requiredInfoTypes).filter(k => requiredInfoTypes[k]);
      step2Payload = {
        requestedTypes: requestedItems,
        message: infoMessage
      };
      if (!remarksText) remarksText = `Information requested: ${infoMessage}`;
    } else if (decision === 'Unable to Verify') {
      step2Payload = {
        reason: unableReason,
        remarks: unableRemarks
      };
      if (!remarksText) remarksText = `Unable to verify (${unableReason}): ${unableRemarks || 'Official assessment unable to confirm complaint'}`;
    } else if (decision === 'Not Applicable') {
      step2Payload = {
        reason: notApplicableReason,
        remarks: notApplicableRemarks
      };
      if (!remarksText) remarksText = `Not applicable (${notApplicableReason}): ${notApplicableRemarks || 'Outside department mandate'}`;
    }

    mockDb.submitOfficialDecision(complaint.id, {
      step1Decision: decision,
      step2Data: step2Payload,
      step3Action: selectedAction,
      step4Status: statusChange,
      remarks: remarksText
    });

    onSuccess();
    onClose();
  };

  const toggleInfoType = (key) => {
    setRequiredInfoTypes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Stepper Header Title
  const getStepTitle = () => {
    if (currentStep === 1) return 'Step 1: Official Decision';
    if (isVerifiedFlow) {
      if (currentStep === 2) return 'Step 2: Action Planning';
      if (currentStep === 3) return 'Step 3: Update Status';
    } else {
      if (currentStep === 2) return `Step 2: ${decision}`;
      if (currentStep === 3) return 'Step 3: Action Planning';
      if (currentStep === 4) return 'Step 4: Update Status';
    }
    return '';
  };

  return (
    <div className="action-modal-overlay">
      <div className="action-modal">
        {/* Header */}
        <div className="action-modal-header">
          <div>
            <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OFFICIAL ACTION &bull; #{complaint.id}
            </span>
            <h3 style={{ marginTop: '2px' }}>{getStepTitle()}</h3>

            {/* Stepper bubbles: 1-2-3 for Verified, 1-2-3-4 for others */}
            <div className="action-stepper-header">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum, idx) => (
                <React.Fragment key={stepNum}>
                  <div className={`step-bubble ${currentStep === stepNum ? 'active' : currentStep > stepNum ? 'done' : ''}`}>
                    {currentStep > stepNum ? '✓' : stepNum}
                  </div>
                  {idx < totalSteps - 1 && (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>&bull;&bull;&bull;</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <button className="official-btn-secondary official-btn-sm" onClick={onClose} style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="action-modal-body">
          {/* STEP 1: Decision Selection */}
          {currentStep === 1 && (
            <div>
              <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '16px' }}>
                After reviewing the complaint file, evidence, and IoT telemetry, select your decision:
              </p>

              <div className="action-radio-group">
                <label 
                  className={`action-radio-card ${decision === 'Verified' ? 'selected' : ''}`}
                  onClick={() => setDecision('Verified')}
                >
                  <input 
                    type="radio" 
                    name="decision" 
                    checked={decision === 'Verified'} 
                    onChange={() => setDecision('Verified')} 
                    style={{ display: 'none' }}
                  />
                  <div style={{ color: '#16a34a' }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>Verified</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Complaint is authentic and actionable. <em>(Follows 1 &rarr; 2 &rarr; 3 workflow)</em></div>
                  </div>
                </label>

                <label 
                  className={`action-radio-card ${decision === 'Requires Information' ? 'selected' : ''}`}
                  onClick={() => setDecision('Requires Information')}
                >
                  <input 
                    type="radio" 
                    name="decision" 
                    checked={decision === 'Requires Information'} 
                    onChange={() => setDecision('Requires Information')} 
                    style={{ display: 'none' }}
                  />
                  <div style={{ color: '#0284c7' }}>
                    <HelpCircle size={22} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>Requires Information</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Request additional photos, exact GPS, or details from the citizen.</div>
                  </div>
                </label>

                <label 
                  className={`action-radio-card ${decision === 'Unable to Verify' ? 'selected' : ''}`}
                  onClick={() => setDecision('Unable to Verify')}
                >
                  <input 
                    type="radio" 
                    name="decision" 
                    checked={decision === 'Unable to Verify'} 
                    onChange={() => setDecision('Unable to Verify')} 
                    style={{ display: 'none' }}
                  />
                  <div style={{ color: '#d97706' }}>
                    <AlertTriangle size={22} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>Unable to Verify</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Insufficient evidence or site anomaly not present upon inspection.</div>
                  </div>
                </label>

                <label 
                  className={`action-radio-card ${decision === 'Not Applicable' ? 'selected' : ''}`}
                  onClick={() => setDecision('Not Applicable')}
                >
                  <input 
                    type="radio" 
                    name="decision" 
                    checked={decision === 'Not Applicable'} 
                    onChange={() => setDecision('Not Applicable')} 
                    style={{ display: 'none' }}
                  />
                  <div style={{ color: '#64748b' }}>
                    <XCircle size={22} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>Not Applicable</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Issue belongs to a different department or is outside municipal scope.</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* If NOT Verified: STEP 2 is the conditional detail input */}
          {!isVerifiedFlow && currentStep === 2 && decision === 'Requires Information' && (
            <div>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#0369a1', fontWeight: 700, margin: '0 0 6px 0' }}>
                  REQUEST MORE INFORMATION
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#0c4a6e', margin: 0 }}>
                  Specify what evidence the citizen must provide.
                </p>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
                  What information is required?
                </label>
                <div className="action-checkbox-group">
                  <label className={`action-checkbox-label ${requiredInfoTypes.exactLocation ? 'checked' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={requiredInfoTypes.exactLocation} 
                      onChange={() => toggleInfoType('exactLocation')} 
                    />
                    <span>Exact location</span>
                  </label>

                  <label className={`action-checkbox-label ${requiredInfoTypes.additionalImage ? 'checked' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={requiredInfoTypes.additionalImage} 
                      onChange={() => toggleInfoType('additionalImage')} 
                    />
                    <span>Additional image</span>
                  </label>

                  <label className={`action-checkbox-label ${requiredInfoTypes.dateTime ? 'checked' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={requiredInfoTypes.dateTime} 
                      onChange={() => toggleInfoType('dateTime')} 
                    />
                    <span>Date / time</span>
                  </label>

                  <label className={`action-checkbox-label ${requiredInfoTypes.description ? 'checked' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={requiredInfoTypes.description} 
                      onChange={() => toggleInfoType('description')} 
                    />
                    <span>Description</span>
                  </label>

                  <label className={`action-checkbox-label ${requiredInfoTypes.other ? 'checked' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={requiredInfoTypes.other} 
                      onChange={() => toggleInfoType('other')} 
                    />
                    <span>Other</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Message to Citizen:
                </label>
                <textarea
                  style={{ width: '100%', minHeight: '90px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  value={infoMessage}
                  onChange={(e) => setInfoMessage(e.target.value)}
                  placeholder="Please provide a clearer image of the affected drain."
                />
              </div>
            </div>
          )}

          {!isVerifiedFlow && currentStep === 2 && decision === 'Unable to Verify' && (
            <div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#b45309', fontWeight: 700, margin: '0 0 6px 0' }}>
                  Unable to Verify
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#78350f', margin: 0 }}>
                  Please state why the reported issue could not be verified.
                </p>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Reason:
                </label>
                <select
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: '#ffffff', outline: 'none' }}
                  value={unableReason}
                  onChange={(e) => setUnableReason(e.target.value)}
                >
                  <option value="Insufficient evidence">Insufficient evidence</option>
                  <option value="Location could not be confirmed">Location could not be confirmed</option>
                  <option value="Issue could not be observed">Issue could not be observed</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Official Remarks:
                </label>
                <textarea
                  style={{ width: '100%', minHeight: '90px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  value={unableRemarks}
                  onChange={(e) => setUnableRemarks(e.target.value)}
                  placeholder="Explain why the complaint could not be verified..."
                />
              </div>
            </div>
          )}

          {!isVerifiedFlow && currentStep === 2 && decision === 'Not Applicable' && (
            <div>
              <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 700, margin: '0 0 6px 0' }}>
                  Not Applicable
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                  Record why this grievance is outside the departmental scope.
                </p>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Reason:
                </label>
                <select
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: '#ffffff', outline: 'none' }}
                  value={notApplicableReason}
                  onChange={(e) => setNotApplicableReason(e.target.value)}
                >
                  <option value="Issue does not fall under this department">Issue does not fall under this department</option>
                  <option value="Complaint is outside the service scope">Complaint is outside the service scope</option>
                  <option value="Issue is no longer present">Issue is no longer present</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Official Remarks:
                </label>
                <textarea
                  style={{ width: '100%', minHeight: '90px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  value={notApplicableRemarks}
                  onChange={(e) => setNotApplicableRemarks(e.target.value)}
                  placeholder="Explain why this complaint is not applicable..."
                />
              </div>
            </div>
          )}

          {/* ACTION PLANNING (Step 2 if Verified, Step 3 if other) */}
          {((isVerifiedFlow && currentStep === 2) || (!isVerifiedFlow && currentStep === 3)) && (
            <div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px', marginBottom: '18px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: 700, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} />
                  <span>Action Planning</span>
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#166534', margin: 0 }}>
                  Select the official action to be scheduled or dispatched.
                </p>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Action:
                </label>
                <select
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', backgroundColor: '#ffffff', outline: 'none' }}
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                >
                  <option value="Inspection Scheduled">Inspection Scheduled</option>
                  <option value="Cleaning Requested">Cleaning Requested</option>
                  <option value="Repair Requested">Repair Requested</option>
                  <option value="Forwarded to Another Department">Forwarded to Another Department</option>
                  <option value="No Action Required">No Action Required</option>
                </select>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', fontSize: '0.82rem', color: '#64748b' }}>
                <strong>Operational Directive:</strong> Setting an action updates the timeline and prepares the field operations schedule.
              </div>
            </div>
          )}

          {/* UPDATE STATUS (Step 3 if Verified, Step 4 if other) */}
          {((isVerifiedFlow && currentStep === 3) || (!isVerifiedFlow && currentStep === 4)) && (
            <form onSubmit={handleFinalSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Current Status</span>
                  <div style={{ marginTop: '4px', fontWeight: 700, color: '#0f172a' }}>{complaint.status}</div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Change Status:
                  </label>
                  <select
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: '#ffffff', outline: 'none' }}
                    value={statusChange}
                    onChange={(e) => setStatusChange(e.target.value)}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Official Remarks:
                </label>
                <textarea
                  style={{ width: '100%', minHeight: '110px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  value={officialRemarks}
                  onChange={(e) => setOfficialRemarks(e.target.value)}
                  placeholder="Inspection team has been notified. Site inspection scheduled for 13 Aug."
                  required
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer with mandatory [Back] button and clean [Proceed] buttons */}
        <div className="action-modal-footer">
          <button 
            type="button" 
            className="official-btn official-btn-secondary" 
            onClick={handleBack}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div>
            {currentStep < totalSteps ? (
              <button 
                type="button" 
                className="official-btn official-btn-primary" 
                onClick={goToNextStep}
              >
                <span>Proceed</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                type="button" 
                className="official-btn official-btn-primary" 
                onClick={handleFinalSubmit}
              >
                <CheckCircle2 size={16} />
                <span>Submit Decision</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
