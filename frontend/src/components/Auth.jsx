import React, { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, AlertCircle, ArrowRight, Shield, UserCheck } from 'lucide-react';
import { mockDb } from '../utils/mockDb';
import { API_BASE_URL, saveSession } from "../utils/api";

export default function Auth({ mode = 'login', setActiveTab, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState(mode); // 'login' | 'signup' | 'forgot'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleLoginSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!formData.email || !formData.password) {
    setError("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    saveSession(data.token);
    onLoginSuccess(data.user);
  } catch (err) {
    setError(err.message || "Unable to connect to the server.");
  }
};

  // Quick Demo Auto-fill Helper
  const handleQuickLogin = (email, password) => {
    const result = mockDb.login(email, password);
    if (result.success) {
      onLoginSuccess(result.user);
    } else {
      setFormData({
        ...formData,
        email,
        password
      });
    }
  };

  const handleSignupSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const { name, email, phone, address, password, confirmPassword } = formData;

  if (!name || !email || !phone || !address || !password || !confirmPassword) {
    setError("Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        address,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    saveSession(data.token);
    onLoginSuccess(data.user);
    setActiveTab("dashboard");
  } catch (err) {
    setError(err.message || "Unable to connect to the server.");
  }
};

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email.');
      return;
    }
    setMessage(`A password reset link has been dispatched to ${formData.email}. Please check your inbox.`);
    setError('');
  };

  return (
    <div className="auth-outer-container animate-fade-in">
      <div className="auth-box glass-card animate-scale-in">
        {authMode === 'login' && (
          <div>
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Log in to access your civic account or municipal administration console</p>
            </div>

            {/* Quick Demo Credentials Switcher */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
              <button 
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '8px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                onClick={() => handleQuickLogin('grievance.officer@nagrikai.in', '12345')}
              >
                <Shield size={14} className="text-amber-500" style={{ color: '#f59e0b' }} />
                <span>Official Login</span>
              </button>

              <button 
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '8px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                onClick={() => handleQuickLogin('admin@nagrik.ai', 'password123')}
              >
                <Shield size={14} className="text-blue-500" style={{ color: '#3b82f6' }} />
                <span>Admin Login</span>
              </button>

              <button 
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '8px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                onClick={() => handleQuickLogin('example@gmail.com', 'password123')}
              >
                <UserCheck size={14} className="text-emerald-500" style={{ color: '#10b981' }} />
                <span>Citizen Login</span>
              </button>
            </div>
            
            {error && (
              <div className="form-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="grievance.officer@nagrikai.in or admin@nagrik.ai"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-action">
                  <label htmlFor="password">Password</label>
                  <button type="button" className="inline-action" onClick={() => { setAuthMode('forgot'); setError(''); }}>
                    Forgot password?
                  </button>
                </div>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary full-width">
                <span>Login to Portal</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.76rem', color: '#64748b', lineHeight: '1.5' }}>
              <div>Official Demo: <code style={{ color: '#d97706', fontWeight: 600 }}>grievance.officer@nagrikai.in</code> / <code style={{ color: '#d97706', fontWeight: 600 }}>12345</code></div>
              <div>Admin Demo: <code style={{ color: '#2563eb', fontWeight: 600 }}>admin@nagrik.ai</code> / <code style={{ color: '#2563eb', fontWeight: 600 }}>password123</code></div>
            </div>

            <div className="auth-footer">
              <span>New to NagrikAI?</span>
              <button className="footer-action-btn" onClick={() => { setAuthMode('signup'); setError(''); }}>
                Create account
              </button>
            </div>
          </div>
        )}

        {authMode === 'signup' && (
          <div>
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Join the portal to start reporting ward issues</p>
            </div>

            {error && (
              <div className="form-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="auth-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-with-icon">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Niharika Maurya"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <div className="input-with-icon">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="XXXXXXXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Residential Address</label>
                  <div className="input-with-icon">
                    <MapPin size={16} className="input-icon" />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="House 123, Sector 4"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-with-icon">
                    <Lock size={16} className="input-icon" />
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-with-icon">
                    <Lock size={16} className="input-icon" />
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary full-width">
                <span>Create Account</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="auth-footer">
              <span>Already have an account?</span>
              <button className="footer-action-btn" onClick={() => { setAuthMode('login'); setError(''); }}>
                Login
              </button>
            </div>
          </div>
        )}

        {authMode === 'forgot' && (
          <div>
            <div className="auth-header">
              <h2>Reset Password</h2>
              <p>Provide your email below to reset your password credentials</p>
            </div>

            {error && (
              <div className="form-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {message ? (
              <div className="forgot-success-message">
                <p>{message}</p>
                <button className="btn-primary full-width" style={{ marginTop: '20px' }} onClick={() => { setAuthMode('login'); setMessage(''); }}>
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary full-width">
                  <span>Send Recovery Link</span>
                  <ArrowRight size={16} />
                </button>

                <button type="button" className="btn-secondary full-width" style={{ marginTop: '10px' }} onClick={() => { setAuthMode('login'); setError(''); }}>
                  Back to Login
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
