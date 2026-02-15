'use client';

import { AdminLayout } from './components/AdminLayout';

export default function Page() {
    const handleLogout = () => {
        // Clear any auth tokens/session
        localStorage.removeItem('authToken');
        // Redirect to sign-in page
        window.location.href = '/sign-in';
    };

    return <AdminLayout onLogout={handleLogout} />;
}
