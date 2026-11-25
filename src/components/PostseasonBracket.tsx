import { TeamBadge } from '@/components/ui/TeamBadge';
import { TEAM_ASSETS } from '@/lib/team-assets';
import { POSTSEASON_2026, type PostseasonSeries } from '@/lib/postseason-2026';

const POSITIONS = [
  { left: 0, top: 32 },
  { left: 276, top: 132 },
  { left: 552, top: 232 },
  { left: 828, top: 332 },
] as const;

function SeriesCard({ series, isFinal }: { series: PostseasonSeries; isFinal: boolean }) {
  const winnerWins = series.teams.find(({ team }) => team === series.winner)?.wins ?? 0;
  const loserWins = series.teams.find(({ team }) => team !== series.winner)?.wins ?? 0;
  return (
    <article className={`w-[248px] rounded-card border bg-surface p-4 shadow-card ${isFinal ? 'border-accent' : 'border-line'}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-bold tracking-[-0.02em] text-fg">{series.title}</h3>
        <span className="tnum text-[10.5px] text-fg3">{series.dates}</span>
      </div>
      <div className="mt-4 space-y-1.5">
        {series.teams.map(({ team, seed, wins }) => {
          const advanced = team === series.winner;
          return (
            <div key={team} className={`flex h-9 items-center gap-2 rounded-chip px-2 ${advanced ? 'bg-accent-soft text-fg' : 'bg-surface2 text-fg2'}`}>
              <TeamBadge team={team} size={23} radius={6} />
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{TEAM_ASSETS[team].shortName}</span>
              <span className="text-[10px] text-fg3">{seed}위</span>
              <strong className={`tnum w-5 text-right text-[15px] ${advanced ? 'text-accent' : 'text-fg2'}`}>{wins}</strong>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-hair pt-2.5">
        <span className="text-[11px] font-semibold text-accent">{TEAM_ASSETS[series.winner].shortName} {winnerWins}승 {loserWins}패 · {isFinal ? '우승' : '진출'}</span>
        <a href={series.source} target="_blank" rel="noopener noreferrer" className="text-[10.5px] font-medium text-fg3 hover:text-accent">KBO 결과 ↗</a>
      </div>
    </article>
  );
}

export function PostseasonBracket() {
  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6" aria-labelledby="postseason-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-accent">2026 KBO 포스트시즌</p>
          <h2 id="postseason-heading" className="mt-1 text-[21px] font-bold tracking-[-0.035em] text-fg">우승까지 이어진 대진표</h2>
          <p className="mt-1 text-[12.5px] text-fg2">각 숫자는 해당 시리즈의 실제 경기 승수입니다. 색을 칠한 팀이 다음 단계로 올라갔습니다.</p>
        </div>
        <span className="rounded-chip bg-accent-soft px-3 py-1.5 text-xs font-bold text-accent">삼성 라이온즈 우승</span>
      </div>

      <div className="mt-5 overflow-x-auto pb-2" tabIndex={0} aria-label="포스트시즌 대진표, 좌우로 스크롤 가능">
        <div className="relative h-[535px] w-[1076px]">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1076 535" aria-hidden="true">
            <path d="M248 100 H262 V242 H276 M524 200 H538 V342 H552 M800 300 H814 V442 H828" fill="none" stroke="rgb(var(--c-accent) / 0.55)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="248" cy="100" r="4" fill="rgb(var(--c-accent))" />
            <circle cx="524" cy="200" r="4" fill="rgb(var(--c-accent))" />
            <circle cx="800" cy="300" r="4" fill="rgb(var(--c-accent))" />
            <circle cx="828" cy="442" r="4" fill="rgb(var(--c-accent))" />
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
  );
}
