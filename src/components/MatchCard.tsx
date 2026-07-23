'use client';

import React from 'react';
import Link from 'next/link';
import { KBOGame } from '../types/kbo';

interface MatchCardProps {
  game: KBOGame;
  favoriteTeam?: string;
  onOpenBriefing: (game: KBOGame, type: 'PREVIEW' | 'REVIEW') => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ game, favoriteTeam, onOpenBriefing }) => {
  const isLive = game.status === 'IN_PROGRESS';
  const isFinished = game.status === 'FINISHED';
  const isScheduled = game.status === 'SCHEDULED';

  const isHomeWinner = isFinished && game.homeScore > game.awayScore;
  const isAwayWinner = isFinished && game.awayScore > game.homeScore;

  // 관심 구단 경기 여부
  const isMyTeam = favoriteTeam && favoriteTeam !== 'NONE' && (
    game.awayTeam.code === favoriteTeam || game.homeTeam.code === favoriteTeam
  );

  return (
    <div
      className={`group relative rounded-2xl p-5 transition-all duration-300 shadow-lg hover:shadow-xl ${
        isMyTeam
          ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/40 border-2 border-amber-500/60 shadow-amber-500/10'
          : 'bg-slate-900/90 backdrop-blur-md border border-slate-800/80 hover:border-slate-700 hover:shadow-indigo-500/5'
      }`}
    >
      {/* My Team Pinning Ribbon */}
      {isMyTeam && (
        <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-md flex items-center gap-1">
          <span>⭐ MY TEAM 핀 고정</span>
        </div>
      )}

      {/* Top Bar: Stadium, Time, Status Badge */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">{game.stadium}</span>
          <span className="text-slate-600">•</span>
          <span>{game.time}</span>
          {game.broadcast && (
            <>
              <span className="text-slate-600">•</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                {game.broadcast}
              </span>
            </>
          )}
        </div>

        {/* Status Indicator & Detail Link */}
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {game.currentInning || 'LIVE'}
            </span>
          )}
          {isFinished && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
              종료
            </span>
          )}
          {isScheduled && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              경기 예정
            </span>
          )}

          <Link
            href={`/games/${game.id}`}
            className="text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-0.5 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800"
          >
            <span>상세점수</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Match Up Info (Away vs Home) */}
      <Link href={`/games/${game.id}`} className="block group-hover:opacity-95 transition-opacity">
        <div className="grid grid-cols-7 items-center gap-2 mb-4">
          {/* Away Team */}
          <div className="col-span-3 flex items-center justify-between pr-2">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${game.awayTeam.logoBg}`}
              >
                {game.awayTeam.shortName}
              </div>
              <div>
                <div
                  className={`font-bold text-sm flex items-center gap-1 ${
                    isAwayWinner ? 'text-white font-extrabold' : 'text-slate-200'
                  }`}
                >
                  <span>{game.awayTeam.name}</span>
                  {favoriteTeam === game.awayTeam.code && (
                    <span className="text-amber-400 text-xs">⭐</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  선발 {game.awayPitcher}
                </div>
              </div>
            </div>
          </div>

          {/* Score & VS */}
          <div className="col-span-1 text-center">
            {isScheduled ? (
              <span className="text-xs font-bold text-slate-500 bg-slate-800/80 px-2 py-1 rounded-md">
                VS
              </span>
            ) : (
              <div className="flex items-center justify-center gap-1.5 font-black text-xl tracking-tight">
                <span className={isAwayWinner ? 'text-rose-400' : 'text-slate-300'}>
                  {game.awayScore}
                </span>
                <span className="text-slate-600 text-sm font-normal">:</span>
                <span className={isHomeWinner ? 'text-rose-400' : 'text-slate-300'}>
                  {game.homeScore}
                </span>
              </div>
            )}
          </div>

          {/* Home Team */}
          <div className="col-span-3 flex items-center justify-end pl-2">
            <div className="flex items-center gap-3 text-right">
              <div>
                <div
                  className={`font-bold text-sm flex items-center justify-end gap-1 ${
                    isHomeWinner ? 'text-white font-extrabold' : 'text-slate-200'
                  }`}
                >
                  {favoriteTeam === game.homeTeam.code && (
                    <span className="text-amber-400 text-xs">⭐</span>
                  )}
                  <span>{game.homeTeam.name}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  선발 {game.homePitcher}
                </div>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${game.homeTeam.logoBg}`}
              >
                {game.homeTeam.shortName}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* AI Briefing Button / Trigger */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div className="text-xs text-slate-400 truncate flex-1">
          {isFinished && game.aiReview && (
            <span className="text-slate-300 line-clamp-1">
              🤖 {game.aiReview.headline}
            </span>
          )}
          {isLive && game.aiReview && (
            <span className="text-slate-300 line-clamp-1">
              ⚡ {game.aiReview.headline}
            </span>
          )}
          {isScheduled && game.aiPreview && (
            <span className="text-slate-300 line-clamp-1">
              🔮 {game.aiPreview.headline}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {game.aiPreview && (
            <button
              onClick={() => onOpenBriefing(game, 'PREVIEW')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all flex items-center gap-1"
            >
              <span>🔮 AI 프리뷰</span>
            </button>
          )}
          {game.aiReview && (
            <button
              onClick={() => onOpenBriefing(game, 'REVIEW')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-1"
            >
              <span>📊 AI 요약</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
