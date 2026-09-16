import { GamePlayerHighlight as Highlight } from '@/types/kbo';
import { TeamBadge } from '@/components/ui/TeamBadge';

interface GamePlayerHighlightProps {
  player: Highlight;
  variant: 'BEST' | 'WORST';
}

export function GamePlayerHighlight({ player, variant }: GamePlayerHighlightProps) {
  const isBest = variant === 'BEST';

  return (
    <article className="rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start gap-3.5">
        <TeamBadge
          team={player.teamCode || player.team}
          fallbackLabel={player.teamShortName}
          size={44}
          radius={13}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-2xs font-semibold ${
                isBest ? 'bg-win-soft text-win' : 'bg-lose-soft text-lose'
              }`}
            >
              {isBest ? '오늘의 선수' : '아쉬웠던 선수'}
            </span>
            <span className="text-xs text-fg3">
              {player.playerType === 'PITCHER' ? '투수' : '타자'} · {player.position}
            </span>
          </div>
          <h3 className="mt-1.5 text-[19px] font-bold tracking-[-0.03em] text-fg">{player.name}</h3>
          <p className="text-xs text-fg2">{player.team}</p>
        </div>
      </div>

      <p className="mt-4 text-[13.5px] font-semibold leading-relaxed tracking-[-0.01em] text-fg">
        {player.summary}
      </p>

      <dl className="mt-3 grid grid-cols-3 gap-2">
        {player.stats.slice(0, 3).map((stat) => (
          <div
            key={`${stat.label}-${stat.value}`}
            className="rounded-chip bg-surface2 px-2 py-2.5 text-center"
          >
            <dt className="text-2xs text-fg3">{stat.label}</dt>
            <dd className="tnum mt-1 text-[14px] font-bold tracking-[-0.02em] text-fg">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-[13px] leading-relaxed text-fg2">{player.reason}</p>
    </article>
  );
}
