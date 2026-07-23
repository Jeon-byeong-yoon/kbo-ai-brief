import { GamePlayerHighlight as Highlight } from '@/types/kbo';

interface GamePlayerHighlightProps {
  player: Highlight;
  variant: 'BEST' | 'WORST';
}

export function GamePlayerHighlight({ player, variant }: GamePlayerHighlightProps) {
  const isBest = variant === 'BEST';

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        isBest
          ? 'border-amber-400/30 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900'
          : 'border-rose-400/25 bg-gradient-to-br from-rose-500/10 via-slate-900 to-slate-900'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-lg font-black ${
            isBest
              ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
              : 'border-rose-400/30 bg-rose-400/10 text-rose-300'
          }`}
        >
          {player.name.slice(-2)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wider ${
                isBest
                  ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                  : 'border-rose-400/30 bg-rose-400/10 text-rose-300'
              }`}
            >
              {variant} PLAYER
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {player.playerType === 'PITCHER' ? '투수' : '타자'}
            </span>
          </div>
          <h3 className="mt-2 text-xl font-black text-white">{player.name}</h3>
          <p className="mt-0.5 text-xs font-semibold text-slate-400">
            {player.team} · {player.position}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-center">
          <span className="block text-[9px] font-bold text-slate-500">TEAM</span>
          <span className="text-sm font-black text-slate-200">{player.teamShortName}</span>
        </div>
      </div>

      <p className="mt-4 text-sm font-bold text-slate-100">{player.summary}</p>

      <dl className="mt-3 grid grid-cols-3 gap-2">
        {player.stats.slice(0, 3).map((stat) => (
          <div key={`${stat.label}-${stat.value}`} className="rounded-xl bg-slate-950/55 px-2 py-2 text-center">
            <dt className="text-[10px] font-semibold text-slate-500">{stat.label}</dt>
            <dd className="mt-0.5 text-xs font-black text-slate-200">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">{player.reason}</p>
    </article>
  );
}
