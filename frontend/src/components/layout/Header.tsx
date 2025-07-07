'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ui';

export function Header() {
  const router = useRouter();
  const { success } = useToast();
  const { user, isInitialized, signOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    success('로그아웃되었습니다');
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl">📚</div>
            <span className="text-xl font-bold text-gray-900">
              AI 커리큘럼 빌더
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isInitialized && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  대시보드
                </Link>
                <Link
                  href="/builder"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  새 커리큘럼
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {user.user_metadata?.name || user.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                  >
                    로그아웃
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  로그인
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">회원가입</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {isInitialized && user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    대시보드
                  </Link>
                  <Link
                    href="/builder"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    새 커리큘럼
                  </Link>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      {user.user_metadata?.name || user.email}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      로그아웃
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button size="sm" className="w-fit">회원가입</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}