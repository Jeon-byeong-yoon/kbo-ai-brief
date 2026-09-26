'use client';

import React from 'react';
import Link from 'next/link';
import {
  TeamGameLine,
  TeamMonthRecord,
  TeamRosterEntry,
  TeamVsRecord,
} from '@/types/team-page';
import { TeamBadge } from '@/components/ui/TeamBadge';

const th = 'whitespace-nowrap pb-2.5 text-center text-2xs font-semibold text-fg3';
const td = 'tnum border-t border-hair py-2.5 text-center text-[12.5px] text-fg2';
const rate = (n: number) => n.toFixed(3).replace(/^0/, '');

export const Card: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({
  title,
  hint,
  children,
}) => (
  <section className="rounded-card border border-line bg-surface px-5 pb-4 pt-4 shadow-card">
    <div className="flex items-baseline justify-between gap-3 pb-3">
      <h2 className="text-[15px] font-bold tracking-[-0.025em] text-fg">{title}</h2>
      {hint && <span className="text-2xs text-fg3">{hint}</span>}
    </div>
    {children}
  </section>
);

export const MonthlyRecord: React.FC<{ rows: TeamMonthRecord[] }> = ({ rows }) => {
  const best = Math.max(...rows.map((r) => r.winRate), 0.001);
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.month} className="flex items-center gap-3">
          <span className="tnum w-8 shrink-0 text-2xs font-semibold text-fg3">{r.month}월</span>
          <div className="h-[18px] min-w-0 flex-1 overflow-hidden rounded-chip bg-surface2">
            <div
              className="h-full rounded-chip bg-accent"
              style={{ width: `${Math.max((r.winRate / best) * 100, 2)}%` }}
            />
          </div>
          <span className="tnum w-[92px] shrink-0 text-right text-[12.5px] text-fg2">
            {r.wins}승 {r.losses}패 {r.draws}무
          </span>
          <span className="tnum w-[38px] shrink-0 text-right text-[12.5px] font-bold text-fg">
            {rate(r.winRate)}
          </span>
        </div>
      ))}
    </div>
  );
};

export const VsRecord: React.FC<{ rows: TeamVsRecord[] }> = ({ rows }) => (
  <div className="flex flex-col gap-1.5">
    {rows.map((r) => {
      const played = r.wins + r.losses;
      const pct = played > 0 ? (r.wins / played) * 100 : 50;
      return (
        <Link
          key={r.opponent}
          href={`/teams/${r.opponent}`}
          className="flex items-center gap-2.5 rounded-control px-1 py-1 transition-colors hover:bg-surface2"
        >
          <TeamBadge team={r.opponent} fallbackLabel={r.opponentShortName} size={22} radius={7} />
          <span className="w-9 shrink-0 text-[12.5px] font-semibold text-fg">
            {r.opponentShortName}
          </span>
          <div className="flex h-[16px] min-w-0 flex-1 overflow-hidden rounded-chip bg-lose-soft">
            <div className="h-full bg-win" style={{ width: `${pct}%` }} />
          </div>
          <span className="tnum w-[76px] shrink-0 text-right text-[12.5px] text-fg2">
            {r.wins}승 {r.losses}패{r.draws > 0 ? ` ${r.draws}무` : ''}
          </span>
        </Link>
      );
    })}
  </div>
);

const RESULT_STYLE: Record<string, string> = {
  W: 'bg-win-soft text-win',
  L: 'bg-lose-soft text-lose',
  D: 'bg-surface2 text-fg3',
};

export const GameList: React.FC<{ rows: TeamGameLine[]; upcoming?: boolean }> = ({
  rows,
  upcoming,
}) => {
  if (rows.length === 0) {
    return <p className="py-4 text-center text-[13px] text-fg3">표시할 경기가 없습니다.</p>;
  }
  return (
    <div className="flex flex-col gap-1">
      {rows.map((g) => (
        <div key={g.gameId} className="flex items-center gap-2.5 px-1 py-1.5">
          <span className="tnum w-[46px] shrink-0 text-2xs text-fg3">{g.date.slice(5)}</span>
          <span className="w-[26px] shrink-0 text-2xs text-fg3">{g.home ? '홈' : '원정'}</span>
          <TeamBadge team={g.opponent} fallbackLabel={g.opponentShortName} size={20} radius={6} />
          <Link
            href={`/teams/${g.opponent}`}
            className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-fg hover:text-accent"
          >
            {g.opponentShortName}
          </Link>
          {g.result && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-2xs font-bold ${RESULT_STYLE[g.result]}`}
            >
              {g.result === 'W' ? '승' : g.result === 'L' ? '패' : '무'}
            </span>
          )}
          <span className="tnum w-[44px] shrink-0 text-right text-[12.5px] font-semibold text-fg2">
            {g.score}
          </span>
          {!upcoming && (
            <Link
              href={`/games/${g.gameId}`}
              className="shrink-0 text-2xs text-fg3 hover:text-accent"
            >
              상세
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export const Roster: React.FC<{ rows: TeamRosterEntry[]; title: string }> = ({ rows, title }) => (
  <Card title={title} hint="WAR 순">
    <div className="custom-scrollbar -mx-1 overflow-x-auto px-1">
      <table className="w-full border-collapse" style={{ minWidth: 330 }}>
        <thead>
          <tr>
            <th className={`${th} text-left`}>선수</th>
            <th className={th}>등번호</th>
            <th className={th}>경기</th>
            <th className={th}>{rows[0]?.primaryLabel ?? '기록'}</th>
            <th className={th}>WAR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.playerId}>
              <td className="border-t border-hair py-2.5">
                <Link
                  href={`/players/${p.playerId}`}
                  className="text-[12.5px] font-semibold tracking-[-0.02em] text-fg hover:text-accent hover:underline"
                >
                  {p.name}
                </Link>
              </td>
              <td className={`${td} text-fg3`}>{p.backNumber || '-'}</td>
              <td className={td}>{p.games}</td>
              <td className={`${td} font-semibold text-fg`}>{p.primary}</td>
              <td className={td}>{p.war === null ? '—' : p.war.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);
