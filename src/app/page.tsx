"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getRole } from './citizen/sign-in/auth';
import { ROLE_ROUTES, UserRole } from './sign-in/routes';

export default function Home() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            if (!isAuthenticated()) {
                router.replace('/citizen');
            } else {
                const role = getRole() as UserRole;
                const redirectPath = ROLE_ROUTES[role] || ROLE_ROUTES.DEFAULT;
                router.replace(redirectPath);
            }
        }
    }, [router, mounted]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white font-montserrat">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-emerald-100 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-100 rounded"></div>
                <p className="mt-4 text-emerald-600 font-bold">Redirecting...</p>
            </div>
        </div>
    );
}
