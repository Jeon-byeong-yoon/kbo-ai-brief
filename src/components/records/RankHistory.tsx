'use client';

import React from 'react';
import { RankHistory as RankHistoryData } from '@/types/rank-history';
import { TEAM_ASSETS, TeamCode } from '@/lib/team-assets';
import { TeamBadge } from '@/components/ui/TeamBadge';

const W = 960;
const H = 360;
const PAD = { top: 18, right: 34, bottom: 24, left: 30 };

/** 구단 상징색을 CSS 변수로 넘긴다. 라이트/다크 선택은 globals.css 의 .team-line 이 한다. */
function lineVars(code: string): React.CSSProperties {
  const asset = TEAM_ASSETS[code as TeamCode];
  return {
    '--team-fg': asset?.light[0] ?? '#5A6069',
    '--team-fg-dark': asset?.dark[0] ?? '#C9CDD3',
  } as React.CSSProperties;
}

export const RankHistory: React.FC<{ data: RankHistoryData }> = ({ data }) => {
  const [focus, setFocus] = React.useState<string | null>(null);

  const count = data.dates.length;
  const teamCount = data.teams.length;
  if (count < 2 || teamCount === 0) return null;

  const x = (i: number) => PAD.left + (i / (count - 1)) * (W - PAD.left - PAD.right);
  const y = (rank: number) =>
    PAD.top + ((rank - 1) / Math.max(teamCount - 1, 1)) * (H - PAD.top - PAD.bottom);

  // 월이 바뀌는 지점에 눈금을 둔다.
  const monthTicks: Array<{ i: number; label: string }> = [];
  data.dates.forEach((d, i) => {
    const month = d.slice(5, 7);
    if (i === 0 || data.dates[i - 1].slice(5, 7) !== month) {
      monthTicks.push({ i, label: `${Number(month)}월` });
    }
  });

  return (
    <section className="rounded-card border border-line bg-surface px-5 pb-4 pt-4 shadow-card">
      <div className="flex items-baseline justify-between gap-3 pb-3">
        <h2 className="text-[15px] font-bold tracking-[-0.025em] text-fg">순위 변동</h2>
        <span className="tnum text-2xs text-fg3">
          {data.dates[0]} ~ {data.dates[count - 1]}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 pb-3">
        {data.teams.map((t) => (
          <button
            key={t.teamCode}
            type="button"
            onClick={() => setFocus(focus === t.teamCode ? null : t.teamCode)}
            className={`flex items-center gap-1.5 rounded-chip px-2 py-1 text-2xs transition ${
              focus === t.teamCode
                ? 'bg-accent font-semibold text-white'
                : 'bg-surface2 font-medium text-fg2 hover:text-fg'
            }`}
          >
            <TeamBadge team={t.teamCode} fallbackLabel={t.shortName} size={15} radius={5} />
            {t.shortName}
          </button>
        ))}
      </div>

      <div className="custom-scrollbar -mx-1 overflow-x-auto px-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" role="img" aria-label="순위 변동">
          {Array.from({ length: teamCount }, (_, i) => i + 1).map((rank) => (
            <g key={rank}>
              <line
                x1={PAD.left}
                y1={y(rank)}
                x2={W - PAD.right}
                y2={y(rank)}
                stroke="rgb(var(--c-hair))"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y(rank) + 4}
                textAnchor="end"
                className="fill-fg3"
                style={{ fontSize: 11 }}
              >
                {rank}
              </text>
            </g>
          ))}

          {monthTicks.map((t) => (
            <g key={t.i}>
              <line
                x1={x(t.i)}
                y1={PAD.top}
                x2={x(t.i)}
                y2={H - PAD.bottom}
                stroke="rgb(var(--c-hair))"
                strokeWidth={1}
              />
              <text
                x={x(t.i)}
                y={H - PAD.bottom + 15}
                textAnchor="middle"
                className="fill-fg3"
                style={{ fontSize: 11 }}
              >
                {t.label}
              </text>
            </g>
          ))}

          {data.teams.map((t) => {
            const d = t.ranks.map((r, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(r).toFixed(1)}`).join(' ');
            const dim = focus !== null && focus !== t.teamCode;
            return (
              <path
                key={t.teamCode}
                d={d}
                className="team-line"
                style={lineVars(t.teamCode)}
                fill="none"
                strokeWidth={focus === t.teamCode ? 3 : 1.8}
                strokeOpacity={dim ? 0.18 : 1}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}

          {data.teams.map((t) => (
            <text
              key={t.teamCode}
              x={W - PAD.right + 6}
              y={y(t.finalRank) + 4}
              className={focus !== null && focus !== t.teamCode ? 'fill-fg3' : 'fill-fg'}
              style={{ fontSize: 10, fontWeight: 600 }}
              opacity={focus !== null && focus !== t.teamCode ? 0.3 : 1}
            >
              {t.shortName}
            </text>
          ))}
        </svg>
      </div>

      <p className="pt-2 text-2xs leading-relaxed text-fg3">
        경기가 있었던 날마다 그날 경기를 모두 반영한 뒤의 순위입니다. 네이버에 일자별 순위
        API 가 없어 정규시즌 일정을 날짜순으로 쌓아 만들었습니다. 승률은{' '}
        {data.rule === 'include-draws'
          ? '무승부를 포함한 승 / (승 + 패 + 무)'
          : '무승부를 뺀 승 / (승 + 패)'}{' '}
        로, 그 시즌 순위표와 대조해 알아낸 규정을 따릅니다. 동률은 승수·패수 순으로
        갈랐습니다.
      </p>
    </section>
  );
};
