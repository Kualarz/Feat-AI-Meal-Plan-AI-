'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';
import { MainNavigation } from '@/components/MainNavigation';

type Row = {
  label: string;
  description?: string;
  right: React.ReactNode;
};

function SettingsRow({ label, description, right }: Row) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="ml-4 flex-shrink-0">{right}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? 'bg-primary' : 'bg-muted-foreground/30'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  // App preference toggles — persisted in localStorage
  const [imperialUnits, setImperialUnits] = useState(false);
  const [showNutrition, setShowNutrition] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    const units = localStorage.getItem('units');
    if (units === 'imperial') setImperialUnits(true);
    const nutrition = localStorage.getItem('showNutrition');
    if (nutrition === 'false') setShowNutrition(false);
  }, []);

  const toggleUnits = () => {
    const next = !imperialUnits;
    setImperialUnits(next);
    localStorage.setItem('units', next ? 'imperial' : 'metric');
  };

  const toggleNutrition = () => {
    const next = !showNutrition;
    setShowNutrition(next);
    localStorage.setItem('showNutrition', String(next));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('isGuest');
    router.push('/auth/signin');
  };

  const chevron = (
    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

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

            {/* ── Account ─────────────────────────────────────── */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-1">Account</h3>
              <p className="text-xs text-muted-foreground mb-4">Manage your account details and subscription</p>
              <div className="divide-y divide-border">
                {user ? (
                  <>
                    <SettingsRow label="Name" right={<span className="text-sm text-muted-foreground">{user.name || '—'}</span>} />
                    <SettingsRow label="Email" right={<span className="text-sm text-muted-foreground">{user.email || '—'}</span>} />
                  </>
                ) : (
                  <SettingsRow label="Account" right={
                    <Link href="/auth/signin"><Button variant="outline" className="text-sm">Sign In</Button></Link>
                  } />
                )}
                <SettingsRow
                  label="Password"
                  right={
                    <Link href="/auth/forgot-password">
                      <Button variant="outline" className="text-sm">Change</Button>
                    </Link>
                  }
                />
                <SettingsRow
                  label="Subscription"
                  description="Free plan — upgrade for unlimited meal plans"
                  right={
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      Free
                    </span>
                  }
                />
              </div>
            </Card>

            {/* ── Profile ─────────────────────────────────────── */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-1">Profile</h3>
              <p className="text-xs text-muted-foreground mb-4">Your body metrics and nutrition targets</p>
              <div className="divide-y divide-border">
                <SettingsRow
                  label="Measurement &amp; Nutrition Settings"
                  description="Update weight, height, age, activity level, and calorie targets"
                  right={
                    <Link href="/settings/preferences">
                      <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                        Edit {chevron}
                      </button>
                    </Link>
                  }
                />
              </div>
            </Card>

            {/* ── App Preferences ─────────────────────────────── */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-1">App Preferences</h3>
              <p className="text-xs text-muted-foreground mb-4">Display and behaviour settings</p>
              <div className="divide-y divide-border">
                <SettingsRow
                  label="Measurement Units"
                  description={imperialUnits ? 'Imperial (lbs, ft/in)' : 'Metric (kg, cm)'}
                  right={<Toggle checked={imperialUnits} onChange={toggleUnits} />}
                />
                <SettingsRow
                  label="Show Nutrition Info"
                  description="Display calories and macros on recipe cards"
                  right={<Toggle checked={showNutrition} onChange={toggleNutrition} />}
                />
              </div>

              {/* Dietary Preferences sub-section */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground mb-3">Dietary Preferences</p>
                <div className="divide-y divide-border">
                  <SettingsRow
                    label="Diet Type"
                    description="Balanced, keto, vegetarian, vegan, etc."
                    right={
                      <Link href="/settings/preferences">
                        <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                          Edit {chevron}
                        </button>
                      </Link>
                    }
                  />
                  <SettingsRow
                    label="Dislikes"
                    description="Ingredients you want to avoid in recipes"
                    right={
                      <Link href="/settings/preferences">
                        <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                          Edit {chevron}
                        </button>
                      </Link>
                    }
                  />
                  <SettingsRow
                    label="Allergies"
                    description="Ingredients that will be filtered out completely"
                    right={
                      <Link href="/settings/preferences">
                        <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                          Edit {chevron}
                        </button>
                      </Link>
                    }
                  />
                </div>
              </div>
            </Card>

            {/* ── Support ─────────────────────────────────────── */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-1">Support</h3>
              <p className="text-xs text-muted-foreground mb-4">Help and community</p>
              <div className="divide-y divide-border">
                <SettingsRow
                  label="Invite a Friend"
                  description="Share Feast AI with someone you know"
                  right={
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Feast AI',
                            text: 'Check out Feast AI — AI-powered meal planning!',
                            url: window.location.origin,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.origin);
                          alert('Link copied to clipboard!');
                        }
                      }}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Share {chevron}
                    </button>
                  }
                />
                <SettingsRow
                  label="Leave a Review"
                  description="Help us improve by sharing your feedback"
                  right={
                    <a
                      href="https://github.com/anthropics/claude-code/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Open {chevron}
                    </a>
                  }
                />
              </div>
            </Card>

            {/* ── Session ─────────────────────────────────────── */}
            <Card>
              <h3 className="text-lg font-semibold text-foreground mb-2">Session</h3>
              <p className="text-sm text-muted-foreground mb-4">Sign out of your Feast AI account.</p>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-destructive border-destructive hover:bg-destructive hover:text-white"
              >
                Log Out
              </Button>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
