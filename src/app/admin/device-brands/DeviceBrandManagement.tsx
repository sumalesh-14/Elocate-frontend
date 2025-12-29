"use client";
import React from 'react';
import Link from 'next/link';
import ListBrands from './ListBrands';

const DeviceBrandManagement: React.FC = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>Device Brand Management</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link
                        href="/admin/device-brands/create"
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
                        Create Brand
                    </Link>
                </div>
            </div>

            <ListBrands />
        </div>
    );
};

export default DeviceBrandManagement;
