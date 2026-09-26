'use client';

import React from 'react';
import { GamePitches, Pitch, PitchResult, PitcherPitches } from '@/types/pitch';
import { TeamBadge } from '@/components/ui/TeamBadge';

/** 그림에 담을 좌우 범위 (ft). 존 폭이 ±0.83 이므로 바깥쪽 공까지 들어온다. */
const X_RANGE = 2.2;
/** 그림에 담을 높이 범위 (ft) */
const Z_MIN = 0;
const Z_MAX = 5;

const W = 260;
const H = 300;

const toX = (ft: number) => ((ft + X_RANGE) / (X_RANGE * 2)) * W;
const toY = (ft: number) => H - ((ft - Z_MIN) / (Z_MAX - Z_MIN)) * H;

const RESULT_STYLE: Record<PitchResult, { fill: string; stroke: string; label: string }> = {
  ball: { fill: 'transparent', stroke: 'rgb(var(--c-fg-3))', label: '볼' },
  'called-strike': { fill: 'rgb(var(--c-accent))', stroke: 'rgb(var(--c-accent))', label: '스트라이크' },
  // 헛스윙은 투수가 이긴 공이라 초록을 쓴다. 루킹 스트라이크와 한눈에 갈라져야 한다.
  'swinging-strike': { fill: 'rgb(var(--c-win))', stroke: 'rgb(var(--c-win))', label: '헛스윙' },
  foul: { fill: 'rgb(var(--c-fg-3))', stroke: 'rgb(var(--c-fg-3))', label: '파울' },
  'in-play': { fill: 'rgb(var(--c-live))', stroke: 'rgb(var(--c-live))', label: '타격' },
};

const ORDER: PitchResult[] = ['called-strike', 'swinging-strike', 'foul', 'in-play', 'ball'];

/** 타자마다 존 높이가 달라서, 그려 주는 상자는 중앙값으로 잡는다. */
function medianZone(pitches: Pitch[]): { bottom: number; top: number } {
  const mid = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)] ?? 0;
  };
  return { bottom: mid(pitches.map((p) => p.zoneBottom)), top: mid(pitches.map((p) => p.zoneTop)) };
}

const ZoneChart: React.FC<{ pitches: Pitch[] }> = ({ pitches }) => {
  const zone = medianZone(pitches);
  const half = 0.83;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[260px]" role="img" aria-label="투구 위치">
      <rect x={0} y={0} width={W} height={H} rx={10} fill="rgb(var(--c-surface-2))" />

      {/* 스트라이크존. 3x3 격자는 존 안쪽 위치를 가늠하는 용도다 */}
      <rect
        x={toX(-half)}
        y={toY(zone.top)}
        width={toX(half) - toX(-half)}
        height={toY(zone.bottom) - toY(zone.top)}
        fill="rgb(var(--c-surface))"
        stroke="rgb(var(--c-fg-3))"
        strokeWidth={1.5}
      />
      {[1, 2].map((i) => (
        <g key={i} stroke="rgb(var(--c-hair))" strokeWidth={1}>
          <line
            x1={toX(-half + (half * 2 * i) / 3)}
            y1={toY(zone.top)}
            x2={toX(-half + (half * 2 * i) / 3)}
            y2={toY(zone.bottom)}
          />
          <line
            x1={toX(-half)}
            y1={toY(zone.top + ((zone.bottom - zone.top) * i) / 3)}
            x2={toX(half)}
            y2={toY(zone.top + ((zone.bottom - zone.top) * i) / 3)}
          />
        </g>
      ))}

      {/* 홈플레이트 */}
      <path
        d={`M ${toX(-half)} ${H - 16} L ${toX(half)} ${H - 16} L ${toX(half)} ${H - 9} L ${toX(0)} ${H - 4} L ${toX(-half)} ${H - 9} Z`}
        fill="rgb(var(--c-hair))"
      />

      {pitches.map((p) => {
        const st = RESULT_STYLE[p.result];
        return (
          <circle
            key={p.id}
            cx={toX(p.plateX)}
            cy={toY(p.plateZ)}
            r={5.5}
            fill={st.fill}
            stroke={st.stroke}
            strokeWidth={1.5}
            opacity={0.92}
          >
            <title>
              {`${p.inning}회 ${p.batterName} · ${p.pitchNumber}구 ${p.resultText} · ${p.speed.toFixed(0)}km/h`}
            </title>
          </circle>
        );
      })}
    </svg>
  );
};

