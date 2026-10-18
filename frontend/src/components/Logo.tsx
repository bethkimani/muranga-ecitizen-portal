import React from 'react';
import { Link } from 'react-router-dom';

export const EMBLEM_URL = "/image.png";

interface LogoProps {
  inverted?: boolean;
  subtitle?: string;
  to?: string;
}

export function Logo({ inverted = false, subtitle = 'Digital Public Service Portal', to = '/' }: LogoProps) {
  return (
    <Link to={to} className="flex min-w-0 items-center gap-3" aria-label="Murang’a County Digital Public Service Portal — home">
      <span className={`block aspect-[8/5] w-14 shrink-0 overflow-hidden rounded-md ${inverted ? 'ring-1 ring-white/20' : 'ring-1 ring-line'} bg-white`}>
        <img src={EMBLEM_URL} alt="" className="h-full w-full object-contain" />
      </span>
      <span className="min-w-0">
        <span className={`block truncate text-[15px] font-extrabold leading-tight ${inverted ? 'text-white' : 'text-ink'}`}>Murang’a County</span>
        <span className={`block truncate text-xs font-medium ${inverted ? 'text-white/70' : 'text-muted'}`}>{subtitle}</span>
      </span>
    </Link>);

}