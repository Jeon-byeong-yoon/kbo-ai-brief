'use client';

import React from 'react';
import { SeasonHitterRecord, SeasonPitcherRecord, SeasonTeamRecord } from '@/types/season';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { RecentForm } from '@/components/ui/RecentForm';

const th = 'whitespace-nowrap pb-2.5 text-center text-2xs font-semibold text-fg3';
const td = 'tnum border-t border-hair py-2.5 text-center text-[12.5px] text-fg2';

const rate = (n: number) => n.toFixed(3).replace(/^0/, '');

/** 오래된 시즌은 WAR 을 주지 않아 전부 0 으로 온다. 그럴 땐 칸 자체를 뺀다. */
const hasWar = (rows: Array<{ war: number }>) => rows.some((r) => r.war !== 0);

const Rank: React.FC<{ value: number; highlight?: boolean }> = ({ value, highlight }) => (
  <span className={`tnum text-[13px] font-bold ${highlight ? 'text-fg' : 'text-fg3'}`}>{value}</span>
);

const PlayerCell: React.FC<{ name: string; team: string }> = ({ name, team }) => (
  <div className="flex min-w-0 items-center gap-2 pr-2">
    <TeamBadge team={team} fallbackLabel={team} size={24} radius={7} />
    <span className="truncate text-[13px] font-semibold tracking-[-0.02em] text-fg">{name}</span>
    <span className="shrink-0 text-2xs text-fg3">{team}</span>
  </div>
);

const Shell: React.FC<{ minWidth: number; children: React.ReactNode }> = ({ minWidth, children }) => (
  <div className="custom-scrollbar -mx-1 overflow-x-auto px-1">
    <table className="w-full border-collapse" style={{ minWidth }}>
      {children}
    </table>
  </div>
);

const Empty: React.FC<{ label: string }> = ({ label }) => (
  <p className="py-16 text-center text-[13px] text-fg2">{label}</p>
);

/* ── 팀 순위 ─────────────────────────────────────────────── */

export const SeasonTeamStandings: React.FC<{ rows: SeasonTeamRecord[] }> = ({ rows }) => {
  if (!rows.length) return <Empty label="이 시즌의 팀 순위가 없습니다." />;
  // 끝난 시즌은 포스트시즌 결과가 반영된 최종 순위가 따로 있다.
  const showFinal = rows.some((row) => row.finalRank > 0 && row.finalRank !== row.rank);

  return (
    <Shell minWidth={showFinal ? 880 : 820}>
      <thead>
        <tr>
          <th className={th}>순위</th>
          <th className={`${th} text-left`}>팀</th>
          <th className={th}>승률</th>
          <th className={th}>게임차</th>
          <th className={th}>경기</th>
          <th className={th}>승</th>
          <th className={th}>패</th>
          <th className={th}>무</th>
          <th className={th}>연속</th>
          <th className={th}>타율</th>
          <th className={th}>평균자책</th>
          <th className={th}>최근 5경기</th>
          {showFinal && <th className={th}>최종</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const isPlayoff = row.rank <= 5;
          return (
            <tr key={row.teamCode} className="transition-colors hover:bg-surface2">
              <td className={`${td} w-12`}>
                <Rank value={row.rank} highlight={isPlayoff} />
              </td>
              <td className="border-t border-hair py-2.5">
                <div className="flex min-w-0 items-center gap-2.5 pr-3">
                  <TeamBadge team={row.teamCode} fallbackLabel={row.shortName} size={26} radius={8} />
                  <span className="truncate text-[13px] font-semibold tracking-[-0.025em] text-fg">
                    {row.teamName}
                  </span>
                </div>
              </td>
              <td className={`${td} font-bold text-accent`}>{rate(row.winRate)}</td>
              <td className={td}>{row.gameBehind === 0 ? '-' : row.gameBehind.toFixed(1)}</td>
              <td className={td}>{row.gamesPlayed}</td>
              <td className={`${td} font-semibold text-fg`}>{row.wins}</td>
              <td className={td}>{row.losses}</td>
              <td className={`${td} text-fg3`}>{row.draws}</td>
              <td className={`${td} whitespace-nowrap`}>{row.streak || '-'}</td>
              <td className={td}>{rate(row.avg)}</td>
              <td className={td}>{row.era.toFixed(2)}</td>
              <td className="border-t border-hair py-2.5">
                <RecentForm value={row.lastFive} />
              </td>
              {showFinal && (
                <td className={td}>
                  <span className={row.finalRank === 1 ? 'font-bold text-accent' : ''}>
                    {row.finalRank > 0 ? `${row.finalRank}위` : '-'}
                  </span>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </Shell>
  );
};

/* ── 팀 기록 ─────────────────────────────────────────────── */

export const SeasonTeamStats: React.FC<{ rows: SeasonTeamRecord[] }> = ({ rows }) => {
  if (!rows.length) return <Empty label="이 시즌의 팀 기록이 없습니다." />;

  return (
    <Shell minWidth={780}>
      <thead>
        <tr>
          <th className={`${th} text-left`}>팀</th>
          <th className={th}>타율</th>
          <th className={th}>OPS</th>
          <th className={th}>홈런</th>
          <th className={th}>득점</th>
          <th className={th}>도루</th>
          <th className={th}>평균자책</th>
          <th className={th}>WHIP</th>
          <th className={th}>삼진</th>
          <th className={th}>세이브</th>
          <th className={th}>실책</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.teamCode} className="transition-colors hover:bg-surface2">
            <td className="border-t border-hair py-2.5">
              <div className="flex min-w-0 items-center gap-2.5 pr-3">
                <TeamBadge team={row.teamCode} fallbackLabel={row.shortName} size={26} radius={8} />
                <span className="truncate text-[13px] font-semibold tracking-[-0.025em] text-fg">
                  {row.teamName}
                </span>
              </div>
            </td>
            <td className={`${td} font-semibold text-fg`}>{rate(row.avg)}</td>
            <td className={td}>{rate(row.ops)}</td>
            <td className={td}>{row.homeRuns}</td>
            <td className={td}>{row.runs}</td>
            <td className={td}>{row.steals}</td>
            <td className={`${td} font-semibold text-fg`}>{row.era.toFixed(2)}</td>
            <td className={td}>{row.whip.toFixed(2)}</td>
            <td className={td}>{row.strikeouts}</td>
            <td className={td}>{row.saves}</td>
            <td className={td}>{row.errors}</td>
          </tr>
        ))}
      </tbody>
    </Shell>
  );
};