const Legend: React.FC = () => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
    {ORDER.map((r) => {
      const st = RESULT_STYLE[r];
      return (
        <span key={r} className="flex items-center gap-1.5 text-2xs text-fg3">
          <svg width={11} height={11} aria-hidden>
            <circle cx={5.5} cy={5.5} r={4.5} fill={st.fill} stroke={st.stroke} strokeWidth={1.5} />
          </svg>
          {st.label}
        </span>
      );
    })}
  </div>
);

const stat = 'tnum text-[13px] font-semibold text-fg';
const statLabel = 'text-2xs text-fg3';

export const StrikeZone: React.FC<{
  data: GamePitches;
  awayTeam: { code: string; shortName: string };
  homeTeam: { code: string; shortName: string };
}> = ({ data, awayTeam, homeTeam }) => {
  const groups: Array<{ team: { code: string; shortName: string }; pitchers: PitcherPitches[] }> = [
    { team: awayTeam, pitchers: data.awayPitchers },
    { team: homeTeam, pitchers: data.homePitchers },
  ];

  const first = data.awayPitchers[0]?.pitcherCode ?? data.homePitchers[0]?.pitcherCode ?? '';
  const [selected, setSelected] = React.useState(first);

  const all = [...data.awayPitchers, ...data.homePitchers];
  const current = all.find((p) => p.pitcherCode === selected) ?? all[0];
  if (!current) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        {groups.map(({ team, pitchers }) =>
          pitchers.length === 0 ? null : (
            <div key={team.code} className="flex flex-wrap items-center gap-1.5">
              <TeamBadge team={team.code} fallbackLabel={team.shortName} size={18} radius={6} />
              {pitchers.map((p) => (
                <button
                  key={p.pitcherCode}
                  type="button"
                  onClick={() => setSelected(p.pitcherCode)}
                  className={`rounded-chip px-2.5 py-1 text-2xs transition ${
                    p.pitcherCode === selected
                      ? 'bg-accent font-semibold text-white'
                      : 'bg-surface2 font-medium text-fg2 hover:text-fg'
                  }`}
                >
                  {p.pitcherName}
                  <span className="tnum ml-1 opacity-70">{p.pitches.length}</span>
                </button>
              ))}
            </div>
          ),
        )}
      </div>

      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-start">
        <div className="flex w-full flex-col items-center gap-2.5 sm:w-auto">
          <ZoneChart pitches={current.pitches} />
          <Legend />
          <p className="text-2xs text-fg3">포수 시점</p>
        </div>

        <div className="grid w-full grid-cols-2 gap-x-4 gap-y-3 sm:max-w-[240px]">
          <div>
            <p className={statLabel}>투구수</p>
            <p className={stat}>{current.pitches.length}</p>
          </div>
          <div>
            <p className={statLabel}>최고 구속</p>
            <p className={stat}>{current.maxSpeed.toFixed(0)} km/h</p>
          </div>
          <div>
            <p className={statLabel}>평균 구속</p>
            <p className={stat}>{current.avgSpeed.toFixed(0)} km/h</p>
          </div>
          <div>
            <p className={statLabel}>존 통과</p>
            <p className={stat}>{(current.zoneRate * 100).toFixed(0)}%</p>
          </div>
          <div>
            <p className={statLabel}>헛스윙</p>
            <p className={stat}>{(current.whiffRate * 100).toFixed(0)}%</p>
          </div>
          <div>
            <p className={statLabel}>경기 전체</p>
            <p className={stat}>{data.total}구</p>
          </div>
        </div>
      </div>

      <p className="text-2xs leading-relaxed text-fg3">
        구장에서 측정한 추적 데이터다. 구속은 릴리스 시점 속도이고, 위치는 홈플레이트를
        지날 때의 좌표다. 스트라이크존 상하한은 타자마다 달라서 상자는 이 투수가 상대한
        타자들의 중앙값으로 그렸다.
      </p>
    </div>
  );
};
