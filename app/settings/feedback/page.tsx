'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Send, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState('');
  const [type, setType] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    
    setSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ feedback, type })
      });
      
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Feedback failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Settings
        </Link>

        <div className="mb-10 text-center">
          <div className="inline-flex p-4 rounded-3xl bg-accent/10 text-accent mb-4">
            <MessageSquare className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-display text-primary tracking-tight mb-2">Share your thoughts</h1>
          <p className="text-sm text-muted-foreground font-body italic max-w-md mx-auto">
            Your feedback helps us make Feast AI the best culinary companion for everyone.
          </p>
        </div>

        {submitted ? (
          <Card className="p-12 text-center rounded-large-card border-accent/20 bg-accent/5 motion-safe:animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display text-foreground mb-2">Message Received!</h2>
            <p className="text-muted-foreground font-body italic mb-8">
              Thank you for your feedback. We read every message and use it to shape the future of Feast AI.
            </p>
            <Button 
              variant="primary" 
              onClick={() => setSubmitted(false)}
              className="rounded-pill px-8"
            >
              Send Another
            </Button>
          </Card>
        ) : (
          <Card className="p-8 rounded-large-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-display text-muted-foreground uppercase tracking-[0.2em] mb-4">
                  What&apos;s on your mind?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                  {['General', 'Bug', 'Feature', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t.toLowerCase())}
                      className={`py-2 rounded-pill text-[10px] font-display uppercase tracking-widest transition-all border ${
                        type === t.toLowerCase() 
                          ? 'bg-accent border-accent text-white shadow-md' 
                          : 'bg-muted border-transparent text-muted-foreground hover:border-accent/20'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us how we can improve..."
                  className="w-full min-h-[200px] p-4 rounded-2xl bg-muted border-2 border-transparent focus:border-accent/30 focus:bg-background transition-all font-body text-foreground outline-none resize-none"
                  required
                />
                <Sparkles className="absolute bottom-4 right-4 w-5 h-5 text-accent/20 pointer-events-none" />
              </div>

              <Button
                type="submit"
                disabled={submitting || !feedback.trim()}
                className="w-full rounded-pill py-6 font-display uppercase tracking-widest shadow-xl shadow-accent/20 group overflow-hidden relative"
              >
                {submitting ? (
                  'Sending...'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                    Submit Feedback
                  </span>
                )}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
