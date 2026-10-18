import React from 'react';
import { CrosshairIcon, MapPinIcon } from 'lucide-react';

interface Pin {
  x: number;
  y: number;
}

export function MapPicker({ pin, onPin }: {pin: Pin | null;onPin: (p: Pin | null) => void;}) {
  const coords = pin ? `${(-0.72 - pin.y * 0.0025).toFixed(4)}, ${(37.05 + pin.x * 0.0025).toFixed(4)}` : null;
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div
        className="relative h-56 cursor-crosshair bg-[#EEF3EE]"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          onPin({ x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 });
        }}
        role="application"
        aria-label="Map picker. Click to drop a pin at the issue location.">
        
        <svg viewBox="0 0 400 220" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M0 140 C80 120 140 170 220 145 S340 90 400 100" stroke="#D3E3D7" strokeWidth="22" fill="none" />
          <path d="M0 140 C80 120 140 170 220 145 S340 90 400 100" stroke="#fff" strokeWidth="8" fill="none" />
          <path d="M150 0 C160 60 130 120 170 220" stroke="#fff" strokeWidth="6" fill="none" />
          <path d="M290 0 L270 220" stroke="#fff" strokeWidth="5" fill="none" />
          <path d="M0 50 C70 60 110 35 200 55 S330 40 400 30" stroke="#BFD9F2" strokeWidth="8" fill="none" />
          <rect x="40" y="165" width="60" height="35" rx="4" fill="#E2EBE3" />
          <rect x="310" y="130" width="70" height="50" rx="4" fill="#E2EBE3" />
          <rect x="190" y="70" width="55" height="40" rx="4" fill="#E2EBE3" />
        </svg>
        {pin ?
        <MapPinIcon
          className="absolute h-9 w-9 -translate-x-1/2 -translate-y-full fill-brand text-white drop-shadow"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          aria-hidden="true" /> :


        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-card">
            Tap the map to drop a pin
          </span>
        }
        <button
          type="button"
          onClick={(e) => {e.stopPropagation();onPin({ x: 52, y: 58 });}}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-ink shadow-card hover:bg-canvas">
          
          <CrosshairIcon className="h-4 w-4 text-brand" aria-hidden="true" /> Use my location
        </button>
      </div>
      <div className="flex items-center justify-between gap-3 bg-white px-4 py-2.5 text-xs">
        <span className="text-muted">
          {coords ? <>Coordinates: <span className="font-mono font-semibold text-ink">{coords}</span></> : 'Map preview — connects to a live mapping service on integration.'}
        </span>
        {pin && <button type="button" onClick={() => onPin(null)} className="font-semibold text-danger">Clear pin</button>}
      </div>
    </div>);

}