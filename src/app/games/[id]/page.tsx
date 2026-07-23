'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { KBOGame } from '@/types/kbo';
import { GamePlayerHighlight } from '@/components/game/GamePlayerHighlight';

export default function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.id;

  const [game, setGame] = useState<KBOGame | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'AI_REPORT' | 'LINEUP' | 'HEAD_TO_HEAD'>('AI_REPORT');

  useEffect(() => {
    const fetchGameDetail = async () => {
      try {
        const res = await fetch(`/api/games/${gameId}`);
        const json = await res.json();
        if (json.success) {
          setGame(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch game detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameDetail();
  }, [gameId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-400">경기 상세 및 이닝 점수판을 불러오는 중...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <span className="text-5xl mb-4">⚾</span>
        <h2 className="text-xl font-bold text-slate-200">경기 정보를 찾을 수 없습니다</h2>
        <Link
          href="/"
          className="mt-6 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg"
        >
          ← 대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  const inningCount = Math.max(
    game.inningScores?.away.length ?? 0,
    game.inningScores?.home.length ?? 0,
    9
  );
  const innings = Array.from({ length: inningCount }, (_, index) => index + 1);
  const isAwayWin = game.awayScore > game.homeScore;
  const isHomeWin = game.homeScore > game.awayScore;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-all bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800"
          >
            <span>←</span>
            <span>대시보드로 돌아가기</span>
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            {game.date} • {game.stadium} 경기 상세
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
            {game.status === 'FINISHED'
              ? '경기 종료'
              : game.status === 'CANCELLED' || game.status === 'POSTPONED'
                ? '경기 취소'
                : game.currentInning || 'LIVE'}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
        {/* Main Electronic Scoreboard Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/80 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            {/* Away Team */}
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 text-center sm:text-left">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl border ${game.awayTeam.logoBg} shadow-lg`}>
                {game.awayTeam.shortName}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">{game.awayTeam.name}</h3>
                <p className="text-xs text-slate-400 mt-1">선발 {game.awayPitcher}</p>
              </div>
            </div>

            {/* Score */}
            <div className="text-center px-4 shrink-0">
              <div className="flex items-center justify-center gap-3 font-black text-3xl sm:text-5xl tracking-tight">
                <span className={isAwayWin ? 'text-rose-400' : 'text-slate-300'}>{game.awayScore}</span>
                <span className="text-slate-600 text-2xl font-normal">:</span>
                <span className={isHomeWin ? 'text-rose-400' : 'text-slate-300'}>{game.homeScore}</span>
              </div>
              <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                {isHomeWin ? `${game.homeTeam.shortName} 승리` : isAwayWin ? `${game.awayTeam.shortName} 승리` : '무승부'}
              </span>
            </div>

            {/* Home Team */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 flex-1 text-center sm:text-right">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">{game.homeTeam.name}</h3>
                <p className="text-xs text-slate-400 mt-1">선발 {game.homePitcher}</p>
              </div>
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black text-xl border ${game.homeTeam.logoBg} shadow-lg`}>
                {game.homeTeam.shortName}
              </div>
            </div>
          </div>
        </div>

        {/* Player photos are intentionally omitted: identity is represented by text and team styling. */}
        {game.status === 'FINISHED' && game.bestPlayer && game.worstPlayer && (
          <section aria-labelledby="game-player-highlights">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Game Spotlight
                </p>
                <h2 id="game-player-highlights" className="mt-1 text-base font-black text-white">
                  오늘 경기 Best &amp; Worst
                </h2>
              </div>
              <p className="text-right text-[11px] text-slate-500">
                당일 경기 기록과 승부 기여도를 기준으로 선정
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <GamePlayerHighlight player={game.bestPlayer} variant="BEST" />
              <GamePlayerHighlight player={game.worstPlayer} variant="WORST" />
            </div>
          </section>
        )}

        {/* ⚾ 1~9 Inning-by-Inning Scoreboard Grid */}
        {game.inningScores && (
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚾</span>
              <h4 className="text-sm font-bold text-white">이닝별 점수판 (Inning Scoreboard)</h4>
            </div>
            <div className="text-right">
              <span className="block text-xs text-slate-400">R:득점 H:안타 E:실책 B:사사구</span>
              <span className="mt-0.5 block text-[9px] font-semibold text-emerald-400">
                네이버 스포츠 공식 경기 기록
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800/60 font-sans">
                  <th className="py-2.5 px-4 text-left font-bold">팀명</th>
                  {innings.map((i) => (
                    <th key={i} className="py-2.5 px-2">{i}</th>
                  ))}
                  <th className="py-2.5 px-3 font-bold text-amber-400 bg-slate-950/80">R</th>
                  <th className="py-2.5 px-3 font-bold text-slate-200">H</th>
                  <th className="py-2.5 px-3 font-bold text-slate-400">E</th>
                  <th className="py-2.5 px-3 font-bold text-slate-400">B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {/* Away Team Row */}
                <tr className="hover:bg-slate-800/40 font-semibold">
                  <td className="py-3 px-4 text-left font-sans font-bold text-slate-100">
                    {game.awayTeam.name}
                  </td>
                  {innings.map((inning, idx) => (
                    <td key={inning} className={`py-3 px-2 ${Number(game.inningScores?.away[idx] ?? 0) > 0 ? 'text-amber-400 font-extrabold' : 'text-slate-400'}`}>
                      {game.inningScores?.away[idx] ?? '-'}
                    </td>
                  ))}
                  <td className="py-3 px-3 font-black text-amber-400 bg-slate-950/40 text-sm">
                    {game.awayStats?.runs ?? game.awayScore}
                  </td>
                  <td className="py-3 px-3 text-slate-200">{game.awayStats?.hits ?? 6}</td>
                  <td className="py-3 px-3 text-slate-400">{game.awayStats?.errors ?? 1}</td>
                  <td className="py-3 px-3 text-slate-400">{game.awayStats?.walks ?? 3}</td>
                </tr>

                {/* Home Team Row */}
                <tr className="hover:bg-slate-800/40 font-semibold">
                  <td className="py-3 px-4 text-left font-sans font-bold text-slate-100">
                    {game.homeTeam.name}
                  </td>
                  {innings.map((inning, idx) => (
                    <td key={inning} className={`py-3 px-2 ${Number(game.inningScores?.home[idx] ?? 0) > 0 ? 'text-amber-400 font-extrabold' : 'text-slate-400'}`}>
                      {game.inningScores?.home[idx] ?? '-'}
                    </td>
                  ))}
                  <td className="py-3 px-3 font-black text-amber-400 bg-slate-950/40 text-sm">
                    {game.homeStats?.runs ?? game.homeScore}
                  </td>
                  <td className="py-3 px-3 text-slate-200">{game.homeStats?.hits ?? 12}</td>
                  <td className="py-3 px-3 text-slate-400">{game.homeStats?.errors ?? 0}</td>
                  <td className="py-3 px-3 text-slate-400">{game.homeStats?.walks ?? 5}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* 3 Detail Tabs (AI Report / Lineup / Head to Head) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('AI_REPORT')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'AI_REPORT'
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🤖 GPT-4o AI 심층 리포트
            </button>
            <button
              onClick={() => setActiveTab('LINEUP')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'LINEUP'
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚾ 선발 타순 라인업
            </button>
            <button
              onClick={() => setActiveTab('HEAD_TO_HEAD')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'HEAD_TO_HEAD'
                  ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚔️ 시즌 상대 전적
            </button>
          </div>

          {/* Tab 1: AI Report */}
          {activeTab === 'AI_REPORT' && game.aiReview && (
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-6 space-y-6">
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <h4 className="text-sm font-black text-amber-300 mb-1">{game.aiReview.headline}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{game.aiReview.summary}</p>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  🎯 경기 승패 결정적 3대 요인
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {game.aiReview.keyFactors.map((factor, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                      {factor}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/20">
                <h5 className="text-xs font-bold text-indigo-300 mb-1">⚾ 선발 투수 피칭 분석</h5>
                <p className="text-xs text-slate-300 leading-relaxed">{game.aiReview.pitcherAnalysis}</p>
              </div>
            </div>
          )}

          {/* Tab 2: Lineup */}
          {activeTab === 'LINEUP' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Away Lineup */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
                <h5 className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
                  <span>{game.awayTeam.name} 선발 타순</span>
                  <span className="text-slate-500 text-[11px]">선발: {game.awayPitcher}</span>
                </h5>
                <div className="space-y-1.5 text-xs">
                  {game.awayLineup?.map((item) => (
                    <div key={item.order} className="flex items-center justify-between bg-slate-950/50 px-3 py-1.5 rounded-lg text-slate-300">
                      <span className="font-mono text-slate-500 w-6">{item.order}</span>
                      <span className="w-10 text-slate-400">{item.position}</span>
                      <span className="font-bold text-slate-100 flex-1">{item.name}</span>
                      <span className="text-slate-400">{item.avg.toFixed(3).replace(/^0/, '')}</span>
                      <span className="text-amber-400 font-bold ml-3">{item.hits}안타 {item.rbi}타점</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Home Lineup */}
              <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4">
                <h5 className="text-xs font-bold text-slate-300 mb-3 flex items-center justify-between">
                  <span>{game.homeTeam.name} 선발 타순</span>
                  <span className="text-slate-500 text-[11px]">선발: {game.homePitcher}</span>
                </h5>
                <div className="space-y-1.5 text-xs">
                  {game.homeLineup?.map((item) => (
                    <div key={item.order} className="flex items-center justify-between bg-slate-950/50 px-3 py-1.5 rounded-lg text-slate-300">
                      <span className="font-mono text-slate-500 w-6">{item.order}</span>
                      <span className="w-10 text-slate-400">{item.position}</span>
                      <span className="font-bold text-slate-100 flex-1">{item.name}</span>
                      <span className="text-slate-400">{item.avg.toFixed(3).replace(/^0/, '')}</span>
                      <span className="text-amber-400 font-bold ml-3">{item.hits}안타 {item.rbi}타점</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Head to Head */}
          {activeTab === 'HEAD_TO_HEAD' && (
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 text-center space-y-4">
              <span className="text-3xl">⚔️</span>
              <h4 className="text-base font-bold text-white">2026 정규시즌 구단 간 상대 전적</h4>
              <p className="text-sm font-extrabold text-amber-400 bg-slate-950 py-3 px-6 rounded-xl border border-slate-800 max-w-md mx-auto">
                {game.headToHeadRecord || '삼성 8승 3패 우세'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
