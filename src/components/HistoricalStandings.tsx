'use client';

import React from 'react';
import { HistoricalSeason } from '../types/kbo';
import { TeamBadge } from './ui/TeamBadge';

interface HistoricalStandingsProps {
  season: HistoricalSeason;
  selectedTeam: string;
  onTeamSelect: (teamCode: string) => void;
}

export const HistoricalStandings: React.FC<HistoricalStandingsProps> = ({
  season,
  selectedTeam,
  onTeamSelect,
}) => {
  const th = 'pb-2.5 text-center text-2xs font-semibold text-fg3';

  return (
    <section className="rounded-card border border-line bg-surface px-5 pb-3.5 pt-4 shadow-card">
      <div className="flex items-end justify-between gap-3 pb-3.5">
        <div>
          <h2 className="text-[15px] font-bold tracking-[-0.025em] text-fg">{season.year} 시즌 최종 순위</h2>
          <p className="mt-0.5 text-xs text-fg3">전년도 성적 복기</p>
        </div>
        <span className="rounded-md bg-accent-soft px-2 py-1 text-2xs font-semibold text-accent">
          우승 {season.champion}
        </span>
      </div>

      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[470px] table-fixed border-collapse">
          <colgroup>
            <col className="w-[38px]" />
            <col />
            <col className="w-[36px]" />
            <col className="w-[32px]" />
            <col className="w-[32px]" />
            <col className="w-[28px]" />
            <col className="w-[48px]" />
            <col className="w-[116px]" />
          </colgroup>
          <thead>
            <tr>
              <th className={th}>순위</th>
              <th className={`${th} text-left`}>팀</th>
              <th className={th}>경기</th>
              <th className={th}>승</th>
              <th className={th}>패</th>
              <th className={th}>무</th>
              <th className={th}>승률</th>
              <th className={`${th} text-right`}>포스트시즌</th>
            </tr>
          </thead>
          <tbody>
            {season.teams.map((row) => {
              const isSelected = selectedTeam === row.code;
              const isChampion = row.rank === 1;

              return (
                <tr
                  key={row.code}
                  onClick={() => onTeamSelect(row.code)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-surface2' : 'hover:bg-surface2'
                  }`}
                >
                  <td className="tnum border-t border-hair py-2.5 text-center">
                    <span
                      className={`text-[13px] font-bold ${row.rank <= 5 ? 'text-fg' : 'text-fg3'}`}
                    >
                      {row.rank}
                    </span>
                  </td>
                  <td className="border-t border-hair py-2.5">
                    <div className="flex min-w-0 items-center gap-[7px] pr-2">
                      <TeamBadge team={row.code} fallbackLabel={row.name} size={26} radius={8} />
                      <span className="truncate text-[12.5px] font-medium tracking-[-0.025em] text-fg">
                        {row.name}
                      </span>
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
                  <td className="border-t border-hair py-2.5 text-right">
                    <span
                      className={`inline-block whitespace-nowrap rounded-md px-1.5 py-0.5 text-2xs font-semibold ${
                        isChampion ? 'bg-accent-soft text-accent' : 'text-fg2'
                      }`}
                    >
                      {row.postseasonResult}
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
