'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MatchCard } from '@/components/MatchCard';
import { StandingsTable } from '@/components/StandingsTable';
import { PlayerLeaderboard } from '@/components/PlayerLeaderboard';
import { HistoricalStandings } from '@/components/HistoricalStandings';
import { PlayerSearch } from '@/components/PlayerSearch';
import { AIBriefModal } from '@/components/AIBriefModal';
import {
  KBOGame,
  KBOTeamStanding,
  PitcherLeader,
  BatterLeader,
  HistoricalSeason,
} from '@/types/kbo';

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-24');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'FINISHED' | 'SCHEDULED'>('ALL');
  
  // My Favorite Team (LocalStorage sync)
  const [favoriteTeam, setFavoriteTeam] = useState<string>('HANWHA'); // 기본 한화 이글스 선호

  // Load & Save Favorite Team via LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('kbo_favorite_team');
    if (saved) {
      setFavoriteTeam(saved);
    }

    // 시스템 날짜 감지 및 자동 설정 (2026-07-23 ~ 2026-07-25 범위만 동적 적용, 그 외엔 24일 기본값)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    if (formattedDate === '2026-07-23' || formattedDate === '2026-07-24' || formattedDate === '2026-07-25') {
      setSelectedDate(formattedDate);
    } else {
      setSelectedDate('2026-07-24');
    }
  }, []);

  const handleFavoriteTeamChange = (teamCode: string) => {
    setFavoriteTeam(teamCode);
    localStorage.setItem('kbo_favorite_team', teamCode);
  };

  // Right Sidebar Tab State
  const [rightSidebarTab, setRightSidebarTab] = useState<
    'TEAM_STANDINGS' | 'PLAYER_LEADERS' | 'HISTORICAL_2025' | 'PLAYER_SEARCH'
  >('TEAM_STANDINGS');

  // Real API Data States
  const [gamesState, setGamesState] = useState<KBOGame[]>([]);
  const [standingsState, setStandingsState] = useState<KBOTeamStanding[]>([]);
  const [historicalState, setHistoricalState] = useState<HistoricalSeason | null>(null);
  const [pitchersState, setPitchersState] = useState<PitcherLeader[]>([]);
  const [battersState, setBattersState] = useState<BatterLeader[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  // Modal State
  const [activeModalGame, setActiveModalGame] = useState<KBOGame | null>(null);
  const [activeBriefingType, setActiveBriefingType] = useState<'PREVIEW' | 'REVIEW' | null>(null);

  // Fetch Real KBO API Data
  const fetchRealKBOData = async () => {
    try {
      setLastUpdatedTime(new Date().toLocaleTimeString('ko-KR'));
      
      // 1. Fetch Real Games
      const gamesRes = await fetch(`/api/games?date=${selectedDate}`);
      const gamesJson = await gamesRes.json();
      if (gamesJson.success) {
        setGamesState(gamesJson.data);
      }

      // 2. Fetch Real Standings
      const standingsRes = await fetch('/api/standings');
      const standingsJson = await standingsRes.json();
      if (standingsJson.success) {
        setStandingsState(standingsJson.data.standings);
        setHistoricalState(standingsJson.data.historical2025);
      }

      // 3. Fetch Real Player Stats
      const playersRes = await fetch('/api/players');
      const playersJson = await playersRes.json();
      if (playersJson.success) {
        setPitchersState(playersJson.data.pitchers);
        setBattersState(playersJson.data.batters);
      }
    } catch (err) {
      console.error('Failed to fetch real KBO data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Fetch & 30-sec Auto Polling Effect
  useEffect(() => {
    fetchRealKBOData();

    const interval = setInterval(() => {
      fetchRealKBOData();
    }, 30000); // 30초 실시간 주기적 자동 갱신

    return () => clearInterval(interval);
  }, [selectedDate]);

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
                    {selectedDate} KBO 리그 • {lastUpdatedTime || '실시간 갱신'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {favoriteTeam !== 'NONE' && favoriteTeam !== 'ALL' ? (
                    <span className="flex items-center gap-2">
                      <span className="text-amber-400">⭐ MY팀 [{favoriteTeam}]</span>
                      {selectedDate === '2026-07-23' ? (
                        <span>NC 7-5 LG · 삼성 3-1 키움 · 한화 9-3 KIA · 두산-KT 우천취소</span>
                      ) : selectedDate === '2026-07-24' ? (
                        <span>한화-LG (류현진 vs 임찬규) · 삼성-키움 (코너 vs 하영민) · NC-KIA (하트 vs 양현종)</span>
                      ) : (
                        <span>한화-LG (문동주 vs 최원태) · 삼성-키움 (이승현 vs 후라도) · NC-KIA (신민혁 vs 네일)</span>
                      )}
                    </span>
                  ) : (
                    selectedDate === '2026-07-23'
                      ? '⚾ NC 7-5 LG (LG 7연패) · 1위 삼성 3-1 키움 · 한화 9-3 KIA 대승 · SSG 5-2 롯데'
                      : selectedDate === '2026-07-24'
                      ? '⚾ 한화-LG (류현진 vs 임찬규) · 삼성-키움 (코너 vs 하영민) · NC-KIA (하트 vs 양현종)'
                      : '⚾ 한화-LG (문동주 vs 최원태) · 삼성-키움 (이승현 vs 후라도) · NC-KIA (신민혁 vs 네일)'
                  )}
                </h2>
                <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  {selectedDate === '2026-07-23'
                    ? '2026년 7월 23일(목) KBO 정규시즌 실제 경기 결과. 두산 vs KT(수원)는 그라운드 사정으로 취소되었습니다.'
                    : selectedDate === '2026-07-24'
                    ? '2026년 7월 24일(금) KBO 정규시즌 경기 일정 및 선발 대진표. 각 매치의 AI 프리뷰를 확인해 보세요.'
                    : `${selectedDate} KBO 정규시즌 경기 예정 및 AI 예측 정보입니다.`}
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
                  <span>{selectedDate} 실시간 경기 일정 & 스코어</span>
                  {favoriteTeam !== 'NONE' && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                      <span>⭐ MY 팀 ({favoriteTeam}) 핀 고정됨</span>
                    </span>
                  )}
                </h3>
                <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  실시간 API 갱신중
                </span>
              </div>

              {isLoading ? (
                <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-12 text-center">
                  <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-semibold">실시간 KBO 야구 데이터를 수집 중입니다...</p>
                </div>
              ) : sortedFilteredGames.length === 0 ? (
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
              <div className="grid grid-cols-2 gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-md sm:grid-cols-4">
                <button
                  onClick={() => setRightSidebarTab('TEAM_STANDINGS')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    rightSidebarTab === 'TEAM_STANDINGS'
                      ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🏆 실제 KBO 팀 순위
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
                <button
                  onClick={() => setRightSidebarTab('PLAYER_SEARCH')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all text-center ${
                    rightSidebarTab === 'PLAYER_SEARCH'
                      ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🔎 선수 검색
                </button>
              </div>

              {/* Tab Content 1: Team Standings */}
              {rightSidebarTab === 'TEAM_STANDINGS' && (
                <StandingsTable
                  standings={standingsState}
                  selectedTeam={selectedTeam}
                  onTeamSelect={setSelectedTeam}
                  title={`실제 KBO 팀 순위 (${selectedDate})`}
                  subtitle="전날 대비 순위 변동(▲/▼) 반영"
                />
              )}

              {/* Tab Content 2: Player Leaderboards */}
              {rightSidebarTab === 'PLAYER_LEADERS' && (
                <PlayerLeaderboard
                  pitcherLeaders={pitchersState}
                  batterLeaders={battersState}
                />
              )}

              {/* Tab Content 3: Historical Season 2025 */}
              {rightSidebarTab === 'HISTORICAL_2025' && historicalState && (
                <HistoricalStandings
                  season={historicalState}
                  selectedTeam={selectedTeam}
                  onTeamSelect={setSelectedTeam}
                />
              )}

              {rightSidebarTab === 'PLAYER_SEARCH' && <PlayerSearch />}
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
