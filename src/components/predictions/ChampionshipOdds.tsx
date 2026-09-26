'use client';

import React from 'react';
import { ChampionshipPrediction } from '@/types/prediction';
import { TeamBadge } from '@/components/ui/TeamBadge';

const pct = (n: number) => (n >= 10 ? n.toFixed(0) : n >= 1 ? n.toFixed(1) : n > 0 ? '<1' : '0');
const rate = (n: number) => n.toFixed(3).replace(/^0/, '');

/** "2026-09-26" -> "9/26" */
const shortDate = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${Number(m)}/${Number(d)}`;
};

/** ISO 시각을 한국 시간 "9/26 17:48" 로. 화면은 클라이언트에서만 그려지므로 로캘을 써도 된다. */
const stamp = (iso: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const at = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${at('month')}/${at('day')} ${at('hour')}:${at('minute')}`;
};

const th = 'whitespace-nowrap pb-2.5 text-center text-2xs font-semibold text-fg3';
const td = 'tnum border-t border-hair py-2.5 text-center text-[12.5px] text-fg2';

export const ChampionshipOdds: React.FC<{ data: ChampionshipPrediction }> = ({ data }) => {
  const top = data.teams[0]?.championshipOdds || 1;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-card border border-line bg-surface px-5 pb-4 pt-4 shadow-card">
        <div className="pb-4">
          <h2 className="text-[15px] font-bold tracking-[-0.025em] text-fg">
            {data.year} 한국시리즈 우승 확률
          </h2>
          <p className="tnum mt-0.5 text-xs text-fg3">
            {data.regularSeasonOver ? '정규시즌 종료 · 포스트시즌만 시뮬레이션' : `잔여 ${data.gamesRemaining}경기`}
            {' · '}
            {data.iterations.toLocaleString()}회 시뮬레이션
          </p>
          <p className="tnum mt-1 text-2xs text-fg3">
            {data.dataAsOf ? `데이터 기준 ${shortDate(data.dataAsOf)} 경기 전` : '데이터 기준 시즌 종료'}
            {' · '}
            계산 {stamp(data.generatedAt)}
          </p>
          {data.staleDays > 0 && (
            <p className="tnum mt-2 rounded-control bg-lose-soft px-3 py-2 text-2xs font-semibold text-lose">
              네이버 응답이 {data.staleDays}일 지난 캐시입니다. 이 확률은 {shortDate(data.dataAsOf!)} 이후 경기
              결과를 반영하지 못합니다.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          {data.teams.map((team) => {
            const ratio = Math.max(team.championshipOdds / top, 0.005);
            const inside = ratio > 0.18;
            return (
              <div key={team.teamCode} className="flex items-center gap-3">
                <div className="flex w-[104px] shrink-0 items-center gap-2">
                  <span className="tnum w-4 text-2xs font-bold text-fg3">{team.rank}</span>
                  <TeamBadge team={team.teamCode} fallbackLabel={team.shortName} size={22} radius={7} />
                  <span className="truncate text-[12.5px] font-semibold tracking-[-0.025em] text-fg">
                    {team.shortName}
                  </span>
                </div>

                <div className="h-[22px] min-w-0 flex-1 overflow-hidden rounded-chip bg-surface2">
                  <div
                    className="flex h-full items-center justify-end rounded-chip bg-accent pr-2"
                    style={{ width: `${ratio * 100}%` }}
                  >
                    {inside && (
                      <span className="tnum text-[11px] font-bold text-white">
                        {pct(team.championshipOdds)}%
                      </span>
                    )}
                  </div>
                </div>

                {!inside && (
                  <span className="tnum w-9 shrink-0 text-right text-[11px] font-semibold text-fg3">
                    {pct(team.championshipOdds)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-card border border-line bg-surface px-5 pb-3.5 pt-4 shadow-card">
        <div className="flex items-end justify-between gap-3 pb-3.5">
          <h3 className="text-[15px] font-bold tracking-[-0.025em] text-fg">단계별 확률과 전력</h3>
          <p className="text-2xs text-fg3">전력 = 피타고리안·실제·뎁스를 섞고 평균으로 수축시킨 값</p>
        </div>
        <div className="custom-scrollbar -mx-1 overflow-x-auto px-1">
          <table className="w-full border-collapse" style={{ minWidth: 880 }}>
            <thead>
              <tr>
                <th className={`${th} w-11`}>순위</th>
                <th className={`${th} text-left`}>팀</th>
                <th className={th}>피타고리안</th>
                <th className={th}>실제 승률</th>
                <th className={th}>뎁스(WAR)</th>
                <th className={th}>전력</th>
                <th className={th}>예상 승수</th>
                <th className={th}>PS 진출</th>
                <th className={th}>정규 1위</th>
                <th className={th}>KS 진출</th>
                <th className={th}>우승</th>
              </tr>
            </thead>
            <tbody>
              {data.teams.map((team) => (
                <tr key={team.teamCode} className="transition-colors hover:bg-surface2">
                  <td className={td}>
                    <span className={`font-bold ${team.rank <= 5 ? 'text-fg' : 'text-fg3'}`}>{team.rank}</span>
                  </td>
                  <td className="border-t border-hair py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5 pr-3">
                      <TeamBadge team={team.teamCode} fallbackLabel={team.shortName} size={24} radius={7} />
                      <span className="truncate text-[12.5px] font-semibold tracking-[-0.025em] text-fg">
                        {team.teamName}
                      </span>
                    </div>
                  </td>
                  <td className={td}>{rate(team.strength.pythagoreanWinRate)}</td>
                  <td className={td}>{rate(team.strength.actualWinRate)}</td>
                  <td className={td}>
                    {rate(team.strength.depthWinRate)}
                    <span className="ml-1 text-2xs text-fg3">{team.strength.totalWar.toFixed(0)}</span>
                  </td>
                  <td className={`${td} font-semibold text-fg`}>{rate(team.strength.talent)}</td>
                  <td className={td}>{team.projectedWins.toFixed(1)}</td>
                  <td className={td}>{pct(team.playoffOdds)}%</td>
                  <td className={td}>{pct(team.pennantOdds)}%</td>
                  <td className={td}>{pct(team.finalsOdds)}%</td>
                  <td className={`${td} font-bold text-accent`}>{pct(team.championshipOdds)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
