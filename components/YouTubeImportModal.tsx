'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';

interface YouTubeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (recipeId: string) => void;
}

export function YouTubeImportModal({ isOpen, onClose, onSuccess }: YouTubeImportModalProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewRecipe, setPreviewRecipe] = useState<any>(null);

  if (!isOpen) return null;

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setError('');
  };

  const handleExtract = async () => {
    if (!url.trim()) {
      setError('YouTube URL is required');
      return;
    }

    if (!title.trim()) {
      setError('Video title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/recipes/youtube-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          title,
          description,
          currency,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to import recipe');
      }

      const result = await response.json();
      onSuccess(result.id);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setTitle('');
    setDescription('');
    setCurrency('USD');
    setError('');
    setPreviewRecipe(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Import Recipe from YouTube</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground text-3xl leading-none -mr-2 -mt-2"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100/10 border border-red-500/50 rounded-lg text-red-600 mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              YouTube URL
            </label>
            <Input
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://youtu.be/dQw4w9WgXcQ or https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Paste the link to the YouTube video containing the recipe
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Video Title
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="e.g., How to Make Pad Thai at Home"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Copy the video title from YouTube
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Video Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the full video description here for better recipe extraction. Include ingredients list if available."
              className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={6}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Including the video description helps extract ingredients and instructions more accurately
            </p>
          </div>

          <div className="w-1/2">
            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { value: 'USD', label: 'USD ($)' },
                { value: 'KHR', label: 'KHR (៛)' },
                { value: 'THB', label: 'THB (฿)' },
                { value: 'VND', label: 'VND (₫)' },
                { value: 'AUD', label: 'AUD ($)' },
                { value: 'EUR', label: 'EUR (€)' },
                { value: 'GBP', label: 'GBP (£)' },
              ]}
              disabled={loading}
            />
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> For best results, include a detailed description with ingredients and cooking time.
            Our AI will extract the recipe information and create a complete recipe card.
          </p>
        </div>

        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleExtract} disabled={loading || !url.trim() || !title.trim()}>
            {loading ? 'Extracting...' : 'Extract Recipe'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
