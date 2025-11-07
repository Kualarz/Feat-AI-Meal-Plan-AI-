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
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-4 px-3">
            Main Features
          </p>
          <div className="space-y-1">
            <Link
              href="/recipes"
              className={`block px-3 py-2 rounded-lg transition-colors ${
                isActive('/recipes')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <span className="text-lg mr-2">🍜</span>
              Recipe Browser
            </Link>
            <Link
              href="/planner"
              className={`block px-3 py-2 rounded-lg transition-colors ${
                isActive('/planner')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <span className="text-lg mr-2">📅</span>
              Meal Planner
            </Link>
            <Link
              href="/groceries"
              className={`block px-3 py-2 rounded-lg transition-colors ${
                isActive('/groceries')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <span className="text-lg mr-2">🛒</span>
              Shopping List
            </Link>
          </div>
        </div>

        {/* Secondary Features */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-4 px-3">
            Account
          </p>
          <div className="space-y-1">
            <Link
              href="/setup"
              className={`block px-3 py-2 rounded-lg transition-colors ${
                isActive('/setup')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <span className="text-lg mr-2">⚙️</span>
              Settings
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  );
}
