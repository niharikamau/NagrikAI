import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Key, 
  Bell, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  MapPin,
  Lock
} from 'lucide-react';
import { mockDb } from '../../utils/mockDb';

export default function OfficialProfile({ currentUser, onProfileUpdate, onLogout }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ error: '', success: '' });

  const [notificationsOn, setNotificationsOn] = useState(
    currentUser?.notificationsEnabled !== undefined ? currentUser.notificationsEnabled : true
  );
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleToggleNotifications = () => {
    const updated = !notificationsOn;
    setNotificationsOn(updated);
    if (currentUser) {
      const updatedUser = { ...currentUser, notificationsEnabled: updated };
      mockDb.updateProfile(updatedUser);
      if (onProfileUpdate) onProfileUpdate(updatedUser);
    }
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    setPasswordMsg({ error: '', success: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ error: 'New passwords do not match.', success: '' });
      return;
    }

    if (newPassword.length < 5) {
      setPasswordMsg({ error: 'Password must be at least 5 characters.', success: '' });
      return;
    }

    const res = mockDb.changePassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordMsg({ error: '', success: 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowPasswordModal(false), 2000);
    } else {
      setPasswordMsg({ error: res.message || 'Error changing password.', success: '' });
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div className="official-top-banner">
        <div>
          <h1>Official Profile</h1>
          <p>Manage your officer credentials, departmental details, and alert preferences.</p>
        </div>
      </div>

      {saveSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{saveSuccess}</span>
        </div>
      )}

      <div className="official-card">
        {/* Profile Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '999px', background: 'linear-gradient(135deg, #0284c7, #0d9488)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', fontWeight: 700 }}>
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'RS'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              {currentUser?.name || 'Rahul Sharma'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.82rem', color: '#0284c7', background: '#f0f9ff', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                {currentUser?.role === 'official' ? 'Department Officer' : 'Grievance Officer'}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                &bull; {currentUser?.department || 'Water & Drainage'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4 Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Name</span>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{currentUser?.name || 'Rahul Sharma'}</div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Official Email</span>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{currentUser?.email || 'grievance.officer@nagrikai.in'}</div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Department</span>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>{currentUser?.department || 'Water & Drainage'}</div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Role</span>
            <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>Department Officer</div>
          </div>
        </div>

        {/* Account & Password */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
            Account Security
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 18px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>Account Password</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Last changed: 30 days ago</div>
            </div>
            <button 
              className="official-btn official-btn-secondary official-btn-sm"
              onClick={() => { setShowPasswordModal(true); setPasswordMsg({ error: '', success: '' }); }}
            >
              <Key size={14} />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Preferences: Notifications ON / OFF */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
            Preferences
          </h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                  Preferences: Notifications [{notificationsOn ? 'ON' : 'OFF'}]
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Receive high-priority assignment and escalation alerts
                </div>
              </div>
            </div>

            <button 
              className={`official-btn official-btn-sm ${notificationsOn ? 'official-btn-primary' : 'official-btn-secondary'}`}
              onClick={handleToggleNotifications}
            >
              <span>{notificationsOn ? 'Notifications: ON' : 'Notifications: OFF'}</span>
            </button>
          </div>
        </div>

        {/* Logout Action */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="official-btn official-btn-danger" onClick={onLogout}>
            <LogOut size={16} />
            <span>Logout Session</span>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="action-modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="action-modal" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
            <div className="action-modal-header">
              <h3>Change Password</h3>
              <button className="official-btn-secondary official-btn-sm" onClick={() => setShowPasswordModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handlePasswordChangeSubmit}>
              <div className="action-modal-body">
                {passwordMsg.error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '0.84rem' }}>
                    {passwordMsg.error}
                  </div>
                )}
                {passwordMsg.success && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '10px', borderRadius: '6px', fontSize: '0.84rem' }}>
                    {passwordMsg.success}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Current Password</label>
                  <input
                    type="password"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="Enter current password (12345)"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>New Password</label>
                  <input
                    type="password"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 5 characters"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Confirm New Password</label>
                  <input
                    type="password"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
              <div className="action-modal-footer">
                <button type="button" className="official-btn official-btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="official-btn official-btn-primary">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
