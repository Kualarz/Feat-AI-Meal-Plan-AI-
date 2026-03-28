'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MainNavigationProps {
  className?: string;
}

export function MainNavigation({ className = '' }: MainNavigationProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <aside className={`bg-card border-r border-border ${className}`}>
      <nav className="space-y-2 p-6">
        {/* Main Features */}
        <div className="mb-8">
          <p className="text-xs font-display text-brand-green uppercase tracking-widest mb-4 px-3">
            Main Features
          </p>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              aria-label="Go to Home"
              className={`block px-3 py-2.5 rounded-pill transition-all font-display text-xs uppercase tracking-widest ${
                isActive('/dashboard')
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                  : 'text-foreground hover:bg-brand-orange-tint hover:text-accent motion-safe:hover:translate-x-1'
              }`}
            >
              <span className="text-lg mr-2" aria-hidden="true">🏠</span>
              Home
            </Link>
            <Link
              href="/recipes"
              aria-label="Recipe Browser"
              className={`block px-3 py-2.5 rounded-pill transition-all font-display text-xs uppercase tracking-widest ${
                isActive('/recipes')
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                  : 'text-foreground hover:bg-brand-orange-tint hover:text-accent motion-safe:hover:translate-x-1'
              }`}
            >
              <span className="text-lg mr-2" aria-hidden="true">🍜</span>
              Recipe Browser
            </Link>
            <Link
              href="/menu"
              aria-label="Menu"
              className={`block px-3 py-2.5 rounded-pill transition-all font-display text-xs uppercase tracking-widest ${
                isActive('/menu')
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                  : 'text-foreground hover:bg-brand-orange-tint hover:text-accent motion-safe:hover:translate-x-1'
              }`}
            >
              <span className="text-lg mr-2" aria-hidden="true">📅</span>
              Menu
            </Link>
            <Link
              href="/groceries"
              aria-label="Shopping List"
              className={`block px-3 py-2.5 rounded-pill transition-all font-display text-xs uppercase tracking-widest ${
                isActive('/groceries')
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                  : 'text-foreground hover:bg-brand-orange-tint hover:text-accent motion-safe:hover:translate-x-1'
              }`}
            >
              <span className="text-lg mr-2" aria-hidden="true">🛒</span>
              Shopping List
            </Link>
            <Link
              href="/leftovers"
              aria-label="Leftover Optimizer"
              className={`block px-3 py-2.5 rounded-pill transition-all font-display text-xs uppercase tracking-widest ${
                isActive('/leftovers')
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                  : 'text-foreground hover:bg-brand-orange-tint hover:text-accent motion-safe:hover:translate-x-1'
              }`}
            >
              <span className="text-lg mr-2" aria-hidden="true">♻️</span>
              Leftovers
            </Link>
          </div>
        </div>

        {/* Secondary Features */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-display text-brand-green uppercase tracking-widest mb-4 px-3">
            Account
          </p>
          <div className="space-y-1">
            <Link
              href="/settings"
              aria-label="Settings"
              className={`block px-3 py-2.5 rounded-pill transition-all font-display text-xs uppercase tracking-widest ${
                isActive('/settings')
                  ? 'bg-accent text-accent-foreground shadow-lg shadow-accent/20'
                  : 'text-foreground hover:bg-brand-orange-tint hover:text-accent motion-safe:hover:translate-x-1'
              }`}
            >
              <span className="text-lg mr-2" aria-hidden="true">⚙️</span>
              Settings
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}