/* ── 타자 기록 ───────────────────────────────────────────── */

export const SeasonHitters: React.FC<{ rows: SeasonHitterRecord[] }> = ({ rows }) => {
  if (!rows.length) return <Empty label="이 시즌의 타자 기록이 없습니다." />;
  const war = hasWar(rows);

  return (
    <Shell minWidth={war ? 800 : 740}>
      <thead>
        <tr>
          <th className={th}>순위</th>
          <th className={`${th} text-left`}>선수</th>
          <th className={th}>경기</th>
          <th className={th}>타율</th>
          <th className={th}>안타</th>
          <th className={th}>홈런</th>
          <th className={th}>타점</th>
          <th className={th}>도루</th>
          <th className={th}>출루율</th>
          <th className={th}>장타율</th>
          <th className={th}>OPS</th>
          {war && <th className={th}>WAR</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.rank}-${row.name}`} className="transition-colors hover:bg-surface2">
            <td className={`${td} w-12`}>
              <Rank value={row.rank} highlight={row.rank <= 3} />
            </td>
            <td className="border-t border-hair py-2.5">
              <PlayerCell name={row.name} team={row.team} />
            </td>
            <td className={td}>{row.games}</td>
            <td className={`${td} font-bold text-fg`}>{rate(row.avg)}</td>
            <td className={td}>{row.hits}</td>
            <td className={`${td} font-semibold text-fg`}>{row.homeRuns}</td>
            <td className={td}>{row.rbi}</td>
            <td className={td}>{row.steals}</td>
            <td className={td}>{rate(row.obp)}</td>
            <td className={td}>{rate(row.slg)}</td>
            <td className={`${td} font-semibold text-fg`}>{rate(row.ops)}</td>
            {war && <td className={`${td} font-bold text-accent`}>{row.war.toFixed(2)}</td>}
          </tr>
        ))}
      </tbody>
    </Shell>
  );
};

/* ── 투수 기록 ───────────────────────────────────────────── */

export const SeasonPitchers: React.FC<{ rows: SeasonPitcherRecord[] }> = ({ rows }) => {
  if (!rows.length) return <Empty label="이 시즌의 투수 기록이 없습니다." />;
  const war = hasWar(rows);

  return (
    <Shell minWidth={war ? 800 : 740}>
      <thead>
        <tr>
          <th className={th}>순위</th>
          <th className={`${th} text-left`}>선수</th>
          <th className={th}>경기</th>
          <th className={th}>평균자책</th>
          <th className={th}>승</th>
          <th className={th}>패</th>
          <th className={th}>세이브</th>
          <th className={th}>홀드</th>
          <th className={th}>이닝</th>
          <th className={th}>삼진</th>
          <th className={th}>WHIP</th>
          {war && <th className={th}>WAR</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.rank}-${row.name}`} className="transition-colors hover:bg-surface2">
            <td className={`${td} w-12`}>
              <Rank value={row.rank} highlight={row.rank <= 3} />
            </td>
            <td className="border-t border-hair py-2.5">
              <PlayerCell name={row.name} team={row.team} />
            </td>
            <td className={td}>{row.games}</td>
            <td className={`${td} font-bold text-fg`}>{row.era.toFixed(2)}</td>
            <td className={`${td} font-semibold text-fg`}>{row.wins}</td>
            <td className={td}>{row.losses}</td>
            <td className={td}>{row.saves}</td>
            <td className={td}>{row.holds}</td>
            <td className={td}>{row.innings}</td>
            <td className={`${td} font-semibold text-fg`}>{row.strikeouts}</td>
            <td className={td}>{row.whip.toFixed(2)}</td>
            {war && <td className={`${td} font-bold text-accent`}>{row.war.toFixed(2)}</td>}
          </tr>
        ))}
      </tbody>
    </Shell>
  );
};
