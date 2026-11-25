import Link from 'next/link';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { TEAM_ASSETS } from '@/lib/team-assets';
import { POSTSEASON_2026 } from '@/lib/postseason-2026';

export function PostseasonPreviewCard() {
  return (
    <section
      aria-label="2026 포스트시즌 대진표 요약"
      className="rounded-card border border-line bg-surface p-5 shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-semibold text-accent">2026 포스트시즌 결과 요약</span>
          <h3 className="mt-0.5 text-[16px] font-bold tracking-[-0.025em] text-fg">
            와일드카드부터 한국시리즈 우승까지
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/postseason"
            className="rounded-chip bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent hover:opacity-80"
          >
            전체 사다리 대진표 →
          </Link>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {POSTSEASON_2026.map((series, index) => {
          const isFinal = index === POSTSEASON_2026.length - 1;
          const winnerWins = series.teams.find((t) => t.team === series.winner)?.wins ?? 0;
          const loserWins = series.teams.find((t) => t.team !== series.winner)?.wins ?? 0;

          return (
            <Link
              key={series.id}
              href="/postseason"
              className={`group flex flex-col justify-between rounded-control border p-3 transition-colors hover:border-accent/50 ${
                isFinal ? 'border-accent/40 bg-accent-soft/35' : 'border-line bg-surface2/45'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-fg group-hover:text-accent">
                    {series.title}
                  </span>
                  <span className="tnum text-[10.5px] text-fg3">{series.dates}</span>
                </div>
                <div className="mt-2.5 space-y-1">
                  {series.teams.map(({ team, seed, wins }) => {
                    const advanced = team === series.winner;
                    return (
                      <div
                        key={team}
                        className={`flex items-center gap-1.5 rounded-chip px-2 py-1 ${
                          advanced ? 'bg-surface font-semibold text-fg' : 'text-fg2'
                        }`}
                      >
                        <TeamBadge team={team} size={18} radius={5} />
                        <span className="min-w-0 flex-1 truncate text-xs">
                          {TEAM_ASSETS[team].shortName}
                        </span>
                        <span className="text-[10px] text-fg3">{seed}위</span>
                        <strong
                          className={`tnum w-4 text-right text-[13px] ${
                            advanced ? 'text-accent' : 'text-fg3'
                          }`}
                        >
                          {wins}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-hair pt-2 text-[11px]">
                <span className="font-semibold text-accent">
                  {TEAM_ASSETS[series.winner].shortName} {winnerWins}승 {loserWins}패 ·{' '}
                  {isFinal ? '우승' : '진출'}
                </span>
                <span className="text-fg3">{series.games.length}경기</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
