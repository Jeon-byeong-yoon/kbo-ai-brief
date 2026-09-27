'use client';

import React from 'react';
import { LiveGameState } from '@/types/live';

/**
 * 주자 상황 다이아몬드. 1·2·3루에 주자가 있으면 채운다.
 * 각 베이스는 해당 좌표를 중심으로 45도 돌린 정사각형이다.
 */
const BaseDiamond: React.FC<{ runners: LiveGameState['runners']; size?: number }> = ({
  runners,
  size = 48,
}) => {
  const BASES: Array<{ key: keyof LiveGameState['runners']; cx: number; cy: number }> = [
    { key: 'second', cx: 24, cy: 12 },
    { key: 'third', cx: 12, cy: 24 },
    { key: 'first', cx: 36, cy: 24 },
  ];
  const side = 13;

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="주자 상황" role="img">
      {BASES.map(({ key, cx, cy }) => (
        <rect
          key={key}
          x={cx - side / 2}
          y={cy - side / 2}
          width={side}
          height={side}
          rx={1.5}
          transform={`rotate(45 ${cx} ${cy})`}
          className={runners[key] ? 'fill-accent stroke-accent' : 'fill-none stroke-fg3'}
          strokeWidth={1.4}
        />
      ))}
      {/* 홈플레이트 */}
      <path d="M24 38.5 L27.5 35.5 L27.5 32 L20.5 32 L20.5 35.5 Z" className="fill-fg3" />
    </svg>
  );
};

const Dots: React.FC<{ label: string; count: number; total: number; tone: string }> = ({
  label,
  count,
  total,
  tone,
}) => (
  <div className="flex items-center gap-1.5">
    <span className="w-[10px] text-[10px] font-bold text-fg3">{label}</span>
    <div className="flex gap-[3px]">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-[7px] w-[7px] rounded-full ${i < count ? tone : 'bg-line'}`}
        />
      ))}
    </div>
  </div>
);

/** 볼카운트 B/S/O + 주자. 네이버 중계 화면의 좌측 패널에 해당한다. */
export const LiveCount: React.FC<{ live: LiveGameState }> = ({ live }) => (
  <div className="flex items-center gap-4">
    <BaseDiamond runners={live.runners} />
    <div className="flex flex-col gap-[5px]">
      <Dots label="B" count={live.count.balls} total={3} tone="bg-win" />
      <Dots label="S" count={live.count.strikes} total={2} tone="bg-[#E9A23B]" />
      <Dots label="O" count={live.count.outs} total={2} tone="bg-live" />
    </div>
  </div>
);

export const LiveMatchup: React.FC<{ live: LiveGameState }> = ({ live }) => {
  const { pitcher, batter } = live;
  if (!pitcher && !batter) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {pitcher && (
          <div className="rounded-control bg-surface2 px-3.5 py-3">
            <div className="flex items-baseline gap-1.5">
              <span className="rounded bg-live-soft px-1.5 py-0.5 text-[10px] font-bold text-live">투</span>
              <span className="truncate text-[14px] font-bold tracking-[-0.02em] text-fg">
                {pitcher.name}
              </span>
              <span className="tnum text-2xs text-fg3">#{pitcher.backNumber}</span>
            </div>
            <p className="tnum mt-1.5 text-xs text-fg2">
              {pitcher.innings}이닝 · {pitcher.strikeouts}K · 자책 {pitcher.earnedRuns}
            </p>
            <p className="tnum text-2xs text-fg3">
              투구수 {pitcher.pitchCount} · 시즌 ERA {pitcher.seasonEra}
            </p>
          </div>
        )}

        {batter && (
          <div className="rounded-control bg-surface2 px-3.5 py-3">
            <div className="flex items-baseline gap-1.5">
              <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent">타</span>
              <span className="truncate text-[14px] font-bold tracking-[-0.02em] text-fg">
                {batter.name}
              </span>
              <span className="tnum text-2xs text-fg3">
                {batter.batOrder}번 · {batter.position}
              </span>
            </div>
            <p className="tnum mt-1.5 text-xs text-fg2">
              오늘 {batter.atBats}타수 {batter.hits}안타 {batter.rbi}타점
            </p>
            <p className="tnum text-2xs text-fg3">
              시즌 {batter.seasonAvg.toFixed(3).replace(/^0/, '')}
              {batter.vsAvg ? ` · 상대 ${batter.vsAvg.replace(/^0/, '')}` : ''}
            </p>
          </div>
        )}
      </div>

      {(live.matchup || live.onDeck.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-2xs text-fg3">
          {live.matchup && <span>통산 맞대결 {live.matchup}</span>}
          {live.onDeck.length > 0 && <span>대기타석 {live.onDeck.join(' · ')}</span>}
        </div>
      )}
    </div>
  );
};

/** 네이버가 계산한 실시간 승리 확률 막대 */
export const LiveWinRate: React.FC<{
  live: LiveGameState;
  awayName: string;
  homeName: string;
}> = ({ live, awayName, homeName }) => {
  if (!live.winRate) return null;
  const { away, home } = live.winRate;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-2xs">
        <span className="font-semibold text-fg2">
          {awayName} <span className="tnum text-fg">{away.toFixed(1)}%</span>
        </span>
        <span className="text-fg3">실시간 승리 확률</span>
        <span className="font-semibold text-fg2">
          <span className="tnum text-fg">{home.toFixed(1)}%</span> {homeName}
        </span>
      </div>
      <div className="flex h-[6px] overflow-hidden rounded-full bg-line">
        <span className="bg-fg3" style={{ width: `${away}%` }} />
        <span className="bg-accent" style={{ width: `${home}%` }} />
      </div>
    </div>
  );
};
