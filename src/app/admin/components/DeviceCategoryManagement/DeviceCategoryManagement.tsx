import React from 'react';
import Link from 'next/link';
import ListCategories from './ListCategories';

const DeviceCategoryManagement: React.FC = () => {
    return (
        <div>
            <h1>Device Category Management</h1>
            <nav style={{ marginBottom: '1rem' }}>
                <Link href="/device-categories" style={{ marginRight: '1rem', color: '#3498db', textDecoration: 'none' }}>
                    List Categories
                </Link>
                |
                <Link href="/device-categories/create" style={{ marginLeft: '1rem', color: '#3498db', textDecoration: 'none' }}>
                    Create Category
                </Link>
            </nav>

            <ListCategories />
        </div>
    );
};

export default DeviceCategoryManagement;
