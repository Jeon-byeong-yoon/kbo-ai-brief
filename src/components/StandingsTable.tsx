'use client';

import React from 'react';
import { KBOTeamStanding } from '../types/kbo';
import { TeamBadge } from './ui/TeamBadge';
import { StarIcon } from './ui/Icons';

interface StandingsTableProps {
  standings: KBOTeamStanding[];
  selectedTeam: string;
  favoriteTeam?: string;
  onTeamSelect: (teamCode: string) => void;
  title?: string;
  subtitle?: string;
}

/** 'WWLWL' 또는 '3승 2패' 어느 쪽으로 와도 최근 전적을 승/패 칩으로 그린다. */
function RecentForm({ value }: { value: string }) {
  const letters = value?.match(/[WLD]/g);

  if (!letters?.length) {
    return <span className="text-xs text-fg2">{value || '-'}</span>;
  }

  return (
    <div className="flex justify-center gap-[3px]">
      {letters.map((ch, i) => {
        const win = ch === 'W';
        const draw = ch === 'D';
        return (
          <span
            key={`${ch}-${i}`}
            className={`flex h-[14px] w-[14px] items-center justify-center rounded-[4px] text-[9px] font-bold ${
              draw ? 'bg-surface2 text-fg3' : win ? 'bg-win-soft text-win' : 'bg-surface2 text-fg3'
            }`}
          >
            {draw ? '무' : win ? '승' : '패'}
          </span>
        );
      })}
    </div>
  );
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  selectedTeam,
  favoriteTeam,
  onTeamSelect,
  title = '2026 팀 순위',
  subtitle = '포스트시즌 진출 상위 5팀',
}) => {
  return (
    <section className="rounded-card border border-line bg-surface px-5 pb-3.5 pt-4 shadow-card">
      <div className="flex items-end justify-between gap-3 pb-3.5">
        <div>
          <h2 className="text-[15px] font-bold tracking-[-0.025em] text-fg">{title}</h2>
          <p className="mt-0.5 text-xs text-fg3">{subtitle}</p>
        </div>
        <span className="text-2xs text-fg3">전일 대비 ▲▼</span>
      </div>

      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[460px] table-fixed border-collapse">
          <colgroup>
            <col className="w-[48px]" />
            <col />
            <col className="w-[34px]" />
            <col className="w-[30px]" />
            <col className="w-[30px]" />
            <col className="w-[26px]" />
            <col className="w-[46px]" />
            <col className="w-[42px]" />
            <col className="hidden w-[88px] sm:table-column" />
            <col className="w-[50px]" />
          </colgroup>
          <thead>
            <tr className="text-2xs font-semibold tracking-[-0.01em] text-fg3">
              <th className="pb-2.5 text-center font-semibold">순위</th>
              <th className="pb-2.5 text-left font-semibold">팀</th>
              <th className="pb-2.5 text-center font-semibold">경기</th>
              <th className="pb-2.5 text-center font-semibold">승</th>
              <th className="pb-2.5 text-center font-semibold">패</th>
              <th className="pb-2.5 text-center font-semibold">무</th>
              <th className="pb-2.5 text-center font-semibold">승률</th>
              <th className="pb-2.5 text-center font-semibold">게임차</th>
              <th className="hidden pb-2.5 text-center font-semibold sm:table-cell">최근</th>
              <th className="pb-2.5 text-right font-semibold">연속</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const isSelected = selectedTeam === row.team.code;
              const isFavorite = favoriteTeam === row.team.code;
              const isPlayoffs = row.rank <= 5;
              const isWinStreak = row.streak.includes('승');

              return (
                <tr
                  key={row.team.id}
                  onClick={() => onTeamSelect(row.team.code)}
                  className={`cursor-pointer transition-colors ${
                    isFavorite ? 'bg-accent-soft' : isSelected ? 'bg-surface2' : 'hover:bg-surface2'
                  }`}
                >
                  <td className="border-t border-hair py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={`tnum min-w-[13px] text-right text-[13px] font-bold ${
                          isPlayoffs ? 'text-fg' : 'text-fg3'
                        }`}
                      >
                        {row.rank}
                      </span>
                      <span className="tnum w-[14px] text-[10px] font-bold">
                        {row.rankChange === undefined || row.rankChange === 0 ? (
                          <span className="text-fg3">·</span>
                        ) : row.rankChange > 0 ? (
                          <span className="text-live">▲{row.rankChange}</span>
                        ) : (
                          <span className="text-accent">▼{Math.abs(row.rankChange)}</span>
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="border-t border-hair py-2.5">
                    <div className="flex min-w-0 items-center gap-[7px] pr-2">
                      <TeamBadge
                        team={row.team.code}
                        fallbackLabel={row.team.shortName}
                        size={26}
                        radius={8}
                      />
                      <span
                        className={`truncate text-[12.5px] tracking-[-0.025em] text-fg ${
                          isFavorite ? 'font-bold' : 'font-medium'
                        }`}
                      >
                        {row.team.name}
                      </span>
                      {isFavorite && <StarIcon size={10} className="shrink-0 text-accent" />}
                    </div>
                  </td>

                  <td className="tnum border-t border-hair py-2.5 text-center text-[12.5px] text-fg3">
                    {row.gamesPlayed}
                  </td>
                  <td className="tnum border-t border-hair py-2.5 text-center text-[12.5px] font-semibold text-fg">
                    {row.wins}
                  </td>
                  <td className="tnum border-t border-hair py-2.5 text-center text-[12.5px] text-fg2">
                    {row.losses}
                  </td>
                  <td className="tnum border-t border-hair py-2.5 text-center text-[12.5px] text-fg3">
                    {row.draws}
                  </td>
                  <td className="tnum border-t border-hair py-2.5 text-center text-[13px] font-bold tracking-[-0.02em] text-fg">
                    {row.winRate.toFixed(3).replace(/^0/, '')}
                  </td>
                  <td className="tnum border-t border-hair py-2.5 text-center text-[12.5px] text-fg2">
                    {row.gameBehind === 0 ? '-' : row.gameBehind.toFixed(1)}
                  </td>
                  <td className="hidden border-t border-hair py-2.5 sm:table-cell">
                    <RecentForm value={row.recent10} />
                  </td>
                  <td className="border-t border-hair py-2.5 text-right">
                    <span
                      className={`inline-block rounded-md px-1.5 py-0.5 text-2xs font-semibold ${
                        isWinStreak ? 'bg-win-soft text-win' : 'bg-lose-soft text-lose'
                      }`}
                    >
                      {row.streak}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
