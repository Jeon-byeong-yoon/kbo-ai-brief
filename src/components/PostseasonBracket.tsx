import { TeamBadge } from '@/components/ui/TeamBadge';
import { TEAM_ASSETS } from '@/lib/team-assets';
import { POSTSEASON_2026, type PostseasonSeries } from '@/lib/postseason-2026';

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

export function PostseasonBracket() {
  return (
    <div className="flex flex-col gap-5">
      <section
        className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
        aria-labelledby="postseason-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-accent">2026 KBO 포스트시즌</p>
            <h2
              id="postseason-heading"
              className="mt-1 text-[21px] font-bold tracking-[-0.035em] text-fg"
            >
              우승까지 이어진 대진표
            </h2>
            <p className="mt-1 text-[12.5px] text-fg2">
              각 숫자는 해당 시리즈의 실제 경기 승수입니다. 색을 칠한 팀이 다음 단계로 올라갔습니다.
            </p>
          </div>
          <span className="rounded-chip bg-accent-soft px-3 py-1.5 text-xs font-bold text-accent">
            삼성 라이온즈 우승
          </span>
        </div>

        <div
          className="mt-5 overflow-x-auto pb-2"
          tabIndex={0}
          aria-label="포스트시즌 대진표, 좌우로 스크롤 가능"
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
            {POSTSEASON_2026.map((series, index) => (
              <div key={series.id} className="absolute" style={POSITIONS[index]}>
                <SeriesCard series={series} isFinal={index === POSTSEASON_2026.length - 1} />
              </div>
            ))}
          </div>
        </div>
        <p className="mt-1 text-[11.5px] leading-relaxed text-fg3">
          와일드카드 LG 1승 0패는 실제 경기 전적입니다. 정규시즌 4위 LG는 규정상 1승 어드밴티지를 안고 시작했습니다.
        </p>
      </section>

      {/* 시리즈별 경기 스코어 상세 */}
      <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div>
          <p className="text-xs font-semibold text-accent">시리즈별 경기 기록</p>
          <h3 className="mt-1 text-[18px] font-bold tracking-[-0.03em] text-fg">
            차전별 스코어 및 결과 요약
          </h3>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {POSTSEASON_2026.map((series) => {
            const winnerWins = series.teams.find(({ team }) => team === series.winner)?.wins ?? 0;
            const loserWins = series.teams.find(({ team }) => team !== series.winner)?.wins ?? 0;
            return (
              <div
                key={series.id}
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
                            <span className="tnum text-[11px] text-fg3">({g.date} · {g.stadium})</span>
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
                    KBO 공식 전적 기사 ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
