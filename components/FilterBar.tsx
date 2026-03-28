'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Check } from 'lucide-react';

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  activeFilters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
  filterOptions: {
    key: string;
    label: string;
    emoji: string;
    options: string[];
    singleSelect?: boolean;
  }[];
}

interface PillDropdownProps {
  filterKey: string;
  label: string;
  emoji: string;
  options: string[];
  selected: string[];
  onChange: (key: string, values: string[]) => void;
  singleSelect?: boolean;
}

function PillDropdown({ filterKey, label, emoji, options, selected, onChange, singleSelect = false }: PillDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const toggle = (opt: string) => {
    if (singleSelect) {
      // Radio behavior: clicking the same one deselects, clicking a new one switches
      onChange(filterKey, selected.includes(opt) ? [] : [opt]);
    } else {
      const next = selected.includes(opt)
        ? selected.filter((v) => v !== opt)
        : [...selected, opt];
      onChange(filterKey, next);
    }
  };

  const isActive = selected.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-pill text-xs font-display uppercase tracking-widest transition-all border whitespace-nowrap ${
          isActive
            ? 'bg-accent text-accent-foreground border-accent shadow-md shadow-accent/25'
            : 'bg-card text-foreground border-border hover:border-accent/60 hover:text-accent hover:bg-accent/5'
        }`}
      >
        <span className="text-sm">{emoji}</span>
        {label}
        {isActive && (
          <span className="ml-0.5 bg-white/25 text-current rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl shadow-black/10 z-50 overflow-hidden">
          {/* Dropdown header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-display text-sm text-foreground tracking-tight">
              {emoji} {label}
            </span>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange(filterKey, [])}
                className="text-xs text-muted-foreground hover:text-accent font-body transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-72 overflow-y-auto py-1.5">
            {options.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body transition-colors text-left ${
                    checked ? 'text-accent bg-accent/5' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-colors ${
                      checked ? 'bg-accent border-accent' : 'border-border'
                    }`}
                  >
                    {checked && <Check className="w-2.5 h-2.5 text-accent-foreground" />}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterBar({
  search,
  onSearchChange,
  activeFilters,
  onFilterChange,
  filterOptions,
}: FilterBarProps) {
  const totalActive = Object.values(activeFilters).flat().length;

  return (
    <div className="bg-background border-b border-border sticky top-16 z-40 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search recipes…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-card border border-border rounded-pill text-sm font-body text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter pills — centered */}
        <div className="flex items-center justify-center gap-2">
          {filterOptions.map((f) => (
            <PillDropdown
              key={f.key}
              filterKey={f.key}
              label={f.label}
              emoji={f.emoji}
              options={f.options}
              selected={activeFilters[f.key] ?? []}
              onChange={onFilterChange}
              singleSelect={f.singleSelect}
            />
          ))}

          {totalActive > 0 && (
            <button
              type="button"
              onClick={() => filterOptions.forEach((f) => onFilterChange(f.key, []))}
              className="flex items-center gap-1.5 px-4 py-2 rounded-pill text-xs font-display uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30 transition-all"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
