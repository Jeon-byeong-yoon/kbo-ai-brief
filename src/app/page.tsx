'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { MatchCard } from '@/components/MatchCard';
import { StandingsTable } from '@/components/StandingsTable';
import { PlayerLeaderboard } from '@/components/PlayerLeaderboard';
import { HistoricalStandings } from '@/components/HistoricalStandings';
import { PlayerSearch } from '@/components/PlayerSearch';
import { AIBriefModal } from '@/components/AIBriefModal';
import { ChartIcon, HistoryIcon, SearchIcon, TrophyIcon } from '@/components/ui/Icons';
import {
  KBOGame,
  KBOTeamStanding,
  PitcherLeader,
  BatterLeader,
  HistoricalSeason,
} from '@/types/kbo';

type RightTab = 'TEAM_STANDINGS' | 'PLAYER_LEADERS' | 'HISTORICAL_2025' | 'PLAYER_SEARCH';
type StatusFilter = 'ALL' | 'IN_PROGRESS' | 'FINISHED' | 'SCHEDULED';

const RIGHT_TABS: Array<{ value: RightTab; label: string; icon: React.ReactNode }> = [
  { value: 'TEAM_STANDINGS', label: '팀 순위', icon: <TrophyIcon size={14} /> },
  { value: 'PLAYER_LEADERS', label: '선수 기록', icon: <ChartIcon size={14} /> },
  { value: 'HISTORICAL_2025', label: '2025 시즌', icon: <HistoryIcon size={14} /> },
  { value: 'PLAYER_SEARCH', label: '선수 검색', icon: <SearchIcon size={14} /> },
];

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-24');
  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // My Favorite Team (LocalStorage sync)
  const [favoriteTeam, setFavoriteTeam] = useState<string>('HANWHA');

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

    if (['2026-07-23', '2026-07-24', '2026-07-25'].includes(formattedDate)) {
      setSelectedDate(formattedDate);
    } else {
      setSelectedDate('2026-07-24');
    }
  }, []);

  const handleFavoriteTeamChange = (teamCode: string) => {
    setFavoriteTeam(teamCode);
    localStorage.setItem('kbo_favorite_team', teamCode);
  };

  const [rightSidebarTab, setRightSidebarTab] = useState<RightTab>('TEAM_STANDINGS');

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

  const fetchRealKBOData = useCallback(async () => {
    try {
      setLastUpdatedTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));

      const gamesRes = await fetch(`/api/games?date=${selectedDate}`);
      const gamesJson = await gamesRes.json();
      if (gamesJson.success) {
        setGamesState(gamesJson.data);
      }

      const standingsRes = await fetch('/api/standings');
      const standingsJson = await standingsRes.json();
      if (standingsJson.success) {
        setStandingsState(standingsJson.data.standings);
        setHistoricalState(standingsJson.data.historical2025);
      }

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
  }, [selectedDate]);

  // Initial Fetch & 30-sec Auto Polling Effect
  useEffect(() => {
    fetchRealKBOData();
    const interval = setInterval(fetchRealKBOData, 30000);
    return () => clearInterval(interval);
  }, [fetchRealKBOData]);

  // Filter & Sort Games (관심 구단 경기 최상단 핀 고정 정렬)
  const sortedFilteredGames = useMemo(() => {
    const filtered = gamesState.filter((game) => {
      if (game.date !== selectedDate) return false;

      if (selectedTeam !== 'ALL') {
        const isAway = game.awayTeam.code === selectedTeam;
        const isHome = game.homeTeam.code === selectedTeam;
        if (!isAway && !isHome) return false;
      }

      if (statusFilter !== 'ALL' && game.status !== statusFilter) return false;

      return true;
    });

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

  const stats = useMemo(() => {
    const todayGames = gamesState.filter((g) => g.date === selectedDate);
    return {
      total: todayGames.length,
      live: todayGames.filter((g) => g.status === 'IN_PROGRESS').length,
      finished: todayGames.filter((g) => g.status === 'FINISHED').length,
      scheduled: todayGames.filter((g) => g.status === 'SCHEDULED').length,
    };
  }, [gamesState, selectedDate]);

  const statusFilters: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: 'ALL', label: '전체', count: stats.total },
    { value: 'IN_PROGRESS', label: '진행중', count: stats.live },
    { value: 'FINISHED', label: '종료', count: stats.finished },
    { value: 'SCHEDULED', label: '예정', count: stats.scheduled },
  ];

  const handleOpenBriefing = (game: KBOGame, type: 'PREVIEW' | 'REVIEW') => {
    setActiveModalGame(game);
    setActiveBriefingType(type);
  };

  const handleCloseModal = () => {
    setActiveModalGame(null);
    setActiveBriefingType(null);
  };

  const summaryHeadline = useMemo(() => {
    if (gamesState.length === 0) return '오늘 예정된 경기가 없습니다';

    return gamesState
      .slice(0, 3)
      .map((g) => {
        const away = g.awayTeam.shortName;
        const home = g.homeTeam.shortName;
        if (g.status === 'FINISHED') return `${away} ${g.awayScore}-${g.homeScore} ${home}`;
        if (g.status === 'IN_PROGRESS')
          return `${away} ${g.awayScore}-${g.homeScore} ${home} (${g.currentInning || '진행중'})`;
        if (g.status === 'CANCELLED') return `${away}-${home} 취소`;
        return `${away}-${home} ${g.awayPitcher}·${g.homePitcher}`;
      })
      .join(' · ');
  }, [gamesState]);

  const formattedDate = useMemo(() => {
    const parsed = new Date(`${selectedDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return selectedDate;
    const weekday = ['일', '월', '화', '수', '목', '금', '토'][parsed.getDay()];
    return `${selectedDate.replace(/-/g, '.')} (${weekday})`;
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-bg pb-16">
      <Header
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedTeam={selectedTeam}
        onTeamSelect={setSelectedTeam}
        favoriteTeam={favoriteTeam}
        onFavoriteTeamChange={handleFavoriteTeamChange}
      />

      <main className="mx-auto flex max-w-shell flex-col gap-5 px-4 pt-6 sm:px-6 lg:px-8">
        {/* 오늘의 요약 + 상태 필터 */}
        <section className="flex flex-col items-start justify-between gap-5 rounded-card border border-line bg-surface p-6 shadow-card md:flex-row md:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-[-0.01em] text-accent">오늘의 브리핑</span>
              <span className="text-fg3">·</span>
              <span className="tnum text-xs text-fg3">
                {formattedDate}
                {lastUpdatedTime ? ` · ${lastUpdatedTime} 갱신` : ''}
              </span>
            </div>
            <h2 className="mt-1.5 text-[21px] font-bold leading-[1.32] tracking-[-0.035em] text-fg [text-wrap:pretty]">
              {summaryHeadline}
            </h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed tracking-[-0.01em] text-fg2">
              {favoriteTeam !== 'NONE'
                ? '관심 구단 경기를 맨 위에 고정해 두었습니다. 30초마다 자동으로 새로고침됩니다.'
                : 'KBO 리그 정규시즌 경기 일정과 선발 대진입니다. 30초마다 자동으로 새로고침됩니다.'}
            </p>
          </div>

          <div className="flex shrink-0 gap-0.5 self-stretch rounded-control bg-track p-[3px] md:self-auto">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-chip px-3 py-1.5 text-[13px] transition-colors ${
                  statusFilter === f.value
                    ? 'bg-thumb font-semibold text-fg shadow-thumb'
                    : 'font-medium text-fg2 hover:text-fg'
                }`}
              >
                {f.value === 'IN_PROGRESS' && f.count > 0 && (
                  <span className="h-[5px] w-[5px] rounded-full bg-live" />
                )}
                {f.label}
                <span className="tnum font-semibold text-fg3">{f.count}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          {/* 왼쪽: 경기 일정 */}
          <div className="flex flex-col gap-3">
            <div className="flex h-[34px] items-center justify-between px-0.5">
              <h3 className="text-[15px] font-bold tracking-[-0.025em] text-fg">경기 일정</h3>
              <span className="flex items-center gap-1.5 text-xs text-fg3">
                <span className="h-[5px] w-[5px] rounded-full bg-win" />
                30초마다 자동 갱신
              </span>
            </div>

            {isLoading ? (
              <div className="rounded-card border border-line bg-surface p-12 text-center shadow-card">
                <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
                <p className="text-[13px] text-fg2">경기 정보를 불러오는 중입니다</p>
              </div>
            ) : sortedFilteredGames.length === 0 ? (
              <div className="rounded-card border border-line bg-surface p-12 text-center shadow-card">
                <h4 className="text-sm font-semibold text-fg">선택한 조건의 경기가 없습니다</h4>
                <p className="mt-1 text-[13px] text-fg2">다른 날짜나 구단 필터를 선택해 보세요.</p>
                <button
                  onClick={() => {
                    setSelectedTeam('ALL');
                    setStatusFilter('ALL');
                  }}
                  className="mt-4 rounded-[9px] bg-surface2 px-3.5 py-2 text-[12.5px] font-semibold text-fg transition-colors hover:bg-track"
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
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

          {/* 오른쪽: 순위 / 기록 / 전년도 / 검색 */}
          <div className="flex flex-col gap-3">
            <div className="flex h-[34px] items-center">
              <div className="flex w-full gap-0.5 overflow-x-auto rounded-control bg-track p-[3px]">
                {RIGHT_TABS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setRightSidebarTab(t.value)}
                    className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-chip px-3 py-1.5 text-[12.5px] transition-colors ${
                      rightSidebarTab === t.value
                        ? 'bg-thumb font-semibold text-fg shadow-thumb'
                        : 'font-medium text-fg2 hover:text-fg'
                    }`}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {rightSidebarTab === 'TEAM_STANDINGS' && (
              <StandingsTable
                standings={standingsState}
                selectedTeam={selectedTeam}
                favoriteTeam={favoriteTeam}
                onTeamSelect={setSelectedTeam}
                title={`${selectedDate.slice(0, 4)} 팀 순위`}
                subtitle="전날 경기 종료 기준"
              />
            )}

            {rightSidebarTab === 'PLAYER_LEADERS' && (
              <PlayerLeaderboard pitcherLeaders={pitchersState} batterLeaders={battersState} />
            )}

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

      <AIBriefModal
        game={activeModalGame}
        briefingType={activeBriefingType}
        onClose={handleCloseModal}
      />
    </div>
  );
}
