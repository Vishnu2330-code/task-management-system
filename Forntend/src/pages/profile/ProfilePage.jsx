import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../api/user.api';
import { authAPI } from '../../api/auth.api';
import { User, Lock, Save, CheckCircle2, AlertCircle, Shield, ArrowDown, Sparkles } from 'lucide-react';
import { RoleBadge } from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import ScrollReveal from '../../components/common/ScrollReveal';

const getProfileData = (profile) => ({
  name: profile?.name || '',
  phone: profile?.phone || '+91',
  department: profile?.department || '',
  bio: profile?.bio || '',
});

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState(() => getProfileData(user));
  const [savedProfileData, setSavedProfileData] = useState(() =>
    getProfileData(user),
  );

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const hasProfileChanges = Object.keys(profileData).some(
    (field) => profileData[field] !== savedProfileData[field],
  );

  useEffect(() => {
    if (profileMsg.type !== 'success') return;

    const timeoutId = setTimeout(
      () => setProfileMsg({ type: '', text: '' }),
      2000,
    );
    return () => clearTimeout(timeoutId);
  }, [profileMsg]);

  useEffect(() => {
    if (passwordMsg.type !== 'success') return;

    const timeoutId = setTimeout(
      () => setPasswordMsg({ type: '', text: '' }),
      3000,
    );
    return () => clearTimeout(timeoutId);
  }, [passwordMsg]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setProfileLoading(true);

    try {
      const { data } = await userAPI.updateProfile(profileData);
      updateUser(data.data.user);
      const savedProfile = getProfileData(data.data.user);
      setProfileData(savedProfile);
      setSavedProfileData(savedProfile);
      setProfileMsg({ type: 'success', text: 'Profile details updated successfully!' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile details',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordData.newPassword.length < 6) {
      return setPasswordMsg({
        type: 'error',
        text: 'New password must be at least 6 characters long',
      });
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordMsg({ type: 'error', text: 'Passwords do not match' });
    }

    setPasswordLoading(true);

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMsg({
        type: 'success',
        text: 'Password updated successfully! Other sessions were invalidated.',
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const scrollToAnchor = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="dashboard-content-page animate-fade-in profile-scroll-experience">
      <ScrollReveal variant="fade-up" duration={500}>
        <div className="page-header">
          <div className="profile-badge-pill">
            <Sparkles size={14} className="text-slate-500" />
            <span>Account Center</span>
          </div>
          <h1 className="page-title">Account Settings & Profile</h1>
          <p className="page-subtitle">Manage your personal information, department affiliation, and security preferences</p>
        </div>
      </ScrollReveal>

      <div className="profile-layout-grid coordinated-scroll-layout">
        {/* Left Column: Coordinated Sticky Identity Anchor Card */}
        <div className="profile-sidebar-card sticky-profile-card shadow-elevated">
          <div className="profile-avatar-large">
            <span>{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <h3 className="profile-card-name">{user?.name}</h3>
          <p className="profile-card-email">{user?.email}</p>
          <div className="mt-2 flex-center">
            <RoleBadge role={user?.role} />
          </div>

          <div className="profile-info-list mt-4">
            <div className="info-list-row">
              <span className="info-list-label">Department:</span>
              <span className="info-list-val">{user?.department || 'Engineering'}</span>
            </div>
            <div className="info-list-row">
              <span className="info-list-label">Account Status:</span>
              <span className="text-success font-semibold text-xs">Active</span>
            </div>
            <div className="info-list-row">
              <span className="info-list-label">Member Since:</span>
              <span className="info-list-val">
                {new Date(user?.createdAt).toLocaleDateString([], {
                  year: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          </div>

          {/* Quick Smooth Anchor Navigation */}
          <div className="profile-anchor-links mt-4">
            <button
              type="button"
              className="anchor-link-btn"
              onClick={() => scrollToAnchor('personal-info')}
            >
              <User size={13} />
              <span>Personal Details</span>
            </button>
            <button
              type="button"
              className="anchor-link-btn"
              onClick={() => scrollToAnchor('security-credentials')}
            >
              <Lock size={13} />
              <span>Security & Password</span>
            </button>
          </div>
        </div>

        {/* Right Column: Forms with Staggered Scroll Entrance */}
        <div className="profile-forms-column">
          {/* Edit Profile Details */}
          <section id="personal-info" className="scroll-anchor-section">
            <ScrollReveal variant="fade-up" delay={0} duration={550}>
              <div className="dashboard-panel mb-4 shadow-elevated">
                <div className="panel-header">
                  <h3 className="panel-title flex-align-center gap-2">
                    <User size={16} /> Personal Information
                  </h3>
                </div>
                <div className="panel-body">
                  {profileMsg.text && (
                    <Alert
                      type={profileMsg.type}
                      message={profileMsg.text}
                      onClose={() => setProfileMsg({ type: '', text: '' })}
                    />
                  )}

                  <form onSubmit={handleProfileSubmit} className="auth-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="prof-name">Full Name</label>
                        <input
                          id="prof-name"
                          type="text"
                          className="form-input"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({ ...profileData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="prof-phone">Phone Number</label>
                        <input
                          id="prof-phone"
                          type="text"
                          className="form-input"
                          placeholder="+91"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData({ ...profileData, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="prof-dept">Department</label>
                        <input
                          id="prof-dept"
                          type="text"
                          className="form-input"
                          value={profileData.department}
                          onChange={(e) =>
                            setProfileData({ ...profileData, department: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email (Read Only)</label>
                        <input
                          type="email"
                          className="form-input"
                          value={user?.email || ''}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="prof-bio">Short Bio</label>
                      <textarea
                        id="prof-bio"
                        className="form-input"
                        rows={3}
                        placeholder="Write a brief professional summary..."
                        value={profileData.bio}
                        onChange={(e) =>
                          setProfileData({ ...profileData, bio: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex-align-center gap-2 mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={profileLoading || !hasProfileChanges}
                      >
                        <Save size={16} />
                        <span>{profileLoading ? 'Saving...' : 'Save Profile Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Change Password Form */}
          <section id="security-credentials" className="scroll-anchor-section">
            <ScrollReveal variant="fade-up" delay={100} duration={550}>
              <div className="dashboard-panel shadow-elevated">
                <div className="panel-header">
                  <h3 className="panel-title flex-align-center gap-2">
                    <Lock size={16} /> Security & Password
                  </h3>
                </div>
                <div className="panel-body">
                  {passwordMsg.text && (
                    <Alert
                      type={passwordMsg.type}
                      message={passwordMsg.text}
                      onClose={() => setPasswordMsg({ type: '', text: '' })}
                    />
                  )}

                  <form onSubmit={handlePasswordSubmit} className="auth-form">
                    <div className="form-group">
                      <label className="form-label" htmlFor="curr-pw">Current Password</label>
                      <input
                        id="curr-pw"
                        type="password"
                        className="form-input"
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label" htmlFor="new-pw">New Password</label>
                        <input
                          id="new-pw"
                          type="password"
                          className="form-input"
                          placeholder="At least 6 characters"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="confirm-pw">Confirm New Password</label>
                        <input
                          id="confirm-pw"
                          type="password"
                          className="form-input"
                          placeholder="Re-enter new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="flex-align-center gap-2 mt-4">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={passwordLoading}
                      >
                        <Lock size={16} />
                        <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </ScrollReveal>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
