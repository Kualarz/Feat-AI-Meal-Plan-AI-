'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import { Navbar } from '@/components/Navbar';

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  cuisine: string | null;
  difficulty: string | null;
  timeMins: number | null;
  estimatedPrice: number | null;
  currency: string | null;
  kcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  imageUrl: string | null;
}

type Tab = 'website' | 'social';

const PLATFORM_BADGES: Record<string, { label: string; emoji: string }> = {
  tiktok: { label: 'TikTok', emoji: '🎵' },
  instagram: { label: 'Instagram', emoji: '📸' },
  facebook: { label: 'Facebook', emoji: '👥' },
};

function detectPlatform(url: string): string | null {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) return 'facebook';
  return null;
}

function RecipeImportContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('website');

  // Website tab state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [vegetarian, setVegetarian] = useState(false);
  const [vegan, setVegan] = useState(false);
  const [halal, setHalal] = useState(false);

  // Social video tab state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCurrency, setVideoCurrency] = useState('USD');
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importedRecipe, setImportedRecipe] = useState<Recipe | null>(null);

  // On mount: read ?url= and auto-switch tab
  useEffect(() => {
    const urlParam = searchParams.get('url') || searchParams.get('text');
    if (urlParam) {
      const platform = detectPlatform(urlParam);
      if (platform) {
        setActiveTab('social');
        setVideoUrl(urlParam);
        setDetectedPlatform(platform);
      } else {
        setWebsiteUrl(urlParam);
      }
    }
  }, [searchParams]);

  // Auto-detect platform as user types video URL
  useEffect(() => {
    setDetectedPlatform(detectPlatform(videoUrl));
  }, [videoUrl]);

  const handleWebsiteImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) {
      setError('Recipe URL is required');
      return;
    }
    setLoading(true);
    setError('');
    setImportedRecipe(null);
    try {
      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl, vegetarian, vegan, halal, currency }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to import recipe');
      }
      const result = await response.json();
      setImportedRecipe(result.recipe || result);
      setWebsiteUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setError('Video URL is required');
      return;
    }
    if (!detectedPlatform) {
      setError('Only TikTok, Instagram, and Facebook URLs are supported');
      return;
    }
    setLoading(true);
    setError('');
    setImportedRecipe(null);
    try {
      const response = await fetch('/api/recipes/import-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl, currency: videoCurrency }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to import video recipe');
      }
      const result = await response.json();
      setImportedRecipe(result.recipe || result);
      setVideoUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'AUD', label: 'AUD ($)' },
    { value: 'KHR', label: 'KHR (៛)' },
    { value: 'THB', label: 'THB (฿)' },
    { value: 'VND', label: 'VND (₫)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Import Recipe</h2>
            <Link href="/recipes">
              <Button variant="outline">← Back to Recipes</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Import Form */}
          <Card>
            {/* Tab Switcher */}
            <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
              <button
                onClick={() => { setActiveTab('website'); setError(''); setImportedRecipe(null); }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'website'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                🔗 Recipe Website
              </button>
              <button
                onClick={() => { setActiveTab('social'); setError(''); setImportedRecipe(null); }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'social'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                📱 Social Video
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-100/10 border border-red-500/50 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {activeTab === 'website' ? (
              <form onSubmit={handleWebsiteImport} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Recipe URL
                  </label>
                  <Input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => { setWebsiteUrl(e.target.value); setError(''); }}
                    placeholder="https://example.com/recipe/pad-thai"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Works with most recipe websites (AllRecipes, Tasty, BBC Good Food, etc.)
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Dietary Preferences</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Vegetarian (no meat/fish)', value: vegetarian, onChange: setVegetarian },
                      { label: 'Vegan (no animal products)', value: vegan, onChange: setVegan },
                      { label: 'Halal (no pork, no alcohol)', value: halal, onChange: setHalal },
                    ].map(({ label, value, onChange }) => (
                      <label key={label} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                          disabled={loading}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className="text-sm text-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Select
                  label="Currency for Pricing"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={currencyOptions}
                  disabled={loading}
                />

                <Button type="submit" disabled={loading || !websiteUrl.trim()} className="w-full">
                  {loading ? 'Importing...' : 'Import Recipe'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVideoImport} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Video URL
                  </label>
                  <div className="relative">
                    <Input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => { setVideoUrl(e.target.value); setError(''); }}
                      placeholder="https://www.tiktok.com/@chef/video/..."
                      disabled={loading}
                    />
                    {detectedPlatform && PLATFORM_BADGES[detectedPlatform] && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        {PLATFORM_BADGES[detectedPlatform].emoji} {PLATFORM_BADGES[detectedPlatform].label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports TikTok, Instagram Reels, and Facebook videos
                  </p>
                </div>

                <Select
                  label="Currency for Pricing"
                  value={videoCurrency}
                  onChange={(e) => setVideoCurrency(e.target.value)}
                  options={currencyOptions}
                  disabled={loading}
                />

                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    🤖 <strong>AI-Powered:</strong> Our AI analyses the video title and caption to generate a full recipe with ingredients, steps, and estimated costs.
                  </p>
                </div>

                <Button type="submit" disabled={loading || !videoUrl.trim() || !detectedPlatform} className="w-full">
                  {loading ? 'Extracting Recipe...' : 'Extract Recipe from Video'}
                </Button>
              </form>
            )}
          </Card>

          {/* Preview or Empty State */}
          <div>
            {importedRecipe ? (
              <Card className="h-full">
                <h3 className="text-xl font-semibold text-foreground mb-4">Recipe Preview</h3>

                {importedRecipe.imageUrl && (
                  <div className="w-full h-64 bg-muted rounded-xl mb-4 overflow-hidden relative">
                    <Image
                      src={importedRecipe.imageUrl}
                      alt={importedRecipe.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                )}

                <h2 className="text-2xl font-bold text-foreground mb-2">{importedRecipe.title}</h2>

                {importedRecipe.description && (
                  <p className="text-muted-foreground mb-4">{importedRecipe.description}</p>
                )}

                <div className="grid grid-cols-2 gap-2 mb-6">
                  {importedRecipe.cuisine && (
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Cuisine</p>
                      <p className="font-semibold text-foreground">{importedRecipe.cuisine}</p>
                    </div>
                  )}
                  {importedRecipe.difficulty && (
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Difficulty</p>
                      <p className="font-semibold text-foreground capitalize">{importedRecipe.difficulty}</p>
                    </div>
                  )}
                  {importedRecipe.timeMins && (
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="font-semibold text-foreground">{importedRecipe.timeMins} min</p>
                    </div>
                  )}
                  {importedRecipe.kcal && (
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">Calories</p>
                      <p className="font-semibold text-foreground">{importedRecipe.kcal} kcal</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Link href={`/recipes/${importedRecipe.id}`} className="flex-1">
                    <Button className="w-full">View Full Recipe</Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => { setImportedRecipe(null); setWebsiteUrl(''); setVideoUrl(''); }}
                    className="flex-1"
                  >
                    Import Another
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-96">
                <div className="text-center">
                  <div className="text-6xl mb-4">{activeTab === 'social' ? '📱' : '📥'}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Import</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'social'
                      ? 'Paste a TikTok, Instagram, or Facebook video URL to extract a recipe.'
                      : 'Paste a recipe URL to the left and click Import to get started.'}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Three Ways to Add Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <div className="text-4xl mb-3">✏️</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Create Manually</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your own recipes with complete details</p>
            <Link href="/recipes/add">
              <Button variant="outline" className="w-full text-sm">Go to Form</Button>
            </Link>
          </Card>
          <Card>
            <div className="text-4xl mb-3">📱</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Social Video</h3>
            <p className="text-sm text-muted-foreground mb-4">Import from TikTok, Instagram Reels, Facebook</p>
            <Button
              variant="outline"
              className="w-full text-sm"
              onClick={() => setActiveTab('social')}
            >
              Use Social Tab
            </Button>
          </Card>
          <Card>
            <div className="text-4xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">From URL</h3>
            <p className="text-sm text-muted-foreground mb-4">Import from any recipe website automatically</p>
            <Button variant="outline" className="w-full text-sm" disabled>
              You&apos;re here!
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function RecipeImportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <RecipeImportContent />
    </Suspense>
  );
}
