"use client";

import React from 'react';

interface ThemePreviewProps {
  colors: string[];
}

export function ThemePreview({ colors }: ThemePreviewProps) {
  return (
    <div className="w-full aspect-[16/10] rounded-lg overflow-hidden border border-border/30 relative" style={{ background: colors[2] || colors[0] }}>
      {/* sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-[22%] flex flex-col gap-1 p-1.5" style={{ background: `${colors[0]}22` }}>
        <div className="w-full h-1.5 rounded-full" style={{ background: colors[0], opacity: 0.6 }} />
        <div className="w-3/4 h-1 rounded-full bg-current opacity-20" />
        <div className="w-3/4 h-1 rounded-full bg-current opacity-20" />
        <div className="w-3/4 h-1 rounded-full bg-current opacity-20" />
      </div>
      {/* content */}
      <div className="absolute left-[26%] top-2 right-2 space-y-1.5">
        <div className="flex gap-1">
          {[colors[0], colors[1], colors[0], colors[1]].map((c, i) => (
            <div key={i} className="flex-1 h-5 rounded" style={{ background: c, opacity: 0.25 }} />
          ))}
        </div>
        <div className="flex gap-1">
          <div className="flex-[2] h-8 rounded" style={{ background: colors[0], opacity: 0.15 }} />
          <div className="flex-1 h-8 rounded" style={{ background: colors[1], opacity: 0.15 }} />
        </div>
        <div className="h-6 rounded" style={{ background: colors[0], opacity: 0.1 }} />
      </div>
    </div>
  );
}