'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';
import { MainNavigation } from '@/components/MainNavigation';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('isGuest');
    router.push('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <MainNavigation className="hidden md:block w-64 overflow-y-auto" />
        <div className="flex-1 overflow-y-auto">
          <div className="bg-card border-b border-border">
            <div className="max-w-3xl mx-auto px-4 py-4">
              <h2 className="text-2xl font-bold text-foreground">Settings</h2>
            </div>
          </div>
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

            {/* Account */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-4">Account</h3>
              <div className="space-y-3">
                {user ? (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Name</span>
                      <span className="text-foreground font-medium">{user.name || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-foreground font-medium">{user.email || '—'}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">Not signed in</p>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Password</span>
                  <Link href="/auth/forgot-password">
                    <Button variant="outline" className="text-sm">Change Password</Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Preferences */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-2">Dietary Preferences</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Update your diet, nutrition targets, allergens, and cuisine preferences.
              </p>
              <Link href="/settings/preferences">
                <Button variant="outline">Edit Preferences</Button>
              </Link>
            </Card>

            {/* Danger Zone */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-2">Session</h3>
              <p className="text-sm text-muted-foreground mb-4">Sign out of your Feast AI account.</p>
              <Button variant="outline" onClick={handleLogout} className="text-destructive border-destructive hover:bg-destructive hover:text-white">
                Log Out
              </Button>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
