'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, Camera } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  editable?: boolean;
  onEdit?: () => void;
}

export function UserAvatar({
  src,
  name,
  size = 'md',
  className = '',
  editable = false,
  onEdit
}: UserAvatarProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-brand-orange-tint flex items-center justify-center border-2 border-border/50 shadow-inner`}
      >
        {src?.startsWith('emoji:') ? (
          <span className="font-body leading-none">{src.replace('emoji:', '')}</span>
        ) : src && !error ? (
          <Image
            src={src}
            alt={name || 'User avatar'}
            width={128}
            height={128}
            className="w-full h-full object-cover"
            onError={() => setError(true)}
          />
        ) : name ? (
          <span className="font-display font-bold text-accent tracking-tighter">{initials}</span>
        ) : (
          <User className="w-1/2 h-1/2 text-accent/50" />
        )}
      </div>

      {editable && (
        <button
          onClick={onEdit}
          className="absolute bottom-0 right-0 bg-accent text-white p-1.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-background"
          aria-label="Change photo"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
