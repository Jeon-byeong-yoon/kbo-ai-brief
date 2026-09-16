'use client';

import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { BallIcon, ChevronDownIcon } from './ui/Icons';
import { TEAM_CODES, TEAM_ASSETS } from '@/lib/team-assets';

interface HeaderProps {
  favoriteTeam: string;
  onFavoriteTeamChange: (teamCode: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ favoriteTeam, onFavoriteTeamChange }) => {
  const favoriteLabel =
    favoriteTeam === 'NONE' ? '없음' : (TEAM_ASSETS[favoriteTeam as keyof typeof TEAM_ASSETS]?.name ?? '없음');

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[60px] max-w-shell items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 shrink items-center gap-2.5">
          <BallIcon size={24} className="shrink-0 text-fg" />
          <h1 className="truncate text-[16.5px] font-bold tracking-[-0.03em] text-fg">KBO AI Brief</h1>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <label className="relative flex h-[34px] items-center gap-1.5 rounded-control border border-line bg-surface pl-3 pr-2.5">
            <span className="text-2xs font-semibold tracking-wide text-fg3">MY</span>
            <span className="max-w-[92px] truncate text-[13px] font-semibold tracking-[-0.01em] text-fg">
              {favoriteLabel}
            </span>
            <ChevronDownIcon className="text-fg3" />
            <select
              value={favoriteTeam}
              onChange={(e) => onFavoriteTeamChange(e.target.value)}
              aria-label="관심 구단"
              className="absolute inset-0 cursor-pointer opacity-0"
            >
              <option value="NONE">없음</option>
              {TEAM_CODES.map((code) => (
                <option key={code} value={code}>
                  {TEAM_ASSETS[code].name}
                </option>
              ))}
            </select>
          </label>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
