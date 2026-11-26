'use client';

import React from 'react';
import Link from 'next/link';
import { SeasonHitterRecord, SeasonPitcherRecord, SeasonRecords } from '@/types/season';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { TEAM_ASSETS } from '@/lib/team-assets';
import { POSTSEASON_BY_YEAR } from '@/lib/postseason-2026';

export interface TitleHolderItem {
  category: string;
  group: '타격 타이틀' | '투구 타이틀';
  playerName: string;
  playerId: string;
  team: string;
  valueLabel: string;
  subLabel: string;
}

const rate = (n: number) => n.toFixed(3).replace(/^0/, '');

export function computeSeasonTitleHolders(
  hitters: SeasonHitterRecord[],
  pitchers: SeasonPitcherRecord[],
): TitleHolderItem[] {
  const out: TitleHolderItem[] = [];

  if (hitters.length > 0) {
    const byAvg = [...hitters].sort((a, b) => b.avg - a.avg || b.hits - a.hits)[0];
    const byHr = [...hitters].sort((a, b) => b.homeRuns - a.homeRuns || b.ops - a.ops)[0];
    const byRbi = [...hitters].sort((a, b) => b.rbi - a.rbi || b.ops - a.ops)[0];
    const bySteals = [...hitters].sort((a, b) => b.steals - a.steals || b.avg - a.avg)[0];
    const byHitWar = [...hitters].sort((a, b) => b.war - a.war || b.ops - a.ops)[0];

    out.push(
      {
        category: '타율 1위',
        group: '타격 타이틀',
        playerName: byAvg.name,
        playerId: byAvg.playerId,
        team: byAvg.team,
        valueLabel: rate(byAvg.avg),
        subLabel: `${byAvg.hits}안타 · OPS ${rate(byAvg.ops)}`,
      },
      {
        category: '홈런 1위',
        group: '타격 타이틀',
        playerName: byHr.name,
        playerId: byHr.playerId,
        team: byHr.team,
        valueLabel: `${byHr.homeRuns}홈런`,
        subLabel: `${byHr.rbi}타점 · 장타율 ${rate(byHr.slg)}`,
      },
      {
        category: '타점 1위',
        group: '타격 타이틀',
        playerName: byRbi.name,
        playerId: byRbi.playerId,
        team: byRbi.team,
        valueLabel: `${byRbi.rbi}타점`,
        subLabel: `타율 ${rate(byRbi.avg)} · ${byRbi.homeRuns}홈런`,
      },
      {
        category: '도루 1위',
        group: '타격 타이틀',
        playerName: bySteals.name,
        playerId: bySteals.playerId,
        team: bySteals.team,
        valueLabel: `${bySteals.steals}도루`,
        subLabel: `${bySteals.games}경기 · 출루율 ${rate(bySteals.obp)}`,
      },
    );

    if (byHitWar && byHitWar.war > 0) {
      out.push({
        category: '타자 WAR 1위',
        group: '타격 타이틀',
        playerName: byHitWar.name,
        playerId: byHitWar.playerId,
        team: byHitWar.team,
        valueLabel: `WAR ${byHitWar.war.toFixed(2)}`,
        subLabel: `OPS ${rate(byHitWar.ops)} · ${byHitWar.homeRuns}홈런`,
      });
    } else {
      const byOps = [...hitters].sort((a, b) => b.ops - a.ops)[0];
      out.push({
        category: 'OPS 1위',
        group: '타격 타이틀',
        playerName: byOps.name,
        playerId: byOps.playerId,
        team: byOps.team,
        valueLabel: `OPS ${rate(byOps.ops)}`,
        subLabel: `출루율 ${rate(byOps.obp)} · 장타율 ${rate(byOps.slg)}`,
      });
    }
  }

  if (pitchers.length > 0) {
    const byEra = [...pitchers].sort((a, b) => a.era - b.era || a.whip - b.whip)[0];
    const byWins = [...pitchers].sort((a, b) => b.wins - a.wins || a.era - b.era)[0];
    const byK = [...pitchers].sort((a, b) => b.strikeouts - a.strikeouts || a.era - b.era)[0];
    const bySaves = [...pitchers].sort((a, b) => b.saves - a.saves || a.era - b.era)[0];
    const byPitWar = [...pitchers].sort((a, b) => b.war - a.war || a.era - b.era)[0];

    out.push(
      {
        category: '평균자책 1위',
        group: '투구 타이틀',
        playerName: byEra.name,
        playerId: byEra.playerId,
        team: byEra.team,
        valueLabel: `ERA ${byEra.era.toFixed(2)}`,
        subLabel: `${byEra.innings}이닝 · WHIP ${byEra.whip.toFixed(2)}`,
      },
      {
        category: '다승 1위',
        group: '투구 타이틀',
        playerName: byWins.name,
        playerId: byWins.playerId,
        team: byWins.team,
        valueLabel: `${byWins.wins}승`,
        subLabel: `${byWins.losses}패 · ERA ${byWins.era.toFixed(2)}`,
      },
      {
        category: '탈삼진 1위',
        group: '투구 타이틀',
        playerName: byK.name,
        playerId: byK.playerId,
        team: byK.team,
        valueLabel: `${byK.strikeouts}K`,
        subLabel: `${byK.innings}이닝 · ERA ${byK.era.toFixed(2)}`,
      },
      {
        category: '세이브 1위',
        group: '투구 타이틀',
        playerName: bySaves.name,
        playerId: bySaves.playerId,
        team: bySaves.team,
        valueLabel: `${bySaves.saves}세이브`,
        subLabel: `${bySaves.games}경기 · ERA ${bySaves.era.toFixed(2)}`,
      },
    );

    if (byPitWar && byPitWar.war > 0) {
      out.push({
        category: '투수 WAR 1위',
        group: '투구 타이틀',
        playerName: byPitWar.name,
        playerId: byPitWar.playerId,
        team: byPitWar.team,
        valueLabel: `WAR ${byPitWar.war.toFixed(2)}`,
        subLabel: `${byPitWar.wins}승 ${byPitWar.losses}패 · ERA ${byPitWar.era.toFixed(2)}`,
      });
    } else {
      const byWhip = [...pitchers].sort((a, b) => a.whip - b.whip || a.era - b.era)[0];
      out.push({
        category: 'WHIP 1위',
        group: '투구 타이틀',
        playerName: byWhip.name,
        playerId: byWhip.playerId,
        team: byWhip.team,
        valueLabel: `WHIP ${byWhip.whip.toFixed(2)}`,
        subLabel: `ERA ${byWhip.era.toFixed(2)} · ${byWhip.innings}이닝`,
      });
    }
  }

  return out;
}

