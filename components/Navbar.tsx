'use client';

import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { UserAvatar } from '@/components/UserAvatar';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name?: string | null; avatarUrl?: string | null } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        // Check for guest user in localStorage
        const stored = localStorage.getItem('user');
        if (stored) {
          try { setUser(JSON.parse(stored)); } catch {}
        }
        return;
      }
      try {
        const res = await fetch('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch {}
    };
    fetchUser();
  }, [pathname]);

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  const navLink = (href: string, emoji: string, label: string) => (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-pill transition-all font-display text-xs uppercase tracking-widest whitespace-nowrap ${
        isActive(href)
          ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
          : 'text-foreground hover:bg-brand-orange-tint hover:text-accent'
      }`}
    >
      <span className="text-base" aria-hidden="true">{emoji}</span>
      {label}
    </Link>
  );

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo — left */}
          <div className="flex-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg p-1"
            >
              <span className="text-2xl filter drop-shadow-sm">🍽️</span>
              <span className="text-2xl font-display text-primary group-hover:text-primary/80 transition tracking-tight">
                Feast<span className="text-primary"> AI</span>
              </span>
            </Link>
          </div>

          {/* Nav links — centered */}
          <div className="flex items-center gap-1">
            {navLink('/dashboard', '🏠', 'Home')}
            {navLink('/recipes', '🍜', 'Recipes')}
            {navLink('/menu', '📅', 'Menu')}
            {navLink('/groceries', '🛒', 'Groceries')}
            {navLink('/leftovers', '♻️', 'Leftovers')}
          </div>

          {/* Right side */}
          <div className="flex-1 flex items-center justify-end gap-3">
            <Link
              href="/settings"
              className={`p-0.5 rounded-full transition-all ring-2 ring-offset-2 hover:ring-accent ${
                isActive('/settings') ? 'ring-accent' : 'ring-transparent'
              }`}
            >
              <UserAvatar
                src={user?.avatarUrl}
                name={user?.name}
                size="md"
              />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Toggle dark mode"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.464 7.464a1 1 0 001.414 0l.707-.707A1 1 0 005.757 5.757l-.707.707a1 1 0 000 1.414zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
