'use client';

import React from 'react';
import { KBOGame } from '../types/kbo';

interface AIBriefModalProps {
  game: KBOGame | null;
  briefingType: 'PREVIEW' | 'REVIEW' | null;
  onClose: () => void;
}

export const AIBriefModal: React.FC<AIBriefModalProps> = ({
  game,
  briefingType,
  onClose,
}) => {
  if (!game || !briefingType) return null;

  const isPreview = briefingType === 'PREVIEW';
  const briefData = isPreview ? game.aiPreview : game.aiReview;

  if (!briefData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${
                isPreview
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {isPreview ? '🔮' : '📊'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isPreview
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {isPreview ? 'KBO AI Match Preview' : 'KBO AI Match Review'}
                </span>
                <span className="text-xs text-slate-400">
                  {game.date} • {game.stadium}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">
                {game.awayTeam.name} vs {game.homeTeam.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Headline */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
            <h4 className="text-sm font-black text-amber-300 leading-snug">
              {briefData.headline}
            </h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {briefData.summary}
            </p>
          </div>

          {/* Key Factors Bullet Points */}
          <div>
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>🎯</span>
              <span>{isPreview ? 'AI 핵심 관전 포인트' : '경기 승패 결정적 요인'}</span>
            </h5>
            <ul className="space-y-2.5">
              {briefData.keyFactors.map((factor, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-slate-800/50"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pitcher Matchup Details */}
          <div className="bg-gradient-to-r from-slate-950 to-indigo-950/40 rounded-2xl p-4 border border-slate-800">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>⚾</span>
              <span>선발 투수 매치업 심층 분석</span>
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              {briefData.pitcherAnalysis}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            * OpenAI GPT-4o 야구 전문 분석 데이터 엔지니어링 모델 제공
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-all"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
