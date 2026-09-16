'use client';

import React, { useState, useEffect } from 'react';
import { KBOGame, AIBriefing } from '../types/kbo';
import { CloseIcon, SparkIcon } from './ui/Icons';
import { TeamBadge } from './ui/TeamBadge';

interface AIBriefModalProps {
  game: KBOGame | null;
  briefingType: 'PREVIEW' | 'REVIEW' | null;
  onClose: () => void;
}

export const AIBriefModal: React.FC<AIBriefModalProps> = ({ game, briefingType, onClose }) => {
  const [briefData, setBriefData] = useState<AIBriefing | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!game || !briefingType) return;

    let isMounted = true;
    setIsLoading(true);

    const fetchAIBrief = async () => {
      try {
        const res = await fetch('/api/ai-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ game, type: briefingType }),
        });
        const json = await res.json();
        if (isMounted && json.success) {
          setBriefData(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch AI briefing:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAIBrief();

    return () => {
      isMounted = false;
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
        className="animate-fadeIn relative max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-[20px] border border-line bg-surface shadow-pop"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${game.awayTeam.name} 대 ${game.homeTeam.name} AI ${isPreview ? '프리뷰' : '요약'}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-hair px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-md bg-accent-soft px-2 py-1 text-2xs font-semibold text-accent">
                <SparkIcon size={12} />
                AI {isPreview ? '프리뷰' : '요약'}
              </span>
              <span className="tnum text-xs text-fg3">
                {game.date} · {game.stadium}
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
            <div>
              <h4 className="text-sm font-semibold text-fg">AI가 경기 브리핑을 쓰고 있습니다</h4>
              <p className="mt-1 text-xs text-fg3">선발 투수 기록, 상대 전적, 최근 타선 흐름을 확인하는 중입니다.</p>
            </div>
          </div>
        ) : briefData ? (
          <div className="custom-scrollbar max-h-[62vh] space-y-6 overflow-y-auto px-6 py-6">
            <div>
              <h4 className="text-[17px] font-bold leading-snug tracking-[-0.03em] text-fg">
                {briefData.headline}
              </h4>
              <p className="mt-2 text-[13.5px] leading-relaxed tracking-[-0.01em] text-fg2">
                {briefData.summary}
              </p>
            </div>

            <div>
              <h5 className="mb-2.5 text-2xs font-semibold uppercase tracking-[0.04em] text-fg3">
                {isPreview ? '관전 포인트' : '승패를 가른 요인'}
              </h5>
              <ul className="space-y-2">
                {briefData.keyFactors.map((factor, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-control bg-surface2 px-3.5 py-3 text-[13px] leading-relaxed text-fg"
                  >
                    <span className="tnum mt-[1px] shrink-0 text-2xs font-bold text-fg3">{idx + 1}</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="mb-2.5 text-2xs font-semibold uppercase tracking-[0.04em] text-fg3">
                선발 매치업
              </h5>
              <p className="rounded-control border border-line px-3.5 py-3 text-[13px] leading-relaxed text-fg2">
                {briefData.pitcherAnalysis}
              </p>
            </div>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-[13px] text-fg2">
            AI 리포트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-hair px-6 py-4">
          <span className="text-2xs text-fg3">OpenAI 기반 자동 생성 · 기록은 네이버 스포츠 기준</span>
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
