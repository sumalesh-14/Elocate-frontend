'use client';

import React, { useState, useEffect } from 'react';
import { SignIn } from '@/components/SignIn';
import { useRouter } from 'next/navigation';
import { getRole } from '@/lib/sign-in-auth';

export default function SignInPage() {
  const [isSignInOpen, setIsSignInOpen] = useState(true);
  const router = useRouter();

  const handleSignIn = () => {
    setIsSignInOpen(false);
    
    // Small delay to allow state to update
    setTimeout(() => {
      // Role-based navigation
      const role = getRole();
      
      if (role === 'ADMIN') {
        window.location.href = '/admin';
      } else if (role === 'INTERMEDIARY') {
        window.location.href = '/intermediary/dashboard';
      } else {
        window.location.href = '/citizen';
      }
    }, 100);
  };

  const handleClose = () => {
    router.push('/');
  };

  return (
    <SignIn 
      isOpen={isSignInOpen} 
      onClose={handleClose} 
      onSignIn={handleSignIn} 
    />
  );
}
