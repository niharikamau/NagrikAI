import React from 'react';
import { ShieldCheck, MapPin, Eye, FileText, ArrowRight } from 'lucide-react';

export default function LandingPage({ setActiveTab, currentUser }) {
  
  const handleGetStarted = () => {
    if (currentUser) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('signup');
    }
  };

  return (
    <div className="landing-container animate-fade-in">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="container hero-content">
          <div className="hero-text-block animate-fade-up">
            <div className="civic-badge">OFFICIAL CITIZEN PORTAL</div>
            <h1>Empower Your Community. <br /><span className="text-gradient">Report, Track, Resolve.</span></h1>
            <p className="hero-subtitle">
              A transparent civic complaint portal connecting residents directly with local municipal bodies. File complaints, understand your legal rights, and track real-time resolution progress.
            </p>
            <div className="hero-cta-buttons">
              <button className="btn-primary-large" onClick={handleGetStarted}>
                <span>Get Started Now</span>
                <ArrowRight size={18} />
              </button>
              <a href="#features" className="btn-tertiary">
                Learn More
              </a>
            </div>
          </div>

          <div className="hero-visual-card animate-scale-in">
            <div className="mock-interface glass-card">
              <div className="mock-header">
                <span className="dot dot-r"></span>
                <span className="dot dot-y"></span>
                <span className="dot dot-g"></span>
                <span className="mock-title">Active Complaint Tracker</span>
              </div>
              <div className="mock-body">
                <div className="mock-issue-info">
                  <div className="mock-issue-header">
                    <span className="mock-issue-id">COMPLAINT #1042</span>
                    <span className="mock-badge badge-progress">In Progress</span>
                  </div>
                  <h3>Garbage accumulation near ABC School</h3>
                  <div className="mock-location">
                    <MapPin size={14} />
                    <span>Sector 4, ABC Lane</span>
                  </div>
                </div>

                <div className="mock-timeline">
                  <div className="timeline-node checked">
                    <div className="node-icon">✓</div>
                    <div className="node-content">
                      <h4>Submitted</h4>
                      <span>Aug 12, 09:30 AM</span>
                    </div>
                  </div>
                  <div className="timeline-node checked">
                    <div className="node-icon">✓</div>
                    <div className="node-content">
                      <h4>Assigned to Waste Dept</h4>
                      <span>Aug 13, 11:15 AM</span>
                    </div>
                  </div>
                  <div className="timeline-node active">
                    <div className="node-icon pulse-dot"></div>
                    <div className="node-content">
                      <h4>Sanitation Team Dispatched</h4>
                      <span>Aug 14, 02:45 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Strip */}
      <section className="stats-strip">
        <div className="container stats-grid">
          <div className="stat-card">
            <span className="stat-number">94.2%</span>
            <span className="stat-label">Resolution Rate</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">48 hrs</span>
            <span className="stat-label">Average Response Time</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">12,450+</span>
            <span className="stat-label">Issues Resolved</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">100%</span>
            <span className="stat-label">Citizen Anonymity Option</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-title-wrapper">
            <h2>Three Steps to a Better Neighborhood</h2>
            <p>Our platform handles complaints efficiently through transparency and automated legal analysis.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card glass-card">
              <div className="feature-icon-wrapper prim">
                <FileText size={24} />
              </div>
              <h3>1. Report & Document</h3>
              <p>
                Describe what happened, select from predefined categories, pin the location on our interactive map, and upload photos as evidence.
              </p>
            </div>

            <div className="feature-card glass-card">
              <div className="feature-icon-wrapper sec">
                <ShieldCheck size={24} />
              </div>
              <h3>2. Understand Your Rights</h3>
              <p>
                Our AI pre-assessment reads your complaint, matches it automatically with municipal laws, and lists your rights so you stay informed.
              </p>
            </div>

            <div className="feature-card glass-card">
              <div className="feature-icon-wrapper acc">
                <Eye size={24} />
              </div>
              <h3>3. Transparent Tracking</h3>
              <p>
                Watch progress in real-time. From assignment to dispatch and resolution, get notified at every step with official comments and photos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="cta-banner">
        <div className="container cta-banner-content glass-card">
          <h2>Ready to resolve local issues?</h2>
          <p>Join thousands of citizens taking direct action to clean, light, and repair our local wards.</p>
          <button className="btn-primary-large" onClick={handleGetStarted}>
            <span>File Your First Report</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
