'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { ConnectionStatus } from '@/components/system/ConnectionStatus';
import { GlobalErrorBoundary } from '@/components/system/GlobalErrorBoundary';
import { EnvironmentCheck } from '@/components/system/EnvironmentCheck';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { initialize, isInitialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // 인증이 필요한 페이지들
  const protectedRoutes = ['/dashboard', '/builder'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  return (
    <GlobalErrorBoundary>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <ConnectionStatus />
          <EnvironmentCheck />
        </div>
      </ToastProvider>
    </GlobalErrorBoundary>
  );
}