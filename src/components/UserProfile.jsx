import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Check, AlertTriangle, ToggleLeft, ToggleRight, LogOut } from 'lucide-react';
import { mockDb } from '../utils/mockDb';

export default function UserProfile({ currentUser, onProfileUpdate, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    phone: currentUser.phone,
    address: currentUser.address,
    notificationsEnabled: currentUser.notificationsEnabled
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handlePwdChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setPwdError('');
    setPwdSuccess('');
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      setError('Please fill in all profile fields.');
      return;
    }

    const updatedProfile = {
      ...currentUser,
      name: formData.name,
      phone: formData.phone,
      address: formData.address
    };

    mockDb.updateProfile(updatedProfile);
    onProfileUpdate(updatedProfile);
    setIsEditing(false);
    setSuccess('Profile updated successfully.');
    setError('');
  };

  const handleNotificationToggle = () => {
    const nextVal = !formData.notificationsEnabled;
    setFormData(prev => ({ ...prev, notificationsEnabled: nextVal }));
    const updatedProfile = {
      ...currentUser,
      notificationsEnabled: nextVal
    };
    mockDb.updateProfile(updatedProfile);
    onProfileUpdate(updatedProfile);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwdError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('Password must be at least 6 characters long.');
      return;
    }

    const result = mockDb.changePassword(oldPassword, newPassword);
    if (result.success) {
      setPwdSuccess('Password changed successfully.');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPwdError('');
    } else {
      setPwdError(result.message);
    }
  };

  return (
    <div className="profile-container container animate-fade-in">
      <div className="section-header">
        <h2>My Account</h2>
        <p>Manage your account credentials, address, and notification preferences</p>
      </div>

      <div className="profile-grid">
        {/* Profile Card & Details */}
        <div className="profile-card-col">
          <div className="profile-details-card glass-card">
            <div className="profile-avatar-row">
              <div className="profile-large-avatar">
                {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('') : <User />}
              </div>
              <div className="avatar-meta">
                <h3>{currentUser.name}</h3>
                <span>Citizen Member</span>
              </div>
            </div>

            <div className="card-divider"></div>

            {isEditing ? (
              <form onSubmit={handleProfileSubmit} className="profile-edit-form">
                {error && <div className="form-error"><AlertTriangle size={14} /> <span>{error}</span></div>}
                
                <div className="form-group">
                  <label htmlFor="edit-name">Full Name</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-phone">Phone Number</label>
                  <input
                    type="tel"
                    id="edit-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-address">Residential Address</label>
                  <input
                    type="text"
                    id="edit-address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="edit-actions-row">
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-static-info">
                {success && <div className="form-success"><Check size={14} /> <span>{success}</span></div>}

                <div className="info-row">
                  <Mail size={16} className="info-icon" />
                  <div>
                    <span className="info-label">Email Address</span>
                    <span className="info-value">{currentUser.email}</span>
                  </div>
                </div>

                <div className="info-row">
                  <Phone size={16} className="info-icon" />
                  <div>
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{currentUser.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div className="info-row">
                  <MapPin size={16} className="info-icon" />
                  <div>
                    <span className="info-label">Residential Address</span>
                    <span className="info-value">{currentUser.address || 'Not provided'}</span>
                  </div>
                </div>

                <button className="btn-secondary full-width" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* Preferences Settings */}
          <div className="profile-preferences-card glass-card">
            <h3>Portal Preferences</h3>
            <div className="card-divider"></div>
            
            <div className="preference-toggle-row">
              <div className="pref-description">
                <h4>System Notification Emails</h4>
                <p>Receive live status notifications, assignment comments, and resolution alerts</p>
              </div>
              <button className="toggle-switch-btn" onClick={handleNotificationToggle}>
                {formData.notificationsEnabled ? (
                  <ToggleRight size={38} className="toggle-icon active" />
                ) : (
                  <ToggleLeft size={38} className="toggle-icon" />
                )}
              </button>
            </div>
          </div>

          <button className="btn-danger-outline full-width" onClick={onLogout}>
            <LogOut size={16} />
            <span>Logout Account</span>
          </button>
        </div>

        {/* Change Password Column */}
        <div className="profile-pwd-col">
          <div className="password-update-card glass-card">
            <h3>Change Account Password</h3>
            <p className="pwd-subtitle">Update your login security credentials</p>
            <div className="card-divider"></div>

            {pwdError && <div className="form-error"><AlertTriangle size={14} /> <span>{pwdError}</span></div>}
            {pwdSuccess && <div className="form-success"><Check size={14} /> <span>{pwdSuccess}</span></div>}

            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="oldPassword">Current Password</label>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  placeholder="••••••••"
                  value={passwordData.oldPassword}
                  onChange={handlePwdChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  placeholder="Minimum 6 characters"
                  value={passwordData.newPassword}
                  onChange={handlePwdChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Repeat new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePwdChange}
                  required
                />
              </div>

              <button type="submit" className="btn-primary full-width">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
