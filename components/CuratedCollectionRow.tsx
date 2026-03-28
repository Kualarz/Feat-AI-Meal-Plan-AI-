'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { RecipeCard, RecipeCardRecipe } from '@/components/RecipeCard';

interface CuratedCollectionRowProps {
  title: string;
  emoji: string;
  tagline: string;
  recipes: RecipeCardRecipe[];
  likedIds?: Set<string>;
  savedIds?: Set<string>;
}

export function CuratedCollectionRow({
  title,
  emoji,
  tagline,
  recipes,
  likedIds = new Set(),
  savedIds = new Set(),
}: CuratedCollectionRowProps) {
  if (recipes.length === 0) return null;

  return (
    <div className="mb-10">
      {/* Row header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-display text-2xl text-foreground tracking-tight flex items-center gap-2">
            <span>{emoji}</span>
            {title}
          </h2>
          <p className="text-sm text-muted-foreground font-body italic mt-0.5">{tagline}</p>
        </div>
        <Link
          href={`/recipes?q=${encodeURIComponent(title)}`}
          className="shrink-0 flex items-center gap-1 text-xs font-display uppercase tracking-widest text-accent hover:text-accent/70 transition-colors mt-1"
        >
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontally scrollable recipe strip */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="flex-shrink-0 w-56">
            <RecipeCard
              recipe={recipe}
              initialLiked={likedIds.has(recipe.id)}
              initialSaved={savedIds.has(recipe.id)}
            />
          </div>
        ))}
        {/* Fade-out hint on right edge */}
        <div className="flex-shrink-0 w-8" aria-hidden="true" />
      </div>
    </div>
  );
}
