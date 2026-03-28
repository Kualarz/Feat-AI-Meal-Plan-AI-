'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Card } from '@/components/Card';
import Image from 'next/image';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (recipeId: string) => void;
}

type ViewMode = 'selection' | 'manual' | 'web' | 'photo' | 'social';

export function AddRecipeModal({ isOpen, onClose, onSuccess }: AddRecipeModalProps) {
  const [view, setView] = useState<ViewMode>('selection');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Manual Form State
  const [manualData, setManualData] = useState({
    title: '',
    description: '',
    cuisine: '',
    difficulty: 'easy',
    timeMins: '',
    estimatedPrice: '',
    currency: 'USD',
    imageUrl: '',
    kcal: '',
    proteinG: '',
    carbsG: '',
    fatG: '',
    fiberG: '',
    sugarG: '',
    sodiumMg: '',
    stepsMd: '',
    safetyMd: '',
    tags: '',
  });
  const [ingredients, setIngredients] = useState([
    { name: '', qty: '', unit: 'g', notes: '' },
  ]);
  const [selectedDietTags, setSelectedDietTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Web Import State
  const [webUrl, setWebUrl] = useState('');
  
  // Social Import State
  const [socialUrl, setSocialUrl] = useState('');
  const [activeSocial, setActiveSocial] = useState<'tiktok' | 'instagram' | 'facebook' | null>(null);

  if (!isOpen) return null;

  const resetAll = () => {
    setView('selection');
    setLoading(false);
    setError('');
    setManualData({
      title: '',
      description: '',
      cuisine: '',
      difficulty: 'easy',
      timeMins: '',
      estimatedPrice: '',
      currency: 'USD',
      imageUrl: '',
      kcal: '',
      proteinG: '',
      carbsG: '',
      fatG: '',
      fiberG: '',
      sugarG: '',
      sodiumMg: '',
      stepsMd: '',
      safetyMd: '',
      tags: '',
    });
    setIngredients([{ name: '', qty: '', unit: 'g', notes: '' }]);
    setSelectedDietTags([]);
    setWebUrl('');
    setSocialUrl('');
    setActiveSocial(null);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/recipes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...manualData,
          timeMins: manualData.timeMins ? parseInt(manualData.timeMins) : null,
          estimatedPrice: manualData.estimatedPrice ? parseFloat(manualData.estimatedPrice) : null,
          kcal: manualData.kcal ? parseInt(manualData.kcal) : null,
          proteinG: manualData.proteinG ? parseInt(manualData.proteinG) : null,
          carbsG: manualData.carbsG ? parseInt(manualData.carbsG) : null,
          fatG: manualData.fatG ? parseInt(manualData.fatG) : null,
          fiberG: manualData.fiberG ? parseInt(manualData.fiberG) : null,
          sugarG: manualData.sugarG ? parseInt(manualData.sugarG) : null,
          sodiumMg: manualData.sodiumMg ? parseInt(manualData.sodiumMg) : null,
          ingredientsJson: JSON.stringify(ingredients),
          dietTags: selectedDietTags.join(','),
        }),
      });

      if (!response.ok) throw new Error('Failed to create recipe');
      const data = await response.json();
      onSuccess(data.id);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleWebImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webUrl, currency: 'USD' }),
      });
      if (!response.ok) throw new Error('Failed to import recipe');
      const data = await response.json();
      onSuccess(data.recipe.id);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error importing recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/recipes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: socialUrl, currency: 'USD' }),
      });
      if (!response.ok) throw new Error('Failed to import from social media');
      const data = await response.json();
      onSuccess(data.recipe.id);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error importing from social media');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCalculate = async () => {
    if (!ingredients.some(i => i.name)) {
      setError('Please add at least one ingredient to calculate');
      return;
    }
    setLoading(true);
    try {
      const recipeDraft = `
Title: ${manualData.title}
Ingredients:
${ingredients.map(i => `- ${i.qty} ${i.unit} ${i.name} ${i.notes}`).join('\n')}
Steps:
${manualData.stepsMd}
      `;
      const response = await fetch('/api/recipes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeText: recipeDraft, currency: manualData.currency }),
      });
      const data = await response.json();
      if (data.success) {
        setManualData(prev => ({
          ...prev,
          kcal: data.kcal?.toString() || prev.kcal,
          proteinG: data.proteinG?.toString() || prev.proteinG,
          carbsG: data.carbsG?.toString() || prev.carbsG,
          fatG: data.fatG?.toString() || prev.fatG,
          estimatedPrice: data.estimatedPrice?.toString() || prev.estimatedPrice,
        }));
      }
    } catch (err) {
      console.error('Analysis failed', err);
    } finally {
      setLoading(false);
    }
  };

  const selectionBtnClass = "flex flex-col items-center justify-center p-6 bg-muted rounded-large-card hover:bg-accent/10 border border-border/50 hover:border-accent/30 transition-all group shadow-sm hover:shadow-md";

  const renderSelection = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <button onClick={() => setView('manual')} className={selectionBtnClass}>
        <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">✏️</span>
        <span className="font-display text-foreground text-sm uppercase tracking-wider">Create Manual</span>
      </button>
      <button onClick={() => setView('web')} className={selectionBtnClass}>
        <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🌐</span>
        <span className="font-display text-foreground text-sm uppercase tracking-wider">Web Import</span>
      </button>
      <button onClick={() => setView('photo')} className={selectionBtnClass}>
        <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📸</span>
        <span className="font-display text-foreground text-sm uppercase tracking-wider">Photo Import</span>
      </button>
      <button onClick={() => { setView('social'); setActiveSocial('tiktok'); }} className={selectionBtnClass}>
        <span className="text-4xl mb-3 group-hover:scale-110 transition-transform" aria-hidden="true">📱</span>
        <span className="font-display text-foreground text-sm uppercase tracking-wider">TikTok</span>
      </button>
      <button onClick={() => { setView('social'); setActiveSocial('instagram'); }} className={selectionBtnClass}>
        <span className="text-4xl mb-3 group-hover:scale-110 transition-transform" aria-hidden="true">📸</span>
        <span className="font-display text-foreground text-sm uppercase tracking-wider">Instagram</span>
      </button>
      <button onClick={() => { setView('social'); setActiveSocial('facebook'); }} className={selectionBtnClass}>
        <span className="text-4xl mb-3 group-hover:scale-110 transition-transform" aria-hidden="true">👥</span>
        <span className="font-display text-foreground text-sm uppercase tracking-wider">Facebook</span>
      </button>
    </div>
  );

  const renderManual = () => (
    <form onSubmit={handleManualSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="manual-title"
          label="Recipe Title"
          value={manualData.title}
          onChange={e => setManualData({...manualData, title: e.target.value})}
          placeholder="e.g., Mom's Lasagna"
          required
          autoComplete="off"
        />
        <Select
          id="manual-cuisine"
          label="Cuisine"
          value={manualData.cuisine}
          onChange={e => setManualData({...manualData, cuisine: e.target.value})}
          options={[
            { value: '', label: 'Select Cuisine' },
            { value: 'Cambodian', label: 'Cambodian' },
            { value: 'Thai', label: 'Thai' },
            { value: 'Vietnamese', label: 'Vietnamese' },
            { value: 'Italian', label: 'Italian' },
            { value: 'Mexican', label: 'Mexican' },
            { value: 'American', label: 'American' },
          ]}
          required
        />
      </div>

      <textarea
        placeholder="Brief description of the recipe..."
        value={manualData.description}
        onChange={e => setManualData({...manualData, description: e.target.value})}
        className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        rows={2}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Select
          label="Difficulty"
          value={manualData.difficulty}
          onChange={e => setManualData({...manualData, difficulty: e.target.value})}
          options={[
            { value: 'easy', label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard', label: 'Hard' },
          ]}
        />
        <Input
          id="manual-time"
          label="Time (mins)"
          type="number"
          value={manualData.timeMins}
          onChange={e => setManualData({...manualData, timeMins: e.target.value})}
          placeholder="30"
          inputMode="numeric"
        />
        <div className="flex gap-2 items-end">
          <Input
            id="manual-price"
            label="Price"
            type="number"
            step="0.01"
            value={manualData.estimatedPrice}
            onChange={e => setManualData({...manualData, estimatedPrice: e.target.value})}
            placeholder="5.50"
            className="flex-1"
            inputMode="decimal"
          />
          <Select
            value={manualData.currency}
            onChange={e => setManualData({...manualData, currency: e.target.value})}
            options={[
              { value: 'USD', label: '$' },
              { value: 'KHR', label: '៛' },
              { value: 'THB', label: '฿' },
            ]}
            className="w-20"
          />
        </div>
      </div>

      <div className="bg-brand-green/5 p-5 rounded-large-card border border-brand-green/20 shadow-inner">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-display text-brand-green uppercase tracking-widest">Nutrition & Price ✨</h4>
          <Button
            type="button"
            variant="outline"
            className="py-1 px-3 text-xs border-primary text-primary hover:bg-primary/10"
            onClick={handleAutoCalculate}
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Auto-Calculate'}
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Input label="Kcal" value={manualData.kcal} onChange={e => setManualData({...manualData, kcal: e.target.value})} className="text-xs" />
          <Input label="Protein" value={manualData.proteinG} onChange={e => setManualData({...manualData, proteinG: e.target.value})} className="text-xs" />
          <Input label="Carbs" value={manualData.carbsG} onChange={e => setManualData({...manualData, carbsG: e.target.value})} className="text-xs" />
          <Input label="Fat" value={manualData.fatG} onChange={e => setManualData({...manualData, fatG: e.target.value})} className="text-xs" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Input label="Fiber" value={manualData.fiberG} onChange={e => setManualData({...manualData, fiberG: e.target.value})} className="text-xs" />
          <Input label="Sugar" value={manualData.sugarG} onChange={e => setManualData({...manualData, sugarG: e.target.value})} className="text-xs" />
          <Input label="Sodium" value={manualData.sodiumMg} onChange={e => setManualData({...manualData, sodiumMg: e.target.value})} className="text-xs" />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Dietary Tags</h4>
        <div className="flex flex-wrap gap-2">
          {['vegetarian', 'vegan', 'gluten-free', 'halal', 'keto'].map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedDietTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
              className={`px-4 py-1.5 rounded-pill text-xs font-display tracking-wider transition-all shadow-sm ${
                selectedDietTags.includes(tag) 
                ? 'bg-accent text-accent-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-brand-orange-tint hover:text-accent border border-border/50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-foreground">Ingredients</label>
          <Button
            type="button"
            variant="outline"
            className="py-1 px-3 text-xs"
            onClick={() => setIngredients([...ingredients, { name: '', qty: '', unit: 'g', notes: '' }])}
          >
            + Add Ingredient
          </Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                placeholder="Name"
                value={ing.name}
                onChange={e => {
                  const newIngs = [...ingredients];
                  newIngs[i].name = e.target.value;
                  setIngredients(newIngs);
                }}
                className="flex-[2]"
              />
              <Input
                placeholder="Qty"
                value={ing.qty}
                onChange={e => {
                  const newIngs = [...ingredients];
                  newIngs[i].qty = e.target.value;
                  setIngredients(newIngs);
                }}
                className="w-16"
              />
              <Select
                value={ing.unit}
                onChange={e => {
                  const newIngs = [...ingredients];
                  newIngs[i].unit = e.target.value;
                  setIngredients(newIngs);
                }}
                options={['g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'whole'].map(u => ({ value: u, label: u }))}
                className="w-20"
              />
              <Input
                placeholder="Notes"
                value={ing.notes}
                onChange={e => {
                  const newIngs = [...ingredients];
                  newIngs[i].notes = e.target.value;
                  setIngredients(newIngs);
                }}
                className="flex-1"
              />
              <button 
                type="button"
                aria-label="Remove ingredient"
                className="text-muted-foreground hover:text-red-500 p-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Cooking Steps</label>
          <textarea
            value={manualData.stepsMd}
            onChange={e => setManualData({...manualData, stepsMd: e.target.value})}
            placeholder="1. Preheat oven..."
            className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
            rows={6}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Safety & Tips</label>
          <textarea
            value={manualData.safetyMd}
            onChange={e => setManualData({...manualData, safetyMd: e.target.value})}
            placeholder="- Wash hands...
- Cook to 165°F..."
            className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
            rows={6}
          />
        </div>
      </div>

      <div>
        <Input
          label="Tags (comma-separated)"
          value={manualData.tags}
          onChange={e => setManualData({...manualData, tags: e.target.value})}
          placeholder="low-carb, quick, spicy"
        />
      </div>

      <div className="flex justify-between pt-6 border-t border-border mt-4">
        <Button variant="outline" type="button" onClick={() => setView('selection')} className="rounded-pill px-8 font-display uppercase tracking-widest text-xs">Back</Button>
        <Button type="submit" disabled={loading} className="rounded-pill px-8 font-display uppercase tracking-widest text-xs shadow-lg shadow-accent/20">
          {loading ? 'Saving...' : 'Save Recipe'}
        </Button>
      </div>
    </form>
  );

  const renderWeb = () => (
    <form onSubmit={handleWebImport} className="space-y-6 text-center py-8">
      <div className="text-6xl mb-4 motion-safe:animate-bounce" aria-hidden="true">🌐</div>
      <h3 className="text-2xl font-display text-brand-green tracking-tight uppercase tracking-widest">Import from Web</h3>
      <p className="text-muted-foreground mb-4">Paste any recipe website URL</p>
      <Input
        type="url"
        value={webUrl}
        onChange={e => setWebUrl(e.target.value)}
        placeholder="https://allrecipes.com/recipe/..."
        className="text-center"
        required
      />
      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" type="button" onClick={() => setView('selection')}>Back</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Importing...' : 'Import Now'}</Button>
      </div>
    </form>
  );

  const renderSocial = () => (
    <form onSubmit={handleSocialImport} className="space-y-6 text-center py-8">
      <div className="text-6xl mb-4 motion-safe:animate-bounce" aria-hidden="true">
        {activeSocial === 'tiktok' && '📱'}
        {activeSocial === 'instagram' && '📸'}
        {activeSocial === 'facebook' && '👥'}
      </div>
      <h3 className="text-2xl font-display text-brand-green tracking-tight uppercase tracking-widest">Import from {activeSocial}</h3>
      <p className="text-muted-foreground mb-4">Paste the link to the {activeSocial} post</p>
      <Input
        type="url"
        value={socialUrl}
        onChange={e => setSocialUrl(e.target.value)}
        placeholder={`https://${activeSocial === 'tiktok' ? 'tiktok' : activeSocial}.com/...`}
        className="text-center"
        required
      />
      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" type="button" onClick={() => setView('selection')}>Back</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Extracting...' : 'Start Extraction'}</Button>
      </div>
    </form>
  );

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('currency', manualData.currency || 'USD');

    try {
      const response = await fetch('/api/recipes/analyze-image', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setManualData({
          ...manualData,
          title: data.title || '',
          description: data.description || '',
          cuisine: data.cuisine || '',
          difficulty: data.difficulty || 'easy',
          timeMins: data.timeMins?.toString() || '',
          kcal: data.kcal?.toString() || '',
          proteinG: data.proteinG?.toString() || '',
          carbsG: data.carbsG?.toString() || '',
          fatG: data.fatG?.toString() || '',
          estimatedPrice: data.estimatedPrice?.toString() || '',
          stepsMd: data.steps || '',
          safetyMd: data.safety || '',
          tags: data.tags || '',
        });
        if (data.ingredients) {
          setIngredients(data.ingredients.map((i: any) => ({
            name: i.name || '',
            qty: i.qty?.toString() || '',
            unit: i.unit || 'g',
            notes: i.notes || '',
          })));
        }
        setView('manual');
      } else {
        throw new Error(data.error || 'Failed to analyze image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing image');
    } finally {
      setLoading(false);
    }
  };

  const renderPhoto = () => (
    <div className="space-y-6 text-center py-8">
      <div className="text-6xl mb-4 motion-safe:animate-bounce" aria-hidden="true">📸</div>
      <h3 className="text-2xl font-display text-brand-green tracking-tight uppercase tracking-widest">Photo Import</h3>
      <p className="text-muted-foreground mb-4">Upload a photo of a recipe from a cookbook or handwritten note</p>
      <div 
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`border-2 border-dashed border-border rounded-large-card p-12 cursor-pointer hover:border-brand-green/50 hover:bg-brand-orange-tint transition-all ${loading ? 'opacity-50 cursor-not-allowed shadow-inner' : 'shadow-sm hover:shadow-md'}`}
      >
        <p className="text-muted-foreground font-display text-xs uppercase tracking-widest">{loading ? 'Analyzing with AI…' : 'Click to upload or drag & drop'}</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handlePhotoUpload}
          disabled={loading}
        />
      </div>
      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" type="button" onClick={() => setView('selection')} disabled={loading}>Back</Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-brand-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-brand-green/20 shadow-2xl relative rounded-large-card">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="mb-8 pr-8">
          <h2 className="text-3xl font-display text-brand-green tracking-tight">Add New Recipe</h2>
          <p className="text-sm text-muted-foreground font-body italic mt-1 font-medium">Choose how you want to add your recipe</p>
        </div>

        {error && (
          <div className="p-4 bg-red-100/10 border border-red-500/50 rounded-lg text-red-600 mb-6">
            {error}
          </div>
        )}

        {view === 'selection' && renderSelection()}
        {view === 'manual' && renderManual()}
        {view === 'web' && renderWeb()}
        {view === 'social' && renderSocial()}
        {view === 'photo' && renderPhoto()}
      </Card>
    </div>
  );
}
