'use client';

import React from 'react';
import Link from 'next/link';
import { KBOGame } from '../types/kbo';
import { TeamBadge } from './ui/TeamBadge';
import { ArrowRightIcon, SparkIcon, StarIcon } from './ui/Icons';

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

  const isMyTeam =
    !!favoriteTeam &&
    favoriteTeam !== 'NONE' &&
    (game.awayTeam.code === favoriteTeam || game.homeTeam.code === favoriteTeam);

  const headline = isScheduled ? game.aiPreview?.headline : game.aiReview?.headline;

  // 중계 채널이 여러 개면 'KBS N SPORTS^SBS SPORTS' 처럼 ^ 로 붙어서 온다.
  const broadcast = game.broadcast?.split('^').filter(Boolean).join(' · ');

  return (
    <article
      className={`rounded-card border bg-surface px-5 pb-4 pt-4 shadow-card transition-colors ${
        isMyTeam ? 'border-accent ring-1 ring-inset ring-accent' : 'border-line hover:border-fg3/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-1.5 text-[12.5px]">
          {isMyTeam && (
            <span className="mr-0.5 flex items-center gap-[3px] rounded-md bg-accent-soft px-1.5 py-0.5 text-[10.5px] font-bold text-accent">
              <StarIcon size={10} />
              MY
            </span>
          )}
          <span className="font-semibold tracking-[-0.01em] text-fg">{game.stadium}</span>
          <span className="text-fg3">·</span>
          <span className="truncate text-xs text-fg3">{broadcast || game.time}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5 rounded-chip bg-live-soft px-2 py-1 text-2xs font-semibold text-live">
              <span className="h-[5px] w-[5px] rounded-full bg-live" />
              {game.currentInning || 'LIVE'}
            </span>
          )}
          {isFinished && (
            <span className="rounded-chip bg-surface2 px-2 py-1 text-2xs font-semibold text-fg2">종료</span>
          )}
          {isScheduled && (
            <span className="rounded-chip bg-surface2 px-2 py-1 text-2xs font-semibold text-fg2">경기 예정</span>
          )}
          <Link
            href={`/games/${game.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-fg2 transition-colors hover:text-fg"
          >
            상세
            <ArrowRightIcon className="text-fg3" />
          </Link>
        </div>
      </div>

      <Link href={`/games/${game.id}`} className="mt-3.5 grid grid-cols-[1fr_78px_1fr] items-center gap-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <TeamBadge team={game.awayTeam.code} fallbackLabel={game.awayTeam.shortName} />
          <div className="min-w-0">
            <div
              className={`truncate text-[14.5px] tracking-[-0.02em] ${
                isAwayWinner ? 'font-bold text-fg' : 'font-semibold text-fg'
              }`}
            >
              {game.awayTeam.name}
            </div>
            <div className="truncate text-xs text-fg3">선발 {game.awayPitcher}</div>
          </div>
        </div>

        <div className="text-center">
          {isScheduled ? (
            <span className="tnum text-[19px] font-bold tracking-[-0.03em] text-fg">{game.time}</span>
          ) : (
            <span className="tnum text-[21px] font-bold tracking-[-0.03em]">
              <span className={isAwayWinner ? 'text-fg' : 'text-fg3'}>{game.awayScore}</span>
              <span className="mx-1 text-[15px] font-normal text-fg3">:</span>
              <span className={isHomeWinner ? 'text-fg' : 'text-fg3'}>{game.homeScore}</span>
            </span>
          )}
        </div>

        <div className="flex min-w-0 items-center justify-end gap-3">
          <div className="min-w-0 text-right">
            <div
              className={`truncate text-[14.5px] tracking-[-0.02em] ${
                isHomeWinner ? 'font-bold text-fg' : 'font-semibold text-fg'
              }`}
            >
              {game.homeTeam.name}
            </div>
            <div className="truncate text-xs text-fg3">선발 {game.homePitcher}</div>
          </div>
          <TeamBadge team={game.homeTeam.code} fallbackLabel={game.homeTeam.shortName} />
        </div>
      </Link>

      {(headline || game.aiPreview || game.aiReview) && (
        <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-hair pt-3">
          <p className="min-w-0 flex-1 truncate text-[12.5px] tracking-[-0.01em] text-fg2">{headline}</p>
          <div className="flex shrink-0 items-center gap-2">
            {game.aiPreview && (
              <button
                onClick={() => onOpenBriefing(game, 'PREVIEW')}
                className="flex items-center gap-1.5 rounded-[9px] bg-accent-soft px-3 py-1.5 text-[12.5px] font-semibold text-accent transition-opacity hover:opacity-80"
              >
                <SparkIcon size={13} />
                AI 프리뷰
              </button>
            )}
            {game.aiReview && (
              <button
                onClick={() => onOpenBriefing(game, 'REVIEW')}
                className="flex items-center gap-1.5 rounded-[9px] bg-accent-soft px-3 py-1.5 text-[12.5px] font-semibold text-accent transition-opacity hover:opacity-80"
              >
                <SparkIcon size={13} />
                AI 요약
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
