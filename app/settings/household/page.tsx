'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, UserPlus, Crown, Share2 } from 'lucide-react';

interface Member {
  name: string;
  handle: string;
  isOwner: boolean;
  avatarInitial: string;
  color: string;
}

export default function HouseholdPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          setUserName(d.name || 'You');
          setUserHandle(d.name ? '@' + d.name.toLowerCase().replace(/\s+/g, '') : d.email ? '@' + d.email.split('@')[0] : '@you');
        }
      })
      .catch(() => {});
  }, []);

  const members: Member[] = [
    {
      name: userName || 'You',
      handle: userHandle || '@you',
      isOwner: true,
      avatarInitial: (userName || 'Y')[0].toUpperCase(),
      color: 'bg-brand-green/20 text-brand-green',
    },
  ];

  const handleInvite = async () => {
    const inviteMsg = `Join my household on Feast AI and we can plan meals together! ${window.location.origin}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Join my Feast AI Household', text: inviteMsg, url: window.location.origin }); }
      catch {}
    } else {
      try {
        await navigator.clipboard.writeText(inviteMsg);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-display text-foreground tracking-tight">Household</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* Hero */}
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-lg font-display text-foreground mb-1">Plan Meals Together</h2>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">
            Invite someone to your household. Your planner and grocery list update in real-time for everyone.
          </p>
        </div>

        {/* Members */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border/50">
            <p className="text-[10px] font-display uppercase tracking-[0.18em] text-muted-foreground">Members</p>
          </div>
          {members.map((m, i) => (
            <div key={i} className="flex items-center gap-3.5 px-5 py-4 border-b border-border/50 last:border-0">
              <div className={`w-10 h-10 rounded-full ${m.color} flex items-center justify-center font-display text-lg flex-shrink-0`}>
                {m.avatarInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.handle}</p>
              </div>
              {m.isOwner && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent rounded-pill">
                  <Crown className="w-3 h-3" />
                  <span className="text-[10px] font-display uppercase tracking-widest">Owner</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Invite */}
        <button
          onClick={handleInvite}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-accent text-accent-foreground font-display text-sm uppercase tracking-widest hover:brightness-105 active:brightness-95 transition-all shadow-md"
        >
          {copied ? (
            <><span>✓</span> Link Copied!</>
          ) : (
            <><Share2 className="w-4 h-4" /> Invite Someone</>
          )}
        </button>

        <div className="bg-muted/40 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <UserPlus className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs font-body text-muted-foreground leading-relaxed">
              When a household member checks off a grocery item or adds a recipe to the plan, everyone in the household sees it instantly.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
