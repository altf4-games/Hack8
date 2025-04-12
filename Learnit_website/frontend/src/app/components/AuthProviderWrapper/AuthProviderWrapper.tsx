// app/components/AuthProviderWrapper.tsx
"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, AuthProvider } from '@/app/contexts/AuthContext/auth-type';

// Component to handle auth redirects
function AuthRedirectHandler({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && (pathname === '/login' || pathname === '/signup')) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  // We still render the layout even during redirect to maintain UI consistency
  return <>{children}</>;
}

export default function AuthProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthRedirectHandler>
        {children}
      </AuthRedirectHandler>
    </AuthProvider>
  );
}