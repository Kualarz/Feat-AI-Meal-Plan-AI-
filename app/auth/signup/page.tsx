'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Card } from '@/components/Card';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContinueAsGuest = (e: React.MouseEvent) => {
    e.preventDefault();
    setGuestLoading(true);

    try {
      // Store guest mode flag in localStorage
      localStorage.setItem('isGuest', 'true');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');

      // Redirect to recipe browser
      router.push('/recipes');
    } catch (error) {
      console.error('Error continuing as guest:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setGuestLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to sign up');
        return;
      }

  // Store user info in localStorage
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('userId', data.user.id);
  localStorage.setItem('isGuest', 'false');

  // After sign up, take user to the recipe browser
  router.push('/recipes');
    } catch (error) {
      console.error('Error signing up:', error);
      setError('An error occurred during sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create Your Account
            </h1>
            <p className="text-muted-foreground">
              Join Feast AI to start your nutrition journey
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  or
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleContinueAsGuest}
              disabled={guestLoading}
              className="w-full"
            >
              {guestLoading ? 'Loading...' : 'Continue as Guest'}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary hover:underline font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
