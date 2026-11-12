'use client';

import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

interface CompanyLogoProps {
  name: string;
  logoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
  textClassName?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  name,
  logoUrl,
  primaryColor = '#6366F1',
  secondaryColor = '#8B5CF6',
  className = 'w-14 h-14 rounded-2xl',
  textClassName = 'text-sm font-bold',
}) => {
  const [imageError, setImageError] = useState(false);

  // Compute 1-2 letter initials
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'CO';

  const hasImage = Boolean(logoUrl && logoUrl.trim() && !imageError);

  if (hasImage && logoUrl) {
    return (
      <div className={`relative overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 ${className}`}>
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Graceful fallback brand emblem when no image is uploaded
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center font-bold text-white shadow-sm border border-black/5 dark:border-white/10 select-none ${className}`}
      style={{
        background: `linear-gradient(135deg, ${primaryColor || '#6366F1'}, ${secondaryColor || '#8B5CF6'})`,
      }}
      title={`${name} (No image uploaded — dynamic brand emblem active)`}
    >
      <span className={`tracking-wider ${textClassName}`}>
        {initials}
      </span>
    </div>
  );
};