export const SeasonTitleHolders: React.FC<{ records: SeasonRecords }> = ({ records }) => {
  const holders = computeSeasonTitleHolders(records.hitters, records.pitchers);
  if (holders.length === 0) return null;

  const postseason = POSTSEASON_BY_YEAR[records.year];
  const regFirst = records.teams[0];

  return (
    <section
      aria-label={`${records.year} 시즌 요약 및 타이틀 홀더`}
      className="rounded-card border border-line bg-surface p-5 shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair pb-3.5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-accent">{records.year} 시즌 타이틀 홀더</span>
            {regFirst && (
              <span className="rounded-chip bg-surface2 px-2.5 py-0.5 text-[11px] font-semibold text-fg2">
                정규 1위: {regFirst.shortName} ({regFirst.wins}승 {regFirst.losses}패 {regFirst.draws}무 ·{' '}
                {rate(regFirst.winRate)})
              </span>
            )}
            {postseason && (
              <Link
                href={`/postseason?year=${records.year}`}
                className="rounded-chip bg-accent-soft px-2.5 py-0.5 text-[11px] font-bold text-accent hover:opacity-80"
              >
                KS 우승: {TEAM_ASSETS[postseason.champion].shortName} →
              </Link>
            )}
          </div>
          <h3 className="mt-1 text-[17px] font-bold tracking-[-0.025em] text-fg">
            {records.year} KBO 투·타 부문별 1위
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {postseason && (
            <Link
              href={`/postseason?year=${records.year}`}
              className="rounded-chip bg-surface2 px-3 py-1.5 text-xs font-semibold text-fg2 hover:text-fg"
            >
              {records.year} 포스트시즌 대진표 →
            </Link>
          )}
          <Link
            href={`/predictions?year=${records.year}`}
            className="rounded-chip bg-surface2 px-3 py-1.5 text-xs font-semibold text-fg2 hover:text-fg"
          >
            {records.year} 우승 확률 복기 →
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {holders.map((item) => (
          <div
            key={`${item.group}-${item.category}`}
            className="flex flex-col justify-between rounded-control border border-line bg-surface2/45 p-3"
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[11px] font-semibold text-fg3">{item.category}</span>
              <span className="text-[10px] font-medium text-accent">
                {item.group === '타격 타이틀' ? '타자' : '투수'}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <TeamBadge team={item.team} fallbackLabel={item.team} size={26} radius={7} />
              <div className="min-w-0">
                <Link
                  href={`/players/${item.playerId}`}
                  className="block truncate text-[13.5px] font-bold text-fg hover:text-accent hover:underline"
                >
                  {item.playerName}
                </Link>
                <p className="text-[11px] text-fg3">{item.team}</p>
              </div>
            </div>

            <div className="mt-2.5 border-t border-hair pt-2">
              <p className="tnum text-[15px] font-bold tracking-[-0.02em] text-accent">
                {item.valueLabel}
              </p>
              <p className="tnum mt-0.5 truncate text-[10.5px] text-fg3">{item.subLabel}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
