'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getEmail, getPhoneNumber, getUserName, getfullname, setEmail, setPhoneNumber, setUserName, setfullname } from '../../sign-in/auth';
import Image from 'next/image';
import Toast from '../../Components/Toast';
import './EditProfile.css';

const EditProfile = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);
    const [profileImage, setProfileImage] = useState('https://avatars.githubusercontent.com/u/52039279?v=4');
    const [imagePreview, setImagePreview] = useState('');

    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        phone: ''
    });

    const [errors, setErrors] = useState({
        fullname: '',
        username: '',
        phone: ''
    });

    const [showToast, setShowToast] = useState(false);

    // Load user data on mount
    useEffect(() => {
        setMounted(true);
        const currentData = {
            fullname: getfullname() || '',
            username: getUserName() || '',
            phone: getPhoneNumber() || ''
        };
        setFormData(currentData);
    }, []);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle image upload
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCameraClick = () => {
        fileInputRef.current?.click();
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {
            fullname: '',
            username: '',
            email: '',
            phone: ''
        };

        let isValid = true;

        if (!formData.fullname.trim()) {
            newErrors.fullname = 'Full name is required';
            isValid = false;
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
            isValid = false;
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
            isValid = false;
        }

        // if (!formData.email.trim()) {
        //     newErrors.email = 'Email is required';
        //     isValid = false;
        // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        //     newErrors.email = 'Please enter a valid email';
        //     isValid = false;
        // }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
            isValid = false;
        } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // Save to localStorage
            setfullname(formData.fullname);
            setUserName(formData.username);
            //setEmail(formData.email);
            setPhoneNumber(formData.phone);

            // Here you would typically make an API call to update the backend
            console.log('Profile updated:', formData);

            // Show success message
            setShowToast(true);

            // Delay navigation slightly to let the user see the toast
            setTimeout(() => {
                router.push('/citizen/profile');
            }, 2000);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        router.push('/citizen/profile');
    };

    if (!mounted) {
        return (
            <div className="edit-profile-container">
                <div className="edit-profile-wrapper">
                    <div className="loading">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-profile-container">
            <div className="edit-profile-wrapper">
                <div className="edit-profile-card">
                    <div className="edit-profile-header">
                        <h1 className="edit-profile-title">Edit Profile</h1>
                        <p className="edit-profile-subtitle">Update your personal information</p>
                    </div>

                    <form onSubmit={handleSubmit} className="edit-profile-form">
                        {/* Profile Picture Section */}
                        <div className="profile-picture-section">
                            <div className="profile-picture-wrapper">
                                <div className="profile-picture-container">
                                    <Image
                                        className="profile-picture"
                                        src={imagePreview || profileImage}
                                        alt="Profile"
                                        width={120}
                                        height={120}
                                    />
                                    <button
                                        type="button"
                                        className="change-picture-button"
                                        onClick={handleCameraClick}
                                        aria-label="Change profile picture"
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <p className="picture-hint">Click the camera icon to change your profile picture</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="form-grid">
                            {/* Full Name */}
                            <div className="form-group">
                                <label htmlFor="fullname" className="form-label">
                                    Full Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullname"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleChange}
                                    className={`form-input ${errors.fullname ? 'error' : ''}`}
                                    placeholder="Enter your full name"
                                />
                                {errors.fullname && <span className="error-message">{errors.fullname}</span>}
                            </div>

                            {/* Username */}
                            <div className="form-group">
                                <label htmlFor="username" className="form-label">
                                    Username <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className={`form-input ${errors.username ? 'error' : ''}`}
                                    placeholder="Enter your username"
                                />
                                {errors.username && <span className="error-message">{errors.username}</span>}
                            </div>

                            {/* Email */}
                            {/* <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Email Address <span className="required">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div> */}

                            {/* Phone Number */}
                            <div className="form-group">
                                <label htmlFor="phone" className="form-label">
                                    Phone Number <span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`form-input ${errors.phone ? 'error' : ''}`}
                                    placeholder="Enter your phone number"
                                />
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Toast
                isOpen={showToast}
                onClose={() => setShowToast(false)}
                title="Profile Updated"
                message="Your changes have been saved successfully."
            />
        </div>
    );
};

export default EditProfile;
