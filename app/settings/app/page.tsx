'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar',           symbol: '$'  },
  { code: 'KHR', label: 'Cambodian Riel',       symbol: '₭'  },
  { code: 'AUD', label: 'Australian Dollar',    symbol: 'A$' },
  { code: 'SGD', label: 'Singapore Dollar',     symbol: 'S$' },
  { code: 'MYR', label: 'Malaysian Ringgit',    symbol: 'RM' },
  { code: 'THB', label: 'Thai Baht',            symbol: '฿'  },
  { code: 'VND', label: 'Vietnamese Dong',      symbol: '₫'  },
  { code: 'PHP', label: 'Philippine Peso',      symbol: '₱'  },
  { code: 'IDR', label: 'Indonesian Rupiah',    symbol: 'Rp' },
  { code: 'GBP', label: 'British Pound',        symbol: '£'  },
  { code: 'EUR', label: 'Euro',                 symbol: '€'  },
  { code: 'JPY', label: 'Japanese Yen',         symbol: '¥'  },
];

const REGIONS = [
  { code: 'KH', label: '🇰🇭 Cambodia'        },
  { code: 'AU', label: '🇦🇺 Australia'        },
  { code: 'US', label: '🇺🇸 United States'    },
  { code: 'SG', label: '🇸🇬 Singapore'        },
  { code: 'MY', label: '🇲🇾 Malaysia'         },
  { code: 'TH', label: '🇹🇭 Thailand'         },
  { code: 'VN', label: '🇻🇳 Vietnam'          },
  { code: 'PH', label: '🇵🇭 Philippines'      },
  { code: 'ID', label: '🇮🇩 Indonesia'        },
  { code: 'GB', label: '🇬🇧 United Kingdom'   },
  { code: 'JP', label: '🇯🇵 Japan'            },
];

const LANGUAGES = [
  { code: 'en', label: 'English'              },
  { code: 'km', label: 'ខ្មែរ (Khmer)',       soon: true },
  { code: 'th', label: 'ไทย (Thai)',          soon: true },
  { code: 'vi', label: 'Tiếng Việt',          soon: true },
  { code: 'ms', label: 'Bahasa Melayu',       soon: true },
  { code: 'id', label: 'Bahasa Indonesia',    soon: true },
];

function SectionLabel({ label }: { label: string }) {
  return <p className="text-xs font-display uppercase tracking-[0.18em] text-muted-foreground px-1 mb-2 mt-6 first:mt-0">{label}</p>;
}

const selectClass =
  'w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-border bg-card text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition cursor-pointer';

function SelectRow({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
      <p className="text-xs font-display uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)} className={selectClass}>
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function OptionRow({ label, sublabel, selected, onClick, disabled, last }: {
  label: string; sublabel?: string; selected: boolean; onClick: () => void; disabled?: boolean; last?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors ${!last ? 'border-b border-border/50' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted/30 active:bg-muted/50'}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      {selected && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
    </button>
  );
}

export default function AppSettingsPage() {
  const router = useRouter();
  const [currency, setCurrencyState] = useState('USD');
  const [region, setRegionState] = useState('US');
  const [language, setLanguageState] = useState('en');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setCurrencyState(localStorage.getItem('currency') || 'USD');
    setRegionState(localStorage.getItem('region') || 'US');
    setLanguageState(localStorage.getItem('language') || 'en');

    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/preferences', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          if (d.currency) setCurrencyState(d.currency);
          if (d.region) setRegionState(d.region);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('region', region);
    localStorage.setItem('language', language);

    const token = localStorage.getItem('token');
    if (!token) { setIsDirty(false); return; }
    setSaving(true);
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currency, region }),
      });
      setSaved(true);
      setIsDirty(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {} finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-16 z-10 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-base font-display text-foreground tracking-tight flex-1">App Settings</h1>
          {saved && <span className="text-xs text-brand-green font-body">Saved ✓</span>}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 pb-8">

        <SectionLabel label="Price Currency" />
        <SelectRow
          label="Currency"
          value={currency}
          onChange={v => { setCurrencyState(v); setIsDirty(true); }}
          options={CURRENCIES.map(c => ({ value: c.code, label: `${c.symbol}  ${c.label} (${c.code})` }))}
        />

        <SectionLabel label="Region" />
        <SelectRow
          label="Region"
          value={region}
          onChange={v => { setRegionState(v); setIsDirty(true); }}
          options={REGIONS.map(r => ({ value: r.code, label: r.label }))}
        />

        <SectionLabel label="Language" />
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {LANGUAGES.map((l, i) => (
            <OptionRow
              key={l.code}
              label={l.label}
              sublabel={l.soon ? 'Coming soon' : undefined}
              selected={language === l.code}
              onClick={() => { if (!l.soon) { setLanguageState(l.code); setIsDirty(true); } }}
              disabled={l.soon}
              last={i === LANGUAGES.length - 1}
            />
          ))}
        </div>

        {/* Save button */}
        <div className="mt-8">
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`w-full py-3.5 rounded-xl font-display text-sm uppercase tracking-widest transition-all ${isDirty ? 'bg-accent text-accent-foreground hover:brightness-105 active:brightness-95' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
          >
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
