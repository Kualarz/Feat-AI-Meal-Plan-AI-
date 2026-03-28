'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Copy, Check, Share2, Mail } from 'lucide-react';

const INVITE_LINK = 'https://feastai.app/join?ref=user';
const INVITE_MESSAGE = "I've been using Feast AI to plan my meals and it's amazing! Join me and discover thousands of recipes with smart grocery lists. Sign up free 👉 https://feastai.app/join?ref=user";

export default function InvitePage() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(INVITE_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Join me on Feast AI',
        text: INVITE_MESSAGE,
        url: INVITE_LINK,
      });
    } else {
      handleCopy();
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Join me on Feast AI — smart meal planning made easy');
    const body = encodeURIComponent(INVITE_MESSAGE);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-display text-foreground tracking-tight">Invite Friends</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Hero */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-display text-foreground tracking-tight">Share the love</h2>
          <p className="text-sm text-muted-foreground font-body mt-2 max-w-xs leading-relaxed">
            Invite your friends and family to discover Feast AI. The more the merrier — especially at the dinner table.
          </p>
        </div>

        {/* Invite link */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
          <p className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-3">Your invite link</p>
          <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-4 py-3">
            <span className="flex-1 text-sm font-body text-foreground truncate">{INVITE_LINK}</span>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 text-muted-foreground hover:text-accent transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-brand-green" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-brand-green font-body mt-2">Link copied to clipboard!</p>
          )}
        </div>

        {/* Share buttons */}
        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-5 py-4 bg-accent text-accent-foreground rounded-2xl font-display text-sm uppercase tracking-widest hover:brightness-105 active:brightness-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share via…
          </button>

          <button
            onClick={handleEmail}
            className="w-full flex items-center gap-3 px-5 py-4 bg-card border border-border text-foreground rounded-2xl font-display text-sm uppercase tracking-widest hover:bg-muted transition-all"
          >
            <Mail className="w-4 h-4" />
            Send by Email
          </button>
        </div>

        {/* Perks info */}
        <div className="mt-8 bg-muted/40 rounded-2xl p-5">
          <p className="text-xs font-display uppercase tracking-widest text-muted-foreground mb-3">Why invite friends?</p>
          <ul className="space-y-2.5">
            {[
              'Share your weekly meal plan with family',
              'Collaborate on a shared grocery list',
              'Discover recipes your friends love',
            ].map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm font-body text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
