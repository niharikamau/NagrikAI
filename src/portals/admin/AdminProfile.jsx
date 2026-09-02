import React, { useState } from 'react';
import { 
  LogOut, 
  Check, 
  KeyRound, 
  Edit2
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

export default function AdminProfile({ currentUser, onProfileUpdate, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || 'System Administrator',
    email: currentUser?.email || 'admin@nagrik.ai',
    phone: currentUser?.phone || '+91 9811002233',
    department: currentUser?.department || 'Administration',
    notificationsEnabled: currentUser?.notificationsEnabled !== undefined ? currentUser.notificationsEnabled : true
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleToggleNotifications = () => {
    const updated = {
      ...profileData,
      notificationsEnabled: !profileData.notificationsEnabled
    };
    setProfileData(updated);
    mockDb.updateProfile(updated);
    if (onProfileUpdate) onProfileUpdate(updated);
    setSuccessMessage(`System notifications ${updated.notificationsEnabled ? 'enabled' : 'disabled'}.`);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    mockDb.updateProfile(profileData);
    if (onProfileUpdate) onProfileUpdate(profileData);
    setIsEditing(false);
    setSuccessMessage('Admin profile updated successfully.');
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordError('Please fill in all fields.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    const res = mockDb.changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (res.success) {
      setSuccessMessage('Password changed successfully.');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordError('');
    } else {
      setPasswordError(res.message);
    }
  };

  return (
    <div className="admin-section-content animate-fade-in" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div className="admin-header-row">
        <div>
          <h1>Admin Profile</h1>
        </div>
      </div>

      {successMessage && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '8px', color: '#34d399', fontSize: '0.88rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="admin-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #334155', marginBottom: '20px' }}>
          <div className="admin-profile-avatar" style={{ width: '60px', height: '60px', fontSize: '1.4rem' }}>
            {profileData.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', color: '#ffffff', fontWeight: 700 }}>{profileData.name}</h2>
            <span style={{ color: '#38bdf8', fontSize: '0.88rem', fontWeight: 500 }}>
              {profileData.email} • {profileData.department}
            </span>
            <div style={{ marginTop: '6px' }}>
              <span className="admin-badge active">Super Administrator</span>
            </div>
          </div>
        </div>

        {/* PROFILE METADATA / EDIT FORM */}
        {!isEditing ? (
          <div>
            <div className="admin-inspector-block">
              <h4>Profile Details</h4>
              <div className="admin-meta-grid" style={{ marginTop: '10px' }}>
                <div className="admin-meta-field">
                  <span className="admin-meta-label">Name</span>
                  <span className="admin-meta-value">{profileData.name}</span>
                </div>
                <div className="admin-meta-field">
                  <span className="admin-meta-label">Email</span>
                  <span className="admin-meta-value">{profileData.email}</span>
                </div>
                <div className="admin-meta-field">
                  <span className="admin-meta-label">Phone</span>
                  <span className="admin-meta-value">{profileData.phone}</span>
                </div>
                <div className="admin-meta-field">
                  <span className="admin-meta-label">Department</span>
                  <span className="admin-meta-value">{profileData.department}</span>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #334155' }}>
              <h4 style={{ fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>
                Account
              </h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  className="admin-btn admin-btn-secondary"
                  onClick={() => { setShowPasswordModal(true); setPasswordError(''); }}
                >
                  <KeyRound size={15} />
                  <span>Change Password</span>
                </button>
                <button 
                  className="admin-btn admin-btn-outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={15} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #334155' }}>
              <h4 style={{ fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>
                Preferences
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#ffffff' }}>System Notifications</div>
                </div>
                <button 
                  className={`admin-btn ${profileData.notificationsEnabled ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                  onClick={handleToggleNotifications}
                >
                  <span>Notifications [{profileData.notificationsEnabled ? 'ON' : 'OFF'}]</span>
                </button>
              </div>
            </div>

            {/* Logout */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #334155' }}>
              <button 
                className="admin-btn admin-btn-danger"
                onClick={onLogout}
              >
                <LogOut size={15} />
                <span>Logout Session</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="admin-form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Admin Email</label>
                <input 
                  type="email" 
                  value={profileData.email}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              <div className="admin-form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Department</label>
              <input 
                type="text" 
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="admin-btn admin-btn-primary">
                <Check size={14} />
                <span>Save Changes</span>
              </button>
              <button 
                type="button" 
                className="admin-btn admin-btn-secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="admin-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>CHANGE ADMIN PASSWORD</h3>
              <button className="admin-modal-close" onClick={() => setShowPasswordModal(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit}>
              <div className="admin-modal-body">
                {passwordError && (
                  <div style={{ color: '#f87171', fontSize: '0.84rem', padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                    {passwordError}
                  </div>
                )}

                <div className="admin-form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter current password (default: password123)"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    placeholder="Minimum 6 characters"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="Repeat new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Check size={14} />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
