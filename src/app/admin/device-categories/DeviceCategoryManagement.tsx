"use client";
import React from 'react';
import Link from 'next/link';
import ListCategories from './ListCategories';

const DeviceCategoryManagement: React.FC = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Device Category Management</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link
                        href="/admin/device-categories/create"
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.9375rem',
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
                            transition: 'all 0.2s ease',
                            display: 'inline-block'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.25)';
                        }}
                    >
                        Create Category
                    </Link>
                </div>
            </div>

            <ListCategories />
        </div>
    );
};

export default DeviceCategoryManagement;
