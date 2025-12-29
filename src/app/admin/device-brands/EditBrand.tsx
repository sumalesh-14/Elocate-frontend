"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import './EditBrand.css';

const EditBrand = () => {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [brandName, setBrandName] = useState('');
    const [activeStatus, setActiveStatus] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchBrand = async () => {
            try {
                setLoading(true);
                // TODO: Replace with actual API call
                // const brand = await getBrandById(id);

                // Simulate API call with mock data
                await new Promise(resolve => setTimeout(resolve, 500));
                setBrandName('Apple'); // Mock data
                setActiveStatus(true); // Mock data

                setLoading(false);
            } catch (err) {
                setError('Failed to load brand');
                setLoading(false);
            }
        };
        if (id) {
            fetchBrand();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!brandName.trim()) {
            setError('Brand name is required.');
            return;
        }

        if (!id) return;

        try {
            setSubmitting(true);
            // TODO: Replace with actual API call
            // await updateBrand(id, { name: brandName, active: activeStatus });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));

            router.push('/device-brands');
        } catch (err) {
            setError('Failed to update brand. Please try again.');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Loading brand...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-brand-container">
            <div className="edit-brand-wrapper">
                <div className="edit-brand-header">
                    <h1>Edit Brand</h1>
                    <p>Update device brand information</p>
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
                                    checked={activeStatus}
                                    onChange={(e) => setActiveStatus(e.target.checked)}
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
                                disabled={submitting}
                                className="btn-primary"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
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

export default EditBrand;
