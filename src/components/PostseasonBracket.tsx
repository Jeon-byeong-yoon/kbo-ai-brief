'use client';

import Link from 'next/link';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons';
import { TEAM_ASSETS } from '@/lib/team-assets';
import {
  POSTSEASON_YEARS,
  POSTSEASON_BY_YEAR,
  getPostseasonYear,
  type PostseasonSeries,
} from '@/lib/postseason-2026';

const POSITIONS = [
  { left: 0, top: 24 },
  { left: 276, top: 128 },
  { left: 552, top: 232 },
  { left: 828, top: 336 },
] as const;

function SeriesCard({ series, isFinal }: { series: PostseasonSeries; isFinal: boolean }) {
  const winnerWins = series.teams.find(({ team }) => team === series.winner)?.wins ?? 0;
  const loserWins = series.teams.find(({ team }) => team !== series.winner)?.wins ?? 0;
  return (
    <article
      className={`w-[248px] rounded-card border bg-surface p-4 shadow-card ${
        isFinal ? 'border-accent' : 'border-line'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-bold tracking-[-0.02em] text-fg">{series.title}</h3>
        <span className="tnum text-[10.5px] text-fg3">{series.dates}</span>
      </div>
      <div className="mt-3.5 space-y-1.5">
        {series.teams.map(({ team, seed, wins }) => {
          const advanced = team === series.winner;
          return (
            <div
              key={team}
              className={`flex h-9 items-center gap-2 rounded-chip px-2 ${
                advanced ? 'bg-accent-soft text-fg' : 'bg-surface2 text-fg2'
              }`}
            >
              <TeamBadge team={team} size={23} radius={6} />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">
                {TEAM_ASSETS[team].shortName}
              </span>
              <span className="text-[10px] text-fg3">{seed}위</span>
              <strong
                className={`tnum w-5 text-right text-[15px] ${
                  advanced ? 'text-accent' : 'text-fg2'
                }`}
              >
                {wins}
              </strong>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-hair pt-2.5">
        <span className="text-[11px] font-semibold text-accent">
          {TEAM_ASSETS[series.winner].shortName} {winnerWins}승 {loserWins}패 ·{' '}
          {isFinal ? '우승' : '진출'}
        </span>
        <a
          href={series.source}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10.5px] font-medium text-fg3 hover:text-accent"
        >
          KBO 결과 ↗
        </a>
      </div>
    </article>
  );
}

export function PostseasonBracket({
  year = 2026,
  onYearChange,
}: {
  year?: number;
  onYearChange?: (nextYear: number) => void;
}) {
  const data = getPostseasonYear(year);
  const seriesList = data.series;
  const minYear = POSTSEASON_YEARS[POSTSEASON_YEARS.length - 1];
  const maxYear = POSTSEASON_YEARS[0];
  const wcSeries = seriesList[0];
  const wcWinnerSeed = wcSeries.teams.find((t) => t.team === wcSeries.winner)?.seed ?? 4;

  const setYear = (next: number) => {
    if (onYearChange && POSTSEASON_BY_YEAR[next]) {
      onYearChange(next);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section
        className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
        aria-labelledby="postseason-heading"
      >
        {/* 상단 헤더 + 연도 선택기 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-accent">{data.year} KBO 포스트시즌</span>
              <span className="rounded-chip bg-accent-soft px-2.5 py-0.5 text-[11px] font-bold text-accent">
                {TEAM_ASSETS[data.champion].name} {data.isUnifiedChampion ? '통합 우승' : '한국시리즈 우승'}
              </span>
              {!data.isUnifiedChampion && (
                <span className="rounded-chip bg-surface2 px-2.5 py-0.5 text-[11px] font-medium text-fg2">
                  정규 1위: {TEAM_ASSETS[data.regularFirst].shortName}
                </span>
              )}
            </div>
            <h2
              id="postseason-heading"
              className="mt-1.5 text-[21px] font-bold tracking-[-0.035em] text-fg"
            >
              {data.year} 우승까지 이어진 사다리 대진표
            </h2>
            <p className="mt-1 text-[12.5px] leading-relaxed text-fg2">{data.headline}</p>
          </div>

          {onYearChange && (
            <div className="flex items-center gap-1 rounded-control border border-line bg-surface2/60 px-1.5 py-1">
              <button
                type="button"
                onClick={() => setYear(Math.max(minYear, data.year - 1))}
                disabled={data.year <= minYear}
                aria-label="이전 시즌"
                className="flex h-8 w-8 items-center justify-center rounded-chip text-fg2 transition-colors hover:bg-surface hover:text-fg disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeftIcon />
              </button>

              <label className="relative flex items-center gap-1.5 rounded-control px-2.5 py-1 transition-colors hover:bg-surface">
                <span className="tnum min-w-[54px] text-center text-[18px] font-bold tracking-[-0.03em] text-fg">
                  {data.year}
                </span>
                <ChevronDownIcon className="text-fg3" />
                <select
                  value={data.year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  aria-label="포스트시즌 연도 선택"
                  className="absolute inset-0 cursor-pointer opacity-0"
                >
                  {POSTSEASON_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y} 포스트시즌 ({TEAM_ASSETS[POSTSEASON_BY_YEAR[y].champion].shortName} 우승)
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setYear(Math.min(maxYear, data.year + 1))}
                disabled={data.year >= maxYear}
                aria-label="다음 시즌"
                className="flex h-8 w-8 items-center justify-center rounded-chip text-fg2 transition-colors hover:bg-surface hover:text-fg disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </div>

        {/* 연도 빠른 선택 칩 (최근 12개년) */}
        {onYearChange && (
          <div className="mt-3.5 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="연도별 포스트시즌 바로가기">
            {POSTSEASON_YEARS.map((y) => {
              const yData = POSTSEASON_BY_YEAR[y];
              const active = y === data.year;
              return (
                <button
                  key={y}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setYear(y)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-chip border px-2.5 py-1 text-xs transition-colors ${
                    active
                      ? 'border-accent bg-accent-soft font-bold text-accent'
                      : 'border-line bg-surface2/50 font-medium text-fg2 hover:border-accent/40 hover:text-fg'
                  }`}
                >
                  <span className="tnum">{y}</span>
                  <TeamBadge team={yData.champion} size={15} radius={4} />
                  <span className="text-[11px]">{TEAM_ASSETS[yData.champion].shortName}</span>
                </button>
              );
            })}
          </div>
        )}

        <div
          className="mt-5 overflow-x-auto pb-2"
          tabIndex={0}
          aria-label={`${data.year} 포스트시즌 대진표, 좌우로 스크롤 가능`}
        >
          <div className="relative h-[535px] w-[1076px]">
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 1076 535"
              aria-hidden="true"
            >
              <path
                d="M248 92 H262 V238 H276 M524 196 H538 V342 H552 M800 300 H814 V446 H828"
                fill="none"
                stroke="rgb(var(--c-accent) / 0.55)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="248" cy="92" r="4" fill="rgb(var(--c-accent))" />
              <circle cx="524" cy="196" r="4" fill="rgb(var(--c-accent))" />
              <circle cx="800" cy="300" r="4" fill="rgb(var(--c-accent))" />
              <circle cx="828" cy="446" r="4" fill="rgb(var(--c-accent))" />
            </svg>
            {seriesList.map((series, index) => (
              <div key={`${data.year}-${series.id}`} className="absolute" style={POSITIONS[index]}>
                <SeriesCard series={series} isFinal={index === seriesList.length - 1} />
              </div>
            ))}
          </div>
        </div>
        <p className="mt-1 text-[11.5px] leading-relaxed text-fg3">
          {wcWinnerSeed === 4
            ? `와일드카드 ${TEAM_ASSETS[wcSeries.winner].shortName}의 승수는 실제 치른 경기 전적입니다. 정규시즌 4위 팀은 규정상 1승 어드밴티지를 안고 시작했습니다.`
            : `${data.year} 와일드카드 결정전에서는 정규시즌 5위 ${TEAM_ASSETS[wcSeries.winner].shortName}가 1·2차전을 모두 승리(2승 0패)하며 4위 어드밴티지를 뒤집고 준플레이오프에 진출했습니다.`}
        </p>
      </section>

      {/* 시리즈별 경기 스코어 상세 */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-accent">{data.year} 시리즈별 경기 기록</p>
            <h3 className="mt-1 text-[18px] font-bold tracking-[-0.03em] text-fg">
              차전별 스코어 및 결과 요약
            </h3>
          </div>
          <Link
            href={`/records?year=${data.year}`}
            className="text-xs font-semibold text-accent hover:underline"
          >
            {data.year} 정규시즌 기록실 보기 →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {seriesList.map((series) => {
            const winnerWins = series.teams.find(({ team }) => team === series.winner)?.wins ?? 0;
            const loserWins = series.teams.find(({ team }) => team !== series.winner)?.wins ?? 0;
            return (
              <div
                key={`${data.year}-detail-${series.id}`}
                className="flex flex-col justify-between rounded-control border border-line bg-surface2/45 p-4"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14.5px] font-bold text-fg">{series.title}</h4>
                      <span className="text-xs text-fg3">{series.format}</span>
                    </div>
                    <span className="rounded-chip bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                      {TEAM_ASSETS[series.winner].shortName} {winnerWins}승 {loserWins}패
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-fg2">{series.summary}</p>
                  <div className="mt-3 divide-y divide-hair rounded-control border border-line bg-surface px-3 py-1">
                    {series.games.map((g) => {
                      const awayWon = g.awayScore > g.homeScore;
                      return (
                        <div
                          key={`${series.id}-${g.game}`}
                          className="flex items-center justify-between gap-2 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="tnum font-semibold text-fg3">{g.game}</span>
                            <span className="tnum text-[11px] text-fg3">
                              ({g.date} · {g.stadium})
                            </span>
                          </div>
                          <div className="tnum flex items-center gap-1.5 text-[12.5px]">
                            <span className={awayWon ? 'font-bold text-fg' : 'text-fg2'}>
                              {TEAM_ASSETS[g.away].shortName} {g.awayScore}
                            </span>
                            <span className="text-fg3">:</span>
                            <span className={!awayWon ? 'font-bold text-fg' : 'text-fg2'}>
                              {g.homeScore} {TEAM_ASSETS[g.home].shortName}
                            </span>
                            {g.note && (
                              <span className="ml-1 rounded-chip bg-surface2 px-1.5 py-0.5 text-[10.5px] text-fg3">
                                {g.note}
                              </span>
                            )}
                            {g.gameId && (
                              <Link
                                href={`/games/${g.gameId}`}
                                className="ml-1 rounded-chip bg-accent-soft px-2 py-0.5 text-[10.5px] font-semibold text-accent hover:opacity-80"
                              >
                                기록 →
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <a
                    href={series.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    KBO 공식 전적 ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 역대 포스트시즌 한눈에 보기 (2015~2026, 12개년 아카이브) */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-accent">역대 가을야구 아카이브 (2015~2026)</p>
            <h3 className="mt-1 text-[18px] font-bold tracking-[-0.03em] text-fg">
              최근 12개년 포스트시즌 라운드별 결과 비교
            </h3>
            <p className="mt-0.5 text-xs text-fg3">
              와일드카드 결정전이 도입된 2015년부터 2026년까지의 전체 포스트시즌 결과입니다. 연도를 누르면 해당 연도의 사다리 대진표로 바로 전환됩니다.
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-hair text-xs text-fg3">
                <th className="py-2.5 pr-3 font-semibold">연도</th>
                <th className="px-2 py-2.5 font-semibold">한국시리즈 우승</th>
                <th className="px-2 py-2.5 font-semibold">준우승 (KS 전적)</th>
                <th className="px-2 py-2.5 font-semibold">정규 1위</th>
                <th className="px-2 py-2.5 font-semibold">플레이오프 승자</th>
                <th className="px-2 py-2.5 font-semibold">준플레이오프 승자</th>
                <th className="pl-2 py-2.5 font-semibold">와일드카드 승자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {POSTSEASON_YEARS.map((y) => {
                const row = POSTSEASON_BY_YEAR[y];
                const [wc, semi, po, ks] = row.series;
                const ksW = ks.teams.find((t) => t.team === ks.winner)?.wins ?? 4;
                const ksL = ks.teams.find((t) => t.team !== ks.winner)?.wins ?? 0;
                const poW = po.teams.find((t) => t.team === po.winner)?.wins ?? 3;
                const poL = po.teams.find((t) => t.team !== po.winner)?.wins ?? 0;
                const semiW = semi.teams.find((t) => t.team === semi.winner)?.wins ?? 3;
                const semiL = semi.teams.find((t) => t.team !== semi.winner)?.wins ?? 0;
                const wcW = wc.teams.find((t) => t.team === wc.winner)?.wins ?? 1;
                const wcL = wc.teams.find((t) => t.team !== wc.winner)?.wins ?? 0;
                const active = y === data.year;

                return (
                  <tr
                    key={y}
                    onClick={() => setYear(y)}
                    className={`cursor-pointer transition-colors ${
                      active ? 'bg-accent-soft/45' : 'hover:bg-surface2/60'
                    }`}
                  >
                    <td className="tnum py-2.5 pr-3 font-bold text-fg">
                      <button
                        type="button"
                        onClick={() => setYear(y)}
                        className="flex items-center gap-1.5 text-left font-bold hover:text-accent"
                      >
                        <span>{y}</span>
                        {active && (
                          <span className="rounded-chip bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                            선택됨
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-2 py-2.5 font-bold text-fg">
                      <div className="flex items-center gap-2">
                        <TeamBadge team={row.champion} size={22} radius={6} />
                        <span>{TEAM_ASSETS[row.champion].shortName}</span>
                        <span
                          className={`rounded-chip px-1.5 py-0.5 text-[10px] font-semibold ${
                            row.isUnifiedChampion
                              ? 'bg-accent-soft text-accent'
                              : 'bg-surface2 text-fg2'
                          }`}
                        >
                          {row.isUnifiedChampion ? '통합' : '업셋'}
                        </span>
                      </div>
                    </td>
                    <td className="tnum px-2 py-2.5 text-fg2">
                      {TEAM_ASSETS[row.runnerUp].shortName} ({ksW}승 {ksL}패)
                    </td>
                    <td className="px-2 py-2.5 text-fg2">
                      {TEAM_ASSETS[row.regularFirst].shortName}
                    </td>
                    <td className="tnum px-2 py-2.5 text-fg2">
                      {TEAM_ASSETS[po.winner].shortName} ({poW}-{poL})
                    </td>
                    <td className="tnum px-2 py-2.5 text-fg2">
                      {TEAM_ASSETS[semi.winner].shortName} ({semiW}-{semiL})
                    </td>
                    <td className="tnum pl-2 py-2.5 text-fg2">
                      {TEAM_ASSETS[wc.winner].shortName} ({wcW}-{wcL})
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
