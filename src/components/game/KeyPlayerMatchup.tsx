'use client';

import React, { useState } from 'react';
import { GamePreview, HotColdCell, KeyPlayer } from '@/types/preview';
import { findTeam, teamColors } from '@/lib/team-assets';
import { TeamBadge } from '@/components/ui/TeamBadge';

const rate = (n: number) => n.toFixed(3).replace(/^0/, '');

/**
 * 존별 타율 단계(1~5)를 색으로 바꾼다. 라이트·다크 배경 모두에서 읽히도록
 * 토큰 색 위에 알파를 얹는 방식으로 쓴다.
 */
const HEAT: Record<number, { bg: string; solid: boolean }> = {
  5: { bg: 'rgba(223, 82, 56, 0.92)', solid: true },
  4: { bg: 'rgba(223, 82, 56, 0.40)', solid: false },
  3: { bg: 'rgba(128, 141, 158, 0.16)', solid: false },
  2: { bg: 'rgba(47, 107, 232, 0.30)', solid: false },
  1: { bg: 'rgba(47, 107, 232, 0.82)', solid: true },
};

const Cell: React.FC<{ cell?: HotColdCell; small?: boolean }> = ({ cell, small }) => {
  const heat = HEAT[cell?.step ?? 3] ?? HEAT[3];
  return (
    <div
      title={cell ? `타율 ${rate(cell.avg)} · 삼진 ${cell.strikeoutRate}%` : undefined}
      className={`tnum flex items-center justify-center rounded-[3px] font-semibold ${
        small ? 'h-[22px] text-[9.5px]' : 'h-[26px] text-[10.5px]'
      } ${heat.solid ? 'text-white' : 'text-fg2'}`}
      style={{ background: heat.bg }}
    >
      {cell ? rate(cell.avg) : ''}
    </div>
  );
};

/**
 * 핫/콜드 존. zone 1~9 가 스트라이크 존 3×3(왼쪽 위부터), 10~13 이 존 바깥 네 구석이다.
 * 포수 시점 그대로 그리며 좌·우타자에 따라 뒤집지 않는다(네이버와 동일).
 */
const HotColdZone: React.FC<{ zones: HotColdCell[]; label: string }> = ({ zones, label }) => {
  const byZone = new Map(zones.map((z) => [z.zone, z]));

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex w-[152px] flex-col gap-[3px]">
        <div className="grid grid-cols-2 gap-[3px]">
          <Cell cell={byZone.get(10)} small />
          <Cell cell={byZone.get(11)} small />
        </div>
        <div className="grid grid-cols-3 gap-[3px] px-[22px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((z) => (
            <Cell key={z} cell={byZone.get(z)} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-[3px]">
          <Cell cell={byZone.get(12)} small />
          <Cell cell={byZone.get(13)} small />
        </div>
      </div>
      <span className="text-xs font-semibold text-fg2">{label}</span>
    </div>
  );
};

