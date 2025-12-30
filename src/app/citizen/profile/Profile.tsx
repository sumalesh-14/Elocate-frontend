'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getEmail, getPhoneNumber, getUserName, getfullname } from '../sign-in/auth';
import Image from 'next/image';
import './Profile.css';

const Profile = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(false);
  const [profileImage, setProfileImage] = useState('https://avatars.githubusercontent.com/u/52039279?v=4');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User data state to prevent hydration mismatch
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    fullname: '',
    phone: ''
  });

  // Load user data only on client side
  useEffect(() => {
    setMounted(true);
    setUserData({
      username: getUserName() || '',
      email: getEmail() || '',
      fullname: getfullname() || '',
      phone: getPhoneNumber() || ''
    });
  }, []);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        // Here you would typically upload to your server
        console.log('Image selected:', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditProfile = () => {
    router.push('/citizen/profile/edit-profile');
  };

  const handleSettings = () => {
    router.push('/citizen/profile/settings');
  };

  // Don't render user-specific content until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className="profile-container">
        <div className="profile-wrapper">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-container">
                <div className="avatar-wrapper">
                  <div className="avatar-image" style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#e2e8f0' }} />
                </div>
              </div>
              <h1 className="user-name">Loading...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-header">
            {/* Avatar with Camera Icon */}
            <div className="avatar-container">
              <div className="avatar-wrapper">
                <Image
                  className="avatar-image"
                  src={profileImage}
                  alt={userData.username || 'User'}
                  width={120}
                  height={120}
                />
              </div>
            </div>

            {/* User Info */}
            <h1 className="user-name">{userData.fullname || userData.username || 'User'}</h1>
            <p className="user-username">@{userData.username || 'username'}</p>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handleEditProfile}>
                Edit Profile
              </button>
              <button className="btn btn-secondary" onClick={handleSettings}>
                Settings
              </button>
            </div>

            <div className="tab-content">
                 {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-icon">📧</div>
                      <div className="info-content">
                        <div className="info-label">Email Address</div>
                        <div className="info-value">{userData.email || 'Not provided'}</div>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">📱</div>
                      <div className="info-content">
                        <div className="info-label">Phone Number</div>
                        <div className="info-value">{userData.phone || 'Not provided'}</div>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">👤</div>
                      <div className="info-content">
                        <div className="info-label">Full Name</div>
                        <div className="info-value">{userData.fullname || 'Not provided'}</div>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">🆔</div>
                      <div className="info-content">
                        <div className="info-label">Username</div>
                        <div className="info-value">@{userData.username || 'Not provided'}</div>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">📅</div>
                      <div className="info-content">
                        <div className="info-label">Member Since</div>
                        <div className="info-value">December 2024</div>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon">✅</div>
                      <div className="info-content">
                        <div className="info-label">Account Status</div>
                        <div className="info-value">Active</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Profile;

