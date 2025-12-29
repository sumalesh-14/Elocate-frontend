import React from 'react';
import Link from 'next/link';
import ListModels from './ListModels';

const DeviceModelManagement: React.FC = () => {
    return (
        <div>
            <h1>Device Model Management</h1>
            <nav style={{ marginBottom: '1rem' }}>
                <Link href="/device-models" style={{ marginRight: '1rem', color: '#3498db', textDecoration: 'none' }}>
                    List Models
                </Link>
                |
                <Link href="/device-models/create" style={{ marginLeft: '1rem', color: '#3498db', textDecoration: 'none' }}>
                    Create Model
                </Link>
            </nav>

            <ListModels />
        </div>
    );
};

export default DeviceModelManagement;
