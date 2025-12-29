"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './CreateBrand.css';

const CreateBrand = () => {
    const [brandName, setBrandName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!brandName.trim()) {
            setError('Brand name is required.');
            return;
        }

        try {
            setLoading(true);
            // TODO: Replace with actual API call
            // await createBrand({ name: brandName, active: isActive });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            router.push('/device-brands');
        } catch (err) {
            setError('Failed to create brand. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="create-brand-container">
            <div className="create-brand-wrapper">
                <div className="create-brand-header">
                    <h1>Create New Brand</h1>
                    <p>Add a new device brand to the system</p>
                </div>

                <Link href="/admin/device-brands" className="back-link">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Brands
                </Link>

                <div className="form-card">
                    {error && (
                        <div className="error-alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                Brand Name *
                            </label>
                            <input
                                type="text"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                className="form-input"
                                placeholder="Enter brand name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div className="checkbox-group">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="checkbox-input"
                                    id="active-checkbox"
                                />
                                <label htmlFor="active-checkbox" className="checkbox-label">
                                    Active
                                </label>
                            </div>
                        </div>

                        <div className="button-group">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Creating...' : 'Create Brand'}
                            </button>
                            <Link href="/admin/device-brands" className="btn-secondary">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateBrand;
