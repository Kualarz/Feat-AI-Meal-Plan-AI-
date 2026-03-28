'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, ChevronRight, CreditCard, Users,
  Scale, Smartphone, ChefHat, AlertTriangle, ThumbsDown, Camera,
  Sparkles, UserPlus, HelpCircle, MessageSquare,
} from 'lucide-react';

interface UserProfile {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-display uppercase tracking-[0.18em] text-muted-foreground px-1 mb-2 mt-6 first:mt-0">
      {label}
    </p>
  );
}

function SettingsRow({
  icon,
  label,
  sublabel,
  badge,
  href,
  onClick,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  badge?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  last?: boolean;
}) {
  const inner = (
    <div className={`flex items-center gap-3.5 px-4 py-4 ${!last ? 'border-b border-border/50' : ''} active:bg-muted/40 transition-colors`}>
      <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge}
        <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
      </div>
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return <div onClick={onClick} className="cursor-pointer">{inner}</div>;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [unitLabel, setUnitLabel] = useState('Metric');

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Load unit preference
    const storedUnit = localStorage.getItem('units');
    setUnitLabel(storedUnit === 'imperial' ? 'Imperial' : 'Metric');

    if (!token) {
      const stored = localStorage.getItem('user');
      if (stored) try { setUser(JSON.parse(stored)); } catch {}
      return;
    }

    fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUser(d); })
      .catch(() => {});

    fetch('/api/preferences', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUnitLabel(d.useImperial ? 'Imperial' : 'Metric'); })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    ['user', 'userId', 'token', 'isGuest'].forEach(k => localStorage.removeItem(k));
    router.push('/auth/signin');
  };

  // Derive username handle from name or email
  const handle = user?.name
    ? '@' + user.name.toLowerCase().replace(/\s+/g, '')
    : user?.email
      ? '@' + user.email.split('@')[0]
      : '@guest';

  // Avatar display: custom image or initials
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8">

        {/* ── Avatar + name hero ─── */}
        <div className="flex flex-col items-center mb-8">
          {/* Clickable avatar */}
          <Link href="/settings/avatar" className="relative mb-4 group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-brand-green/20 flex items-center justify-center">
              {user?.avatarUrl?.startsWith('emoji:') ? (
                <span className="text-4xl leading-none">{user.avatarUrl.replace('emoji:', '')}</span>
              ) : user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-display text-brand-green">{initials}</span>
              )}
            </div>
            {/* Edit badge */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-md border-2 border-white">
              <Camera className="w-3.5 h-3.5 text-accent-foreground" />
            </div>
          </Link>

          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <h1 className="text-2xl font-display text-foreground tracking-tight">
                {user?.name || 'Guest Chef'}
              </h1>
              <span className="px-2 py-0.5 bg-muted rounded-pill text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                Free
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-body mt-0.5">{handle}</p>
          </div>
        </div>

        {/* ── Account ─── */}
        <SectionLabel label="Account" />
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <SettingsRow
            icon={<User className="w-4.5 h-4.5" />}
            label="Account Details"
            sublabel="Username, email, password"
            href="/settings/account"
          />
          <SettingsRow
            icon={<CreditCard className="w-4.5 h-4.5" />}
            label="Subscription"
            sublabel="Manage your Feast AI plan"
            badge={
              <span className="px-2.5 py-0.5 bg-accent/10 text-accent rounded-pill text-[10px] font-display uppercase tracking-widest">
                Free
              </span>
            }
            href="/settings/subscription"
            last={false}
          />
          <SettingsRow
            icon={<Users className="w-4.5 h-4.5" />}
            label="Household"
            sublabel="Share plans and grocery list"
            href="/settings/household"
            last
          />
        </div>

        {/* ── App Preferences ─── */}
        <SectionLabel label="App Preferences" />
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <SettingsRow
            icon={<Scale className="w-4.5 h-4.5" />}
            label="Display & Units"
            sublabel={`${unitLabel} · Nutrition info`}
            href="/settings/units"
          />
          <SettingsRow
            icon={<Smartphone className="w-4.5 h-4.5" />}
            label="App Settings"
            sublabel="Price, region, language"
            href="/settings/app"
            last
          />
        </div>

        {/* ── Dietary Preferences ─── */}
        <SectionLabel label="Dietary Preferences" />
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <SettingsRow
            icon={<ChefHat className="w-4.5 h-4.5" />}
            label="Diet Type"
            sublabel="Omnivore, Vegetarian, Keto…"
            href="/settings/diet"
          />
          <SettingsRow
            icon={<AlertTriangle className="w-4.5 h-4.5" />}
            label="Allergies"
            sublabel="Filter out allergens from recipes"
            href="/settings/allergens"
          />
          <SettingsRow
            icon={<ThumbsDown className="w-4.5 h-4.5" />}
            label="Food Dislikes"
            sublabel="Ingredients you'd rather avoid"
            href="/settings/dislikes"
            last
          />
        </div>

        {/* ── Support ─── */}
        <SectionLabel label="Support" />
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <SettingsRow
            icon={<Sparkles className="w-4.5 h-4.5" />}
            label="What's New"
            sublabel="Latest features and updates"
            href="/settings/whats-new"
          />
          <SettingsRow
            icon={<UserPlus className="w-4.5 h-4.5" />}
            label="Invite Friends"
            sublabel="Share Feast AI with friends and family"
            href="/settings/invite"
          />
          <SettingsRow
            icon={<HelpCircle className="w-4.5 h-4.5" />}
            label="Help & FAQ"
            sublabel="Answers to common questions"
            href="/settings/help"
          />
          <SettingsRow
            icon={<MessageSquare className="w-4.5 h-4.5" />}
            label="Leave Feedback"
            sublabel="Report a bug or suggest a feature"
            href="/settings/feedback"
            last
          />
        </div>

        {/* ── Sign Out ─── */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl bg-accent text-accent-foreground font-display text-sm uppercase tracking-widest hover:brightness-105 active:brightness-95 transition-all shadow-md"
          >
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
}
