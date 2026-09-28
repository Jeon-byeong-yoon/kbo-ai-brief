'use client';

import React, { useEffect, useState } from 'react';
import { KBOGame } from '../types/kbo';
import { GameDetail } from '@/lib/game-detail';
import { GamePreview } from '@/types/preview';
import { CloseIcon, ChartIcon } from './ui/Icons';
import { TeamBadge } from './ui/TeamBadge';
import { KeyPlayerMatchup } from './game/KeyPlayerMatchup';
import { StarterMatchup } from './game/StarterMatchup';

interface AIBriefModalProps {
  game: KBOGame | null;
  briefingType: 'PREVIEW' | 'REVIEW' | null;
  onClose: () => void;
}

const Cell: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-2xs text-fg3">{label}</p>
    <p className="tnum text-[15px] font-bold tracking-[-0.02em] text-fg">{value}</p>
  </div>
);

/** 끝난 경기 요약. 전부 실제 기록이다. */
const GameResult: React.FC<{ game: KBOGame; detail: GameDetail | null }> = ({ game, detail }) => {
  const innings = Math.max(
    detail?.inningScores?.away.length ?? 9,
    detail?.inningScores?.home.length ?? 9,
    9,
  );
  const rows = detail
    ? [
        { team: detail.awayTeam, scores: detail.inningScores?.away ?? [], rheb: detail.awayRheb },
        { team: detail.homeTeam, scores: detail.inningScores?.home ?? [], rheb: detail.homeRheb },
      ]
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-5 rounded-control border border-line py-4">
        <div className="flex items-center gap-2.5">
          <TeamBadge team={game.awayTeam.code} fallbackLabel={game.awayTeam.shortName} size={30} radius={9} />
          <span className="text-[13px] font-semibold text-fg">{game.awayTeam.shortName}</span>
        </div>
        <span className="tnum text-2xl font-bold tracking-[-0.04em] text-fg">
          <span className={game.awayScore > game.homeScore ? 'text-fg' : 'text-fg3'}>
            {game.awayScore}
          </span>
          <span className="mx-2 text-base font-medium text-fg3">:</span>
          <span className={game.homeScore > game.awayScore ? 'text-fg' : 'text-fg3'}>
            {game.homeScore}
          </span>
        </span>
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-semibold text-fg">{game.homeTeam.shortName}</span>
          <TeamBadge team={game.homeTeam.code} fallbackLabel={game.homeTeam.shortName} size={30} radius={9} />
        </div>
      </div>

      {rows.length > 0 && (
        <div className="custom-scrollbar -mx-1 overflow-x-auto px-1">
          <table className="w-full border-collapse" style={{ minWidth: 420 }}>
            <thead>
              <tr className="text-2xs font-semibold text-fg3">
                <th className="pb-2 text-left">팀</th>
                {Array.from({ length: innings }, (_, i) => (
                  <th key={i} className="pb-2 text-center">
                    {i + 1}
                  </th>
                ))}
                {['R', 'H', 'E', 'B'].map((h) => (
                  <th key={h} className="pb-2 text-center">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.team.code}>
                  <td className="border-t border-hair py-2 text-left text-[12.5px] font-semibold text-fg">
                    {r.team.shortName}
                  </td>
                  {Array.from({ length: innings }, (_, i) => (
                    <td key={i} className="tnum border-t border-hair py-2 text-center text-[12.5px] text-fg2">
                      {r.scores[i] ?? '-'}
                    </td>
                  ))}
                  {[r.rheb?.runs, r.rheb?.hits, r.rheb?.errors, r.rheb?.walks].map((v, i) => (
                    <td
                      key={i}
                      className={`tnum border-t border-hair py-2 text-center text-[12.5px] ${i === 0 ? 'font-bold text-fg' : 'text-fg2'}`}
                    >
                      {v ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(detail?.winPitcher || detail?.losePitcher) && (
        <div className="grid grid-cols-2 gap-3 rounded-control bg-surface2 px-3.5 py-3">
          {detail.winPitcher && <Cell label="승리 투수" value={detail.winPitcher} />}
          {detail.losePitcher && <Cell label="패전 투수" value={detail.losePitcher} />}
        </div>
      )}
    </div>
  );
};

export const AIBriefModal: React.FC<AIBriefModalProps> = ({ game, briefingType, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [preview, setPreview] = useState<GamePreview | null>(null);
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!game || !briefingType) return;
    let alive = true;
    setIsLoading(true);
    setPreview(null);
    setDetail(null);
    setError('');

    // 경기 전이면 프리뷰(선발·팀 흐름·상대전적), 끝난 경기면 실제 기록을 받는다.
    const url = briefingType === 'PREVIEW' ? `/api/games/${game.id}/preview` : `/api/games/${game.id}`;
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (!j.success) {
          setError(j.error ?? '경기 정보를 불러오지 못했습니다.');
          return;
        }
        if (briefingType === 'PREVIEW') setPreview(j.data);
        else setDetail(j.data);
      })
      .catch(() => alive && setError('경기 정보를 불러오지 못했습니다.'))
      .finally(() => alive && setIsLoading(false));

    return () => {
      alive = false;
    };
  }, [game, briefingType]);

  // 열려 있는 동안 Esc 로 닫고, 뒤 배경이 스크롤되지 않게 한다.
  useEffect(() => {
    if (!game || !briefingType) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [game, briefingType, onClose]);

  if (!game || !briefingType) return null;
  const isPreview = briefingType === 'PREVIEW';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-fg/25 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="animate-fadeIn relative max-h-[88vh] w-full max-w-[760px] overflow-hidden rounded-[20px] border border-line bg-surface shadow-pop"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${game.awayTeam.name} 대 ${game.homeTeam.name} ${isPreview ? '프리뷰' : '결과'}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-hair px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-md bg-accent-soft px-2 py-1 text-2xs font-semibold text-accent">
                <ChartIcon size={12} />
                {isPreview ? '경기 브리핑' : '경기 결과'}
              </span>
              <span className="tnum text-xs text-fg3">
                {game.date}
                {game.stadium ? ` · ${game.stadium}` : ''}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-2.5">
              <TeamBadge team={game.awayTeam.code} fallbackLabel={game.awayTeam.shortName} size={30} radius={9} />
              <h3 className="truncate text-[17px] font-bold tracking-[-0.03em] text-fg">
                {game.awayTeam.name}
                <span className="mx-2 text-sm font-medium text-fg3">vs</span>
                {game.homeTeam.name}
              </h3>
              <TeamBadge team={game.homeTeam.code} fallbackLabel={game.homeTeam.shortName} size={30} radius={9} />
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface2 text-fg2 transition-colors hover:text-fg"
          >
            <CloseIcon />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4 px-6 py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
            <p className="text-xs text-fg3">기록을 불러오는 중입니다.</p>
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center text-[13px] text-fg2">{error}</div>
        ) : (
          <div className="custom-scrollbar max-h-[64vh] space-y-6 overflow-y-auto px-6 py-6">
            {isPreview && preview && <StarterMatchup preview={preview} />}
            {isPreview && preview && <KeyPlayerMatchup preview={preview} />}
            {!isPreview && <GameResult game={game} detail={detail} />}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-hair px-6 py-4">
          <span className="text-2xs text-fg3">
            네이버 스포츠 기록 기준 · 모든 값은 실제 기록이며 문장을 생성하지 않습니다
          </span>
          <button
            onClick={onClose}
            className="rounded-[9px] bg-surface2 px-4 py-2 text-[12.5px] font-semibold text-fg transition-colors hover:bg-track"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
