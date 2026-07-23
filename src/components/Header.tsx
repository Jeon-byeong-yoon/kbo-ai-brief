'use client';

import React from 'react';

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
  selectedTeam,
  onTeamSelect,
  favoriteTeam,
  onFavoriteTeamChange,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 shadow-lg shadow-rose-500/20">
              <span className="text-xl">⚾</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white">
                  KBO <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400">AI BRIEF</span>
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI 관전 포인트 & 실시간 KBO 브리핑
              </p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-sm text-slate-300 shadow-inner">
              <button
                onClick={() => onDateChange('2026-07-22')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedDate === '2026-07-22'
                    ? 'bg-slate-800 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                어제
              </button>
              <button
                onClick={() => onDateChange('2026-07-23')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedDate === '2026-07-23'
                    ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                오늘 (07.23)
              </button>
              <button
                onClick={() => onDateChange('2026-07-24')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedDate === '2026-07-24'
                    ? 'bg-slate-800 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                내일
              </button>
            </div>

            {/* Favorite Team Selector (⭐ MY TEAM Pinning) */}
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-amber-400 font-bold shrink-0">⭐ MY 팀:</span>
              <select
                value={favoriteTeam}
                onChange={(e) => onFavoriteTeamChange(e.target.value)}
                className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="NONE" className="bg-slate-900 text-slate-300">없음</option>
                <option value="LG" className="bg-slate-900 text-rose-400">LG 트윈스</option>
                <option value="HANWHA" className="bg-slate-900 text-orange-400">한화 이글스</option>
                <option value="KIA" className="bg-slate-900 text-red-400">KIA 타이거즈</option>
                <option value="SAMSUNG" className="bg-slate-900 text-blue-400">삼성 라이온즈</option>
                <option value="DOOSAN" className="bg-slate-900 text-sky-400">두산 베어스</option>
                <option value="KT" className="bg-slate-900 text-zinc-300">KT 위즈</option>
                <option value="SSG" className="bg-slate-900 text-emerald-400">SSG 랜더스</option>
                <option value="LOTTE" className="bg-slate-900 text-indigo-400">롯데 자이언츠</option>
                <option value="NC" className="bg-slate-900 text-cyan-400">NC 다이노스</option>
                <option value="KIWOOM" className="bg-slate-900 text-fuchsia-400">키움 히어로즈</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
