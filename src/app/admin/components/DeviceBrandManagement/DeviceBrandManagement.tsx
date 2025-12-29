import React from 'react';
import Link from 'next/link';
import ListBrands from './ListBrands';

const DeviceBrandManagement: React.FC = () => {
    return (
        <div>
            <h1>Device Brand Management</h1>
            <nav style={{ marginBottom: '1rem' }}>
                <Link href="/device-brands" style={{ marginRight: '1rem', color: '#3498db', textDecoration: 'none' }}>
                    List Brands
                </Link>
                |
                <Link href="/device-brands/create" style={{ marginLeft: '1rem', color: '#3498db', textDecoration: 'none' }}>
                    Create Brand
                </Link>
            </nav>

            <ListBrands />
        </div>
    );
};

export default DeviceBrandManagement;
