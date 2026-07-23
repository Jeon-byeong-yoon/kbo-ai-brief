'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MatchCard } from '@/components/MatchCard';
import { StandingsTable } from '@/components/StandingsTable';
import { PlayerLeaderboard } from '@/components/PlayerLeaderboard';
import { HistoricalStandings } from '@/components/HistoricalStandings';
import { AIBriefModal } from '@/components/AIBriefModal';
import {
  MOCK_GAMES,
  MOCK_STANDINGS_TODAY,
  MOCK_PITCHER_LEADERS,
  MOCK_BATTER_LEADERS,
  MOCK_HISTORICAL_2025,
} from '@/lib/mock-data';
import { KBOGame } from '@/types/kbo';

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-23');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'FINISHED' | 'SCHEDULED'>('ALL');
  
  // My Favorite Team (LocalStorage sync)
  const [favoriteTeam, setFavoriteTeam] = useState<string>('HANWHA'); // 기본 한화 이글스 선호 설정

  // Load & Save Favorite Team via LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('kbo_favorite_team');
    if (saved) {
      setFavoriteTeam(saved);
    }
  }, []);

  const handleFavoriteTeamChange = (teamCode: string) => {
    setFavoriteTeam(teamCode);
    localStorage.setItem('kbo_favorite_team', teamCode);
  };

  // Right Sidebar Tab State
  const [rightSidebarTab, setRightSidebarTab] = useState<'TEAM_STANDINGS' | 'PLAYER_LEADERS' | 'HISTORICAL_2025'>('TEAM_STANDINGS');

  // Live Auto Polling State
  const [gamesState, setGamesState] = useState<KBOGame[]>(MOCK_GAMES);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  // Modal State
  const [activeModalGame, setActiveModalGame] = useState<KBOGame | null>(null);
  const [activeBriefingType, setActiveBriefingType] = useState<'PREVIEW' | 'REVIEW' | null>(null);

  // Initialize & Live Auto Polling Effect (30초 자동 갱신 시뮬레이션)
  useEffect(() => {
    setLastUpdatedTime(new Date().toLocaleTimeString('ko-KR'));
    const interval = setInterval(() => {
      setLastUpdatedTime(new Date().toLocaleTimeString('ko-KR'));
      setGamesState((prevGames) =>
        prevGames.map((g) => {
          if (g.id === 'game-20260723-1' && g.status === 'IN_PROGRESS') {
            return {
              ...g,
              homeScore: 5,
              currentInning: '8회말',
              aiReview: g.aiReview
                ? {
                    ...g.aiReview,
                    headline: '[실시간 요약] 8회말 추가 득점, LG 5-3 리드 확장',
                    summary: 'LG가 8회말 무사 1,3루 찬스에서 희생플라이로 1점을 더 보태며 승기에 한 걸음 더 다가섰습니다.',
                  }
                : g.aiReview,
            };
          }
          return g;
        })
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter & Sort Games (관심 구단 경기 최상단 핀 고정 정렬)
  const sortedFilteredGames = useMemo(() => {
    const filtered = gamesState.filter((game) => {
      // Date matching
      if (game.date !== selectedDate) return false;

      // Team matching filter
      if (selectedTeam !== 'ALL') {
        const isAway = game.awayTeam.code === selectedTeam;
        const isHome = game.homeTeam.code === selectedTeam;
        if (!isAway && !isHome) return false;
      }

      // Status matching
      if (statusFilter !== 'ALL' && game.status !== statusFilter) return false;

      return true;
    });

    // 관심 구단(My Team) 경기 최상단 핀 고정 정렬
    if (favoriteTeam && favoriteTeam !== 'NONE') {
      return [...filtered].sort((a, b) => {
        const aIsMyTeam = a.awayTeam.code === favoriteTeam || a.homeTeam.code === favoriteTeam;
        const bIsMyTeam = b.awayTeam.code === favoriteTeam || b.homeTeam.code === favoriteTeam;
        if (aIsMyTeam && !bIsMyTeam) return -1;
        if (!aIsMyTeam && bIsMyTeam) return 1;
        return 0;
      });
    }

    return filtered;
  }, [gamesState, selectedDate, selectedTeam, statusFilter, favoriteTeam]);

  // Statistics Count
  const stats = useMemo(() => {
    const todayGames = gamesState.filter((g) => g.date === selectedDate);
    return {
      total: todayGames.length,
      live: todayGames.filter((g) => g.status === 'IN_PROGRESS').length,
      finished: todayGames.filter((g) => g.status === 'FINISHED').length,
      scheduled: todayGames.filter((g) => g.status === 'SCHEDULED').length,
    };
  }, [gamesState, selectedDate]);

  const handleOpenBriefing = (game: KBOGame, type: 'PREVIEW' | 'REVIEW') => {
    setActiveModalGame(game);
    setActiveBriefingType(type);
  };

  const handleCloseModal = () => {
    setActiveModalGame(null);
    setActiveBriefingType(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white pb-16">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Navigation Bar */}
        <Header
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          selectedTeam={selectedTeam}
          onTeamSelect={setSelectedTeam}
          favoriteTeam={favoriteTeam}
          onFavoriteTeamChange={handleFavoriteTeamChange}
        />

        {/* Main Content Layout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
          {/* AI Banner / Today Summary */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/70 border border-slate-800/90 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <span>⚡</span>
                    <span>실시간 KBO AI 핫이슈</span>
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedDate} KBO 리그 • {lastUpdatedTime} 갱신
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {favoriteTeam !== 'NONE' ? (
                    <span className="flex items-center gap-2">
                      <span className="text-amber-400">⭐ [{favoriteTeam}]</span>
                      <span>잠실 라이벌 혈투! 7회말 결승타 극적 조명</span>
                    </span>
                  ) : (
                    '잠실에선 역전 혈투, 광주에선 양현종 10승 달성!'
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
                  7회말 결승타로 리드를 잡은 LG와 7이닝 1실점 호투를 펼친 KIA 양현종의 활약이 돋보이는 주중 시리즈입니다.
                </p>
              </div>

              {/* Status Pills Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 shrink-0 self-stretch md:self-auto justify-center">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  전체 ({stats.total})
                </button>
                <button
                  onClick={() => setStatusFilter('IN_PROGRESS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    statusFilter === 'IN_PROGRESS'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-rose-400 hover:text-rose-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  진행중 ({stats.live})
                </button>
                <button
                  onClick={() => setStatusFilter('FINISHED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'FINISHED'
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  종료 ({stats.finished})
                </button>
                <button
                  onClick={() => setStatusFilter('SCHEDULED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'SCHEDULED'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-indigo-400 hover:text-indigo-300'
                  }`}
                >
                  예정 ({stats.scheduled})
                </button>
              </div>
            </div>
          </div>

          {/* Grid Layout: Left (Match Cards), Right (Standings & Player Stats Tabs) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Match Cards (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>📅</span>
                  <span>{selectedDate} 경기 일정 & 스코어</span>
                  {favoriteTeam !== 'NONE' && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                      <span>⭐ MY 팀 ({favoriteTeam}) 핀 고정됨</span>
                    </span>
                  )}
                </h3>
                <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  실시간 자동 갱신중
                </span>
              </div>

              {sortedFilteredGames.length === 0 ? (
                <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center">
                  <span className="text-4xl">⚾</span>
                  <h4 className="mt-3 font-bold text-slate-300 text-sm">
                    선택한 조건의 경기가 없습니다
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    다른 날짜나 구단 필터를 선택해보세요.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedTeam('ALL');
                      setStatusFilter('ALL');
                    }}
                    className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                  >
                    필터 초기화
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedFilteredGames.map((game) => (
                    <MatchCard
                      key={game.id}
                      game={game}
                      favoriteTeam={favoriteTeam}
                      onOpenBriefing={handleOpenBriefing}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Tabbed Standings & Player Stats & Historical (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Tab Selector Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-md">
                <button
                  onClick={() => setRightSidebarTab('TEAM_STANDINGS')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    rightSidebarTab === 'TEAM_STANDINGS'
                      ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🏆 2026 팀 순위
                </button>
                <button
                  onClick={() => setRightSidebarTab('PLAYER_LEADERS')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    rightSidebarTab === 'PLAYER_LEADERS'
                      ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⭐ 선수 기록 (투수/타자)
                </button>
                <button
                  onClick={() => setRightSidebarTab('HISTORICAL_2025')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    rightSidebarTab === 'HISTORICAL_2025'
                      ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📜 2025 전년도 성적
                </button>
              </div>

              {/* Tab Content 1: Team Standings */}
              {rightSidebarTab === 'TEAM_STANDINGS' && (
                <StandingsTable
                  standings={MOCK_STANDINGS_TODAY}
                  selectedTeam={selectedTeam}
                  onTeamSelect={setSelectedTeam}
                  title={`2026 KBO 팀 순위 (${selectedDate})`}
                  subtitle="전날 대비 순위 변동(▲/▼) 반영"
                />
              )}

              {/* Tab Content 2: Player Leaderboards */}
              {rightSidebarTab === 'PLAYER_LEADERS' && (
                <PlayerLeaderboard
                  pitcherLeaders={MOCK_PITCHER_LEADERS}
                  batterLeaders={MOCK_BATTER_LEADERS}
                />
              )}

              {/* Tab Content 3: Historical Season 2025 */}
              {rightSidebarTab === 'HISTORICAL_2025' && (
                <HistoricalStandings
                  season={MOCK_HISTORICAL_2025}
                  selectedTeam={selectedTeam}
                  onTeamSelect={setSelectedTeam}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* AI Briefing Modal */}
      <AIBriefModal
        game={activeModalGame}
        briefingType={activeBriefingType}
        onClose={handleCloseModal}
      />
    </div>
  );
}
