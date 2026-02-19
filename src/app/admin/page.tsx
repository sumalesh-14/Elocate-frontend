'use client';

import { AdminLayout } from './components/AdminLayout';
import { useEffect } from 'react';

export default function Page() {
    useEffect(() => {
        // Remove any body margins/padding for admin pages
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        
        return () => {
            // Cleanup on unmount
            document.body.style.overflow = '';
        };
    }, []);

    const handleLogout = () => {
        // Clear any auth tokens/session
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        // Redirect to sign-in page
        window.location.href = '/sign-in';
    };

    return <AdminLayout onLogout={handleLogout} />;
}
