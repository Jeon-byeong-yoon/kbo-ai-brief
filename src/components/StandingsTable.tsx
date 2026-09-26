'use client';

import React from 'react';
import Link from 'next/link';
import { KBOTeamStanding } from '../types/kbo';
import { TeamBadge } from './ui/TeamBadge';
import { StarIcon } from './ui/Icons';
import { RecentForm } from './ui/RecentForm';

/**
 * 매직넘버 한 칸.
 *  - 0 이면 확정
 *  - null 이면 산술적으로 불가능 (1위 경쟁에서 밀렸거나 포스트시즌 탈락)
 *  - 그 밖에는 "내 승 + 경쟁팀 패" 가 몇 번 더 필요한지
 */
const MagicCell: React.FC<{ value: number | null | undefined; eliminatedLabel: string; title: string }> = ({
  value,
  eliminatedLabel,
  title,
}) => {
  const base = 'tnum border-t border-hair py-2.5 text-center text-[12.5px]';
  if (value === undefined) return <td className={`${base} text-fg3`}>·</td>;
  if (value === 0)
    return (
      <td className={`${base} hidden sm:table-cell`} title={`${title} 확정`}>
        <span className="rounded-md bg-win-soft px-1.5 py-0.5 text-2xs font-semibold text-win">확정</span>
      </td>
    );
  if (value === null)
    return (
      <td className={`${base} hidden text-fg3 sm:table-cell`} title={`${title} 불가`}>
        {eliminatedLabel}
      </td>
    );
  return (
    <td className={`${base} hidden font-semibold text-fg2 sm:table-cell`} title={`${title}까지 ${value}`}>
      {value}
    </td>
  );
};

interface StandingsTableProps {
  standings: KBOTeamStanding[];
  selectedTeam: string;
  favoriteTeam?: string;
  onTeamSelect: (teamCode: string) => void;
  title?: string;
  subtitle?: string;
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
            <col className="hidden w-[44px] sm:table-column" />
            <col className="hidden w-[44px] sm:table-column" />
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
              <th className="hidden pb-2.5 text-center font-semibold sm:table-cell" title="정규시즌 1위 매직넘버">
                1위
              </th>
              <th className="hidden pb-2.5 text-center font-semibold sm:table-cell" title="포스트시즌 진출 매직넘버">
                PS
              </th>
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
                      <Link
                        href={`/teams/${row.team.code}`}
                        onClick={(e) => e.stopPropagation()}
                        className={`truncate text-[12.5px] tracking-[-0.025em] text-fg hover:text-accent hover:underline ${
                          isFavorite ? 'font-bold' : 'font-medium'
                        }`}
                      >
                        {row.team.name}
                      </Link>
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
                  <MagicCell value={row.magic?.pennant} eliminatedLabel="—" title="정규 1위" />
                  <MagicCell value={row.magic?.playoff} eliminatedLabel="탈락" title="포스트시즌 진출" />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="hidden pt-2 text-2xs leading-relaxed text-fg3 sm:block">
        1위 · PS 는 매직넘버입니다. 내 승리와 경쟁팀 패배를 합쳐 그만큼 더 쌓이면
        정규시즌 1위 또는 포스트시즌 진출이 확정됩니다. 남은 경기는 아직 편성되지 않은
        순연 경기까지 포함해 144경기 기준으로 셉니다.
      </p>
    </section>
  );
};
