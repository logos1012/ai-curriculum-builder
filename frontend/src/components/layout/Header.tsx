'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              강의 커리큘럼 작성 도구
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                대시보드
              </Link>
              <Link 
                href="/builder" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                새 커리큘럼
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-700 text-sm font-medium">
                      {user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                >
                  로그아웃
                </Button>
              </div>
            </>
          ) : (
            <Button 
              onClick={() => router.push('/auth/login')}
              size="sm"
            >
              로그인
            </Button>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="sm">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;