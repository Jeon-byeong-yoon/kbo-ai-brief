'use client';

import React, { useState } from 'react';
import { PitcherLeader, BatterLeader } from '../types/kbo';
import { TeamBadge } from './ui/TeamBadge';

interface PlayerLeaderboardProps {
  pitcherLeaders: PitcherLeader[];
  batterLeaders: BatterLeader[];
}

const th = 'pb-2.5 text-center text-2xs font-semibold text-fg3';
const td = 'tnum border-t border-hair py-2.5 text-center text-[12.5px]';

export const PlayerLeaderboard: React.FC<PlayerLeaderboardProps> = ({
  pitcherLeaders,
  batterLeaders,
}) => {
  const [activeCategory, setActiveCategory] = useState<'PITCHER' | 'BATTER'>('PITCHER');
  const [visibleCounts, setVisibleCounts] = useState({ PITCHER: 5, BATTER: 5 });
  const visibleCount = visibleCounts[activeCategory];
  const nextCount = visibleCount < 10 ? 10 : visibleCount < 20 ? 20 : 50;
  const activePlayers = activeCategory === 'PITCHER' ? pitcherLeaders : batterLeaders;
  const canExpand = visibleCount < Math.min(50, activePlayers.length);

  const showMore = () => {
    setVisibleCounts((current) => ({
      ...current,
      [activeCategory]: Math.min(nextCount, activePlayers.length, 50),
    }));
  };

  const tab = (value: 'PITCHER' | 'BATTER', label: string) => (
    <button
      onClick={() => setActiveCategory(value)}
      className={`rounded-chip px-3 py-1.5 text-[12.5px] transition-colors ${
        activeCategory === value
          ? 'bg-thumb font-semibold text-fg shadow-thumb'
          : 'font-medium text-fg2 hover:text-fg'
      }`}
    >
      {label}
    </button>
  );

  const rank = (n: number) => (
    <span className={`tnum text-[13px] font-bold ${n <= 3 ? 'text-fg' : 'text-fg3'}`}>{n}</span>
  );

  return (
    <section className="rounded-card border border-line bg-surface px-5 pb-4 pt-4 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-3 pb-3.5">
        <div>
          <h2 className="text-[15px] font-bold tracking-[-0.025em] text-fg">2026 선수 랭킹</h2>
          <p className="mt-0.5 text-xs text-fg3">7월 23일 경기 결과 반영 · 네이버 스포츠 기준</p>
        </div>
        <div className="flex gap-0.5 rounded-control bg-track p-[3px]">
          {tab('PITCHER', '투수')}
          {tab('BATTER', '타자')}
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto px-1">
        {activeCategory === 'PITCHER' ? (
          <table className="w-full min-w-[440px] table-fixed border-collapse">
            <colgroup>
              <col className="w-[36px]" />
              <col />
              <col className="w-[50px]" />
              <col className="w-[86px]" />
              <col className="w-[48px]" />
              <col className="w-[44px]" />
              <col className="w-[48px]" />
            </colgroup>
            <thead>
              <tr>
                <th className={th}>순위</th>
                <th className={`${th} text-left`}>선수</th>
                <th className={th}>ERA</th>
                <th className={th}>승/패/세</th>
                <th className={th}>WHIP</th>
                <th className={th}>삼진</th>
                <th className={th}>WAR</th>
              </tr>
            </thead>
            <tbody>
              {pitcherLeaders.slice(0, visibleCounts.PITCHER).map((p) => (
                <tr key={p.rank} className="transition-colors hover:bg-surface2">
                  <td className={`${td} text-fg3`}>{rank(p.rank)}</td>
                  <td className="border-t border-hair py-2.5">
                    <div className="flex min-w-0 items-center gap-2 pr-2">
                      <TeamBadge team={p.team} fallbackLabel={p.team} size={24} radius={7} />
                      <span className="truncate text-[13px] font-semibold tracking-[-0.02em] text-fg">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className={`${td} font-bold text-fg`}>{p.era.toFixed(2)}</td>
                  <td className={`${td} text-fg2`}>
                    {p.wins}승 {p.losses}패 {p.saves}세
                  </td>
                  <td className={`${td} text-fg2`}>{p.whip.toFixed(2)}</td>
                  <td className={`${td} text-fg2`}>{p.strikeouts}</td>
                  <td className={`${td} font-bold text-accent`}>{p.war.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[440px] table-fixed border-collapse">
            <colgroup>
              <col className="w-[36px]" />
              <col />
              <col className="w-[50px]" />
              <col className="w-[48px]" />
              <col className="w-[52px]" />
              <col className="w-[52px]" />
              <col className="w-[48px]" />
            </colgroup>
            <thead>
              <tr>
                <th className={th}>순위</th>
                <th className={`${th} text-left`}>선수</th>
                <th className={th}>타율</th>
                <th className={th}>홈런</th>
                <th className={th}>타점</th>
                <th className={th}>OPS</th>
                <th className={th}>WAR</th>
              </tr>
            </thead>
            <tbody>
              {batterLeaders.slice(0, visibleCounts.BATTER).map((b) => (
                <tr key={b.rank} className="transition-colors hover:bg-surface2">
                  <td className={`${td} text-fg3`}>{rank(b.rank)}</td>
                  <td className="border-t border-hair py-2.5">
                    <div className="flex min-w-0 items-center gap-2 pr-2">
                      <TeamBadge team={b.team} fallbackLabel={b.team} size={24} radius={7} />
                      <span className="truncate text-[13px] font-semibold tracking-[-0.02em] text-fg">
                        {b.name}
                      </span>
                    </div>
                  </td>
                  <td className={`${td} font-bold text-fg`}>{b.avg.toFixed(3).replace(/^0/, '')}</td>
                  <td className={`${td} text-fg2`}>{b.homeRuns}</td>
                  <td className={`${td} text-fg2`}>{b.rbi}</td>
                  <td className={`${td} font-semibold text-fg`}>{b.ops.toFixed(3)}</td>
                  <td className={`${td} font-bold text-accent`}>{b.war.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {canExpand && (
        <button
          type="button"
          onClick={showMore}
          className="mt-3.5 w-full rounded-control border border-line py-2.5 text-[12.5px] font-semibold text-fg2 transition-colors hover:bg-surface2 hover:text-fg"
        >
          Top {nextCount}까지 보기
        </button>
      )}
    </section>
  );
};
