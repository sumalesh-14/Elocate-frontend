'use client';

import React, { useState, Suspense } from 'react';
import { SignIn } from '@/components/SignIn';
import { useRouter, useSearchParams } from 'next/navigation';
import { getRole } from '@/lib/sign-in-auth';

function SignInPageInner() {
  const [isSignInOpen, setIsSignInOpen] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Support ?view=role-selection to start on the role selection screen
  const viewParam = searchParams.get('view');
  const initialView = viewParam === 'role-selection' ? 'role-selection' : 'login';

  const handleSignIn = () => {
    setIsSignInOpen(false);

    setTimeout(() => {
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
      initialView={initialView as any}
    />
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageInner />
    </Suspense>
  );
}
