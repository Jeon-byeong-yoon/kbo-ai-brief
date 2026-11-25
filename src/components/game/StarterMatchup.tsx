'use client';

import React from 'react';
import { GamePreview, StarterLine, TeamForm } from '@/types/preview';
import { TeamBadge } from '@/components/ui/TeamBadge';

const label = 'text-2xs text-fg3';
const value = 'tnum text-[13px] font-semibold text-fg';

/**
 * 선발 맞대결과 팀 흐름.
 *
 * 전부 네이버가 준 실제 수치다. 문장을 지어내지 않는다. 값이 없으면 칸을 비운다.
 */
const StarterCard: React.FC<{
  side: '원정' | '홈';
  teamCode: string;
  teamName: string;
  starter: StarterLine | null;
  form: TeamForm | null;
  opponentName: string;
}> = ({ side, teamCode, teamName, starter, form, opponentName }) => (
  <div className="flex min-w-0 flex-col gap-3 rounded-control border border-line p-3.5">
    <div className="flex items-center gap-2">
      <TeamBadge team={teamCode} fallbackLabel={teamName} size={22} radius={7} />
      <span className="truncate text-[13px] font-bold tracking-[-0.02em] text-fg">{teamName}</span>
      <span className="ml-auto shrink-0 text-2xs text-fg3">{side}</span>
    </div>

    {form && (
      <div className="grid grid-cols-3 gap-x-3 gap-y-2">
        <div>
          <p className={label}>순위</p>
          <p className={value}>{form.rank}위</p>
        </div>
        <div>
          <p className={label}>승률</p>
          <p className={value}>{form.winRate.replace(/^0/, '')}</p>
        </div>
        <div>
          <p className={label}>성적</p>
          <p className={value}>
            {form.wins}-{form.losses}
            {form.draws > 0 ? `-${form.draws}` : ''}
          </p>
        </div>
        <div>
          <p className={label}>팀 타율</p>
          <p className={value}>{form.battingAvg.replace(/^0/, '')}</p>
        </div>
        <div>
          <p className={label}>팀 ERA</p>
          <p className={value}>{form.era}</p>
        </div>
        <div>
          <p className={label}>홈런</p>
          <p className={value}>{form.homeRuns}</p>
        </div>
      </div>
    )}

    {starter ? (
      <div className="border-t border-hair pt-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-bold tracking-[-0.02em] text-fg">{starter.name}</span>
          {starter.backNumber && (
            <span className="tnum text-2xs text-fg3">No.{starter.backNumber}</span>
          )}
          {starter.hitType && <span className="text-2xs text-fg3">{starter.hitType}</span>}
        </div>

        <p className="tnum mt-1.5 text-[12.5px] text-fg2">
          {starter.games}경기 {starter.wins}승 {starter.losses}패
          {starter.saves > 0 ? ` ${starter.saves}세` : ''} · {starter.innings}이닝
        </p>
        <p className="tnum text-[12.5px] text-fg2">
          ERA {starter.era} · WHIP {starter.whip} · {starter.strikeouts}삼진 {starter.walks}볼넷
        </p>

        {starter.vsOpponent && (
          <p className="tnum mt-1.5 text-2xs text-fg3">
            {opponentName} 상대 {starter.vsOpponent.games}경기 {starter.vsOpponent.innings}이닝
            ERA {starter.vsOpponent.era}
          </p>
        )}

        {starter.pitchKinds.length > 0 && (
          <div className="mt-2.5 flex flex-col gap-1">
            {starter.pitchKinds.map((k) => (
              <div key={k.type} className="flex items-center gap-2">
                <span className="w-[52px] shrink-0 text-2xs text-fg2">{k.label}</span>
                <div className="h-[5px] min-w-0 flex-1 overflow-hidden rounded-chip bg-surface2">
                  <div className="h-full rounded-chip bg-accent" style={{ width: `${k.rate}%` }} />
                </div>
                <span className="tnum w-[30px] shrink-0 text-right text-2xs text-fg3">
                  {k.rate.toFixed(0)}%
                </span>
                <span className="tnum w-[52px] shrink-0 text-right text-2xs text-fg3">
                  {k.speed}km/h
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    ) : (
      <p className="border-t border-hair pt-3 text-2xs text-fg3">선발이 아직 예고되지 않았습니다.</p>
    )}

    {form && form.recent.length > 0 && (
      <div className="border-t border-hair pt-3">
        <p className={`${label} pb-1.5`}>최근 {form.recent.length}경기</p>
        <div className="flex flex-col gap-1">
          {form.recent.map((g) => (
            <div key={g.date + g.opponent} className="flex items-center gap-2 text-2xs">
              <span
                className={`w-[22px] shrink-0 rounded px-1 py-0.5 text-center font-bold ${
                  g.result === '승'
                    ? 'bg-win-soft text-win'
                    : g.result === '패'
                      ? 'bg-lose-soft text-lose'
                      : 'bg-surface2 text-fg3'
                }`}
              >
                {g.result}
              </span>
              <span className="tnum w-[34px] shrink-0 text-fg2">{g.score}</span>
              <span className="truncate text-fg3">vs {g.opponent}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export const StarterMatchup: React.FC<{ preview: GamePreview }> = ({ preview }) => {
  const vs = preview.seasonVs;
  const played = vs ? vs.wins + vs.losses + vs.draws : 0;
  const awayShare = vs && vs.wins + vs.losses > 0 ? (vs.wins / (vs.wins + vs.losses)) * 100 : 50;

  return (
    <div className="flex flex-col gap-4">
      {vs && played > 0 && (
        <div>
          <div className="flex items-baseline justify-between gap-2 pb-1.5">
            <h5 className="text-2xs font-semibold uppercase tracking-[0.04em] text-fg3">
              올 시즌 상대전적
            </h5>
            <span className="tnum text-2xs text-fg3">{played}경기</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="tnum w-[86px] shrink-0 text-[12.5px] font-semibold text-fg">
              {vs.wins}승 {vs.losses}패{vs.draws > 0 ? ` ${vs.draws}무` : ''}
            </span>
            <div className="flex h-[16px] min-w-0 flex-1 overflow-hidden rounded-chip bg-surface2">
              <div className="h-full bg-accent" style={{ width: `${awayShare}%` }} />
            </div>
            <span className="tnum w-[86px] shrink-0 text-right text-[12.5px] font-semibold text-fg">
              {vs.losses}승 {vs.wins}패{vs.draws > 0 ? ` ${vs.draws}무` : ''}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StarterCard
          side="원정"
          teamCode={preview.away.teamCode}
          teamName={preview.away.teamName}
          starter={preview.awayStarter}
          form={preview.awayForm}
          opponentName={preview.home.teamName}
        />
        <StarterCard
          side="홈"
          teamCode={preview.home.teamCode}
          teamName={preview.home.teamName}
          starter={preview.homeStarter}
          form={preview.homeForm}
          opponentName={preview.away.teamName}
        />
      </div>
    </div>
  );
};
