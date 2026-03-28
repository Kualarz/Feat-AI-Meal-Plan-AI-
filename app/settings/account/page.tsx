'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-display uppercase tracking-widest text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent placeholder:text-muted-foreground/50 transition';

export default function AccountPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setName(d.name || ''); setEmail(d.email || ''); } })
      .catch(() => {});
  }, []);

  const saveProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Profile updated!' });
      } else {
        setMsg({ type: 'error', text: 'Failed to update profile.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Connection error.' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPw || !newPw) return setMsg({ type: 'error', text: 'Fill in current and new password.' });
    if (newPw !== confirmPw) return setMsg({ type: 'error', text: 'New passwords do not match.' });
    if (newPw.length < 6) return setMsg({ type: 'error', text: 'New password must be at least 6 characters.' });

    const token = localStorage.getItem('token');
    if (!token) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Password changed successfully.' });
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      } else {
        const d = await res.json();
        setMsg({ type: 'error', text: d.error || 'Failed to change password.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Connection error.' });
    } finally {
      setSaving(false);
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
          <h1 className="text-base font-display text-foreground tracking-tight">Account Details</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* Toast */}
        {msg && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body ${msg.type === 'success' ? 'bg-brand-green/10 text-brand-green' : 'bg-destructive/10 text-destructive'}`}>
            {msg.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {msg.text}
          </div>
        )}

        {/* Profile section */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <p className="text-xs font-display uppercase tracking-widest text-muted-foreground">Profile</p>

          <Field label="Display Name">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                className={`${inputClass} pl-10`}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </Field>

          <Field label="Username">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/50 font-body select-none">@</span>
              <input
                className={`${inputClass} pl-7 opacity-60 cursor-not-allowed`}
                value={name ? name.toLowerCase().replace(/\s+/g, '') : ''}
                readOnly
                placeholder="username"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Username is generated from your display name.</p>
          </Field>

          <Field label="Email Address">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                className={`${inputClass} pl-10 opacity-60 cursor-not-allowed`}
                value={email}
                readOnly
                placeholder="your@email.com"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Email cannot be changed.</p>
          </Field>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-display text-sm uppercase tracking-widest hover:brightness-105 active:brightness-95 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>

        {/* Change password */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <p className="text-xs font-display uppercase tracking-widest text-muted-foreground">Change Password</p>

          <Field label="Current Password">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                type={showCurrent ? 'text' : 'password'}
                className={`${inputClass} pl-10 pr-10`}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="Current password"
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field label="New Password">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                type={showNew ? 'text' : 'password'}
                className={`${inputClass} pl-10 pr-10`}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="New password (min 6 chars)"
              />
              <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field label="Confirm New Password">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <input
                type="password"
                className={`${inputClass} pl-10`}
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
          </Field>

          <button
            onClick={changePassword}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-foreground text-background font-display text-sm uppercase tracking-widest hover:opacity-90 active:opacity-80 transition-all disabled:opacity-50"
          >
            {saving ? 'Updating…' : 'Change Password'}
          </button>
        </div>


      </div>
    </div>
  );
}
