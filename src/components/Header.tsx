'use client';

import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { BallIcon, ChevronDownIcon } from './ui/Icons';
import { TEAM_CODES, TEAM_ASSETS } from '@/lib/team-assets';

interface HeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedTeam: string;
  onTeamSelect: (teamCode: string) => void;
  favoriteTeam: string;
  onFavoriteTeamChange: (teamCode: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onDateChange,
  favoriteTeam,
  onFavoriteTeamChange,
}) => {
  // 날짜 동적 계산 (2026년 7월이 아닐 경우 테스트를 위해 2026-07-24를 오늘로 고정)
  let todayDate = new Date();
  const isTestTime = todayDate.getFullYear() === 2026 && todayDate.getMonth() === 6;
  if (!isTestTime) {
    todayDate = new Date('2026-07-24');
  }

  const formatYYYYMMDD = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatMMDD = (d: Date) => `${d.getMonth() + 1}.${d.getDate()}`;

  const yesterday = new Date(todayDate);
  yesterday.setDate(todayDate.getDate() - 1);
  const tomorrow = new Date(todayDate);
  tomorrow.setDate(todayDate.getDate() + 1);

  const dates = [
    { label: '어제', value: formatYYYYMMDD(yesterday) },
    { label: `오늘 ${formatMMDD(todayDate)}`, value: formatYYYYMMDD(todayDate) },
    { label: '내일', value: formatYYYYMMDD(tomorrow) },
  ];

  const favoriteLabel =
    favoriteTeam === 'NONE' ? '없음' : (TEAM_ASSETS[favoriteTeam as keyof typeof TEAM_ASSETS]?.name ?? '없음');

  // 좁은 화면에서는 헤더 두 번째 줄로 내려간다. 넣는 위치만 다르고 내용은 같다.
  const dateSwitcher = (className: string) => (
    <div className={`gap-0.5 rounded-control bg-track p-[3px] ${className}`}>
      {dates.map((d) => (
        <button
          key={d.value}
          onClick={() => onDateChange(d.value)}
          className={`flex-1 whitespace-nowrap rounded-chip px-3 py-1.5 text-[13px] transition-colors ${
            selectedDate === d.value
              ? 'bg-thumb font-semibold text-fg shadow-thumb'
              : 'font-medium text-fg2 hover:text-fg'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto max-w-shell px-4 sm:px-6 lg:px-8">
        <div className="flex h-[60px] items-center justify-between gap-4">
        <div className="flex min-w-0 shrink items-center gap-2.5">
          <BallIcon size={24} className="shrink-0 text-fg" />
          <h1 className="truncate text-[16.5px] font-bold tracking-[-0.03em] text-fg">KBO AI Brief</h1>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {dateSwitcher('hidden sm:flex')}

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

        {dateSwitcher('flex pb-2.5 sm:hidden')}
      </div>
    </header>
  );
};