const PlayerHead: React.FC<{ player: KeyPlayer; teamCode: string; align: 'left' | 'right' }> = ({
  player,
  teamCode,
  align,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center gap-2`}>
      <div className="flex h-[76px] w-[76px] items-end justify-center overflow-hidden rounded-full bg-surface2">
        {imageFailed ? (
          <TeamBadge team={teamCode} size={44} radius={14} className="mb-3" />
        ) : (
          // 네이버가 주는 선수 프로필 사진. 없는 선수는 구단 배지로 떨어진다.
          // referrerPolicy 가 없으면 Referer 를 보고 403 을 준다(핫링크 차단).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.imageUrl}
            alt={player.name}
            referrerPolicy="no-referrer"
            className="h-[80px] w-[80px] object-contain object-bottom"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>
      <div className={`min-w-0 text-center`} data-align={align}>
        <div className="truncate text-[15px] font-bold tracking-[-0.03em] text-fg">{player.name}</div>
        <div className="tnum text-2xs text-fg3">
          #{player.backNumber} · {player.hitType}
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; left: React.ReactNode; right: React.ReactNode; strong?: boolean }> = ({
  label,
  left,
  right,
  strong,
}) => (
  <div className="grid grid-cols-[1fr_84px_1fr] items-center gap-2 border-t border-hair py-2.5">
    <div className={`tnum text-right ${strong ? 'text-[15px] font-bold text-fg' : 'text-[13px] text-fg2'}`}>
      {left}
    </div>
    <div className="text-center text-2xs font-semibold text-fg3">{label}</div>
    <div className={`tnum text-left ${strong ? 'text-[15px] font-bold text-fg' : 'text-[13px] text-fg2'}`}>
      {right}
    </div>
  </div>
);

export const KeyPlayerMatchup: React.FC<{ preview: GamePreview }> = ({ preview }) => {
  const away = preview.away.player;
  const home = preview.home.player;
  if (!away || !home) return null;

  const awayColor = teamColors(findTeam(preview.away.teamCode), 'light')[0];
  const homeColor = teamColors(findTeam(preview.home.teamCode), 'light')[0];

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h5 className="text-2xs font-semibold uppercase tracking-[0.04em] text-fg3">
          키플레이어 — 최근 흐름이 좋은 타자
        </h5>
        {preview.seasonVs && (
          <span className="tnum text-2xs text-fg3">
            시즌 상대전적 {preview.seasonVs.wins}승 {preview.seasonVs.losses}패
            {preview.seasonVs.draws > 0 ? ` ${preview.seasonVs.draws}무` : ''}
          </span>
        )}
      </div>

      <div className="rounded-control border border-line p-4">
        {/* 선수 헤드 */}
        <div className="flex items-start gap-3">
          <PlayerHead player={away} teamCode={preview.away.teamCode} align="right" />
          <div className="flex flex-col items-center gap-1 pt-7">
            <span className="text-2xs text-fg3">VS</span>
          </div>
          <PlayerHead player={home} teamCode={preview.home.teamCode} align="left" />
        </div>

        {/* 팀 색 구분 바 */}
        <div className="mt-3 flex h-[3px] overflow-hidden rounded-full">
          <span className="flex-1" style={{ background: awayColor }} />
          <span className="flex-1" style={{ background: homeColor }} />
        </div>

        {/* 비교 */}
        <div className="mt-1">
          <Row label="타율" strong left={rate(away.season.avg)} right={rate(home.season.avg)} />
          <Row label="안타" left={away.season.hits} right={home.season.hits} />
          <Row label="홈런" left={away.season.homeRuns} right={home.season.homeRuns} />
          <Row label="타점" left={away.season.rbi} right={home.season.rbi} />
          <Row
            label="상대전적"
            left={
              <>
                타율 {rate(away.vsOpponent.avg)}
                <span className="block text-2xs text-fg3">
                  안타 {away.vsOpponent.hits} · 홈런 {away.vsOpponent.homeRuns}
                </span>
              </>
            }
            right={
              <>
                타율 {rate(home.vsOpponent.avg)}
                <span className="block text-2xs text-fg3">
                  안타 {home.vsOpponent.hits} · 홈런 {home.vsOpponent.homeRuns}
                </span>
              </>
            }
          />
          <Row
            label="최근 5경기"
            left={
              <>
                <span className="font-semibold text-accent">타율 {rate(away.recentFive.avg)}</span>
                <span className="block text-2xs text-fg3">
                  안타 {away.recentFive.hits} · 홈런 {away.recentFive.homeRuns}
                </span>
              </>
            }
            right={
              <>
                <span className="font-semibold text-accent">타율 {rate(home.recentFive.avg)}</span>
                <span className="block text-2xs text-fg3">
                  안타 {home.recentFive.hits} · 홈런 {home.recentFive.homeRuns}
                </span>
              </>
            }
          />
        </div>
      </div>

      {/* 핫/콜드 존 */}
      <div className="mt-4 rounded-control bg-surface2 px-4 py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h5 className="text-2xs font-semibold uppercase tracking-[0.04em] text-fg3">
            Hot &amp; Cold Zone
          </h5>
          <div className="flex items-center gap-1.5">
            <span className="text-2xs text-fg3">낮음</span>
            {[1, 2, 3, 4, 5].map((step) => (
              <span
                key={step}
                className="h-[10px] w-[14px] rounded-[2px]"
                style={{ background: HEAT[step].bg }}
              />
            ))}
            <span className="text-2xs text-fg3">높음</span>
          </div>
        </div>
        <div className="flex justify-center gap-8">
          <HotColdZone zones={away.hotColdZone} label={away.name} />
          <HotColdZone zones={home.hotColdZone} label={home.name} />
        </div>
        <p className="mt-3 text-center text-2xs text-fg3">
          포수 시점 기준 존별 타율. 칸에 커서를 올리면 삼진 비율도 볼 수 있습니다.
        </p>
      </div>
    </section>
  );
};
