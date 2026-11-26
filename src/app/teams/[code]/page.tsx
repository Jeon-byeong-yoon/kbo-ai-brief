'use client';

import React, { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons';
import {
  Card,
  GameList,
  MonthlyRecord,
  Roster,
  VsRecord,
} from '@/components/teams/TeamSections';
import { TeamPage } from '@/types/team-page';
import { FIRST_SEASON } from '@/types/season';
import { TEAM_CODES, TEAM_ASSETS, findTeam, type TeamCode } from '@/lib/team-assets';
import {
  FA_2027,
  FA_2028_CANDIDATES,
  TEAM_NEEDS_2026,
  positionWarRank,
  predictDestination,
  type FAPositionRole,
} from '@/lib/fa-market';
import { POSTSEASON_BY_YEAR } from '@/lib/postseason-2026';

const ROLES: readonly FAPositionRole[] = ['포수', '내야수', '외야수', '선발', '불펜'];

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-2xs text-fg3">{label}</p>
    <p className="tnum text-[15px] font-bold tracking-[-0.02em] text-fg">{value}</p>
  </div>
);

function getTeamPostseasonSummary(teamCode: TeamCode, year: number): string | null {
  const ps = POSTSEASON_BY_YEAR[year];
  if (!ps) return null;
  if (ps.champion === teamCode) {
    return ps.isUnifiedChampion ? '한국시리즈 통합 우승' : '한국시리즈 우승';
  }
  if (ps.runnerUp === teamCode) {
    return '한국시리즈 준우승';
  }
  const [wc, semi, po] = ps.series;
  if (po.teams.some((t) => t.team === teamCode)) return '플레이오프 진출';
  if (semi.teams.some((t) => t.team === teamCode)) return '준플레이오프 진출';
  if (wc.teams.some((t) => t.team === teamCode)) return '와일드카드 결정전 진출';
  return '포스트시즌 미진출';
}

export default function TeamDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const latestSeason = new Date().getFullYear();
  const [year, setYear] = useState(latestSeason);

  const [team, setTeam] = useState<TeamPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [favoriteTeam, setFavoriteTeam] = useState('NONE');
  useEffect(() => {
    setFavoriteTeam(localStorage.getItem('kbo_favorite_team') ?? 'NONE');
    const fromUrl = Number(new URLSearchParams(window.location.search).get('year'));
    if (Number.isInteger(fromUrl) && fromUrl >= FIRST_SEASON && fromUrl <= latestSeason) {
      setYear(fromUrl);
    }
  }, [latestSeason]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (String(year) === url.searchParams.get('year')) return;
    url.searchParams.set('year', String(year));
    window.history.replaceState(null, '', url);
  }, [year]);

  const handleFavoriteTeamChange = (next: string) => {
    setFavoriteTeam(next);
    localStorage.setItem('kbo_favorite_team', next);
  };

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setTeam(null);
    setError('');
    fetch(`/api/teams/${code}?year=${year}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.success) setTeam(j.data);
        else setError(j.error ?? '구단 기록을 불러오지 못했습니다.');
      })
      .catch(() => alive && setError('구단 기록을 불러오지 못했습니다.'))
      .finally(() => alive && setIsLoading(false));
    return () => {
      alive = false;
    };
  }, [code, year]);

  const years = useMemo(
    () => Array.from({ length: latestSeason - FIRST_SEASON + 1 }, (_, i) => latestSeason - i),
    [latestSeason],
  );

  const resolvedTeamCode: TeamCode | null = findTeam(team?.teamCode ?? code)?.code ?? null;
  const psOutcome = resolvedTeamCode ? getTeamPostseasonSummary(resolvedTeamCode, year) : null;
  const scheduledLeft = team ? team.upcoming.length : 0;
  const trueLeft = team && year >= latestSeason ? 144 - (team.wins + team.losses + team.draws) : 0;

  return (
    <div className="min-h-screen bg-bg pb-16">
      <Header favoriteTeam={favoriteTeam} onFavoriteTeamChange={handleFavoriteTeamChange} />

      <main className="mx-auto flex max-w-shell flex-col gap-5 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="custom-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
            {TEAM_CODES.map((c) => (
              <Link
                key={c}
                href={`/teams/${c}?year=${year}`}
                className={`flex shrink-0 items-center gap-1.5 rounded-chip px-2.5 py-1.5 text-2xs transition ${
                  c === resolvedTeamCode
                    ? 'bg-accent font-semibold text-white'
                    : 'bg-surface font-medium text-fg2 hover:text-fg'
                }`}
              >
                <TeamBadge team={c} fallbackLabel={TEAM_ASSETS[c].shortName} size={16} radius={5} />
                {TEAM_ASSETS[c].shortName}
              </Link>
            ))}
          </div>

          {/* 시즌(연도) 선택기 */}
          <div className="flex items-center gap-1 rounded-control border border-line bg-surface px-1.5 py-1 shadow-card">
            <button
              type="button"
              onClick={() => setYear((y) => Math.max(FIRST_SEASON, y - 1))}
              disabled={year <= FIRST_SEASON}
              aria-label="이전 시즌"
              className="flex h-7 w-7 items-center justify-center rounded-chip text-fg2 transition-colors hover:bg-surface2 hover:text-fg disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeftIcon />
            </button>

            <label className="relative flex items-center gap-1.5 rounded-control px-2 py-0.5 transition-colors hover:bg-surface2">
              <span className="tnum min-w-[48px] text-center text-[16px] font-bold tracking-[-0.03em] text-fg">
                {year}
              </span>
              <ChevronDownIcon className="text-fg3" />
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                aria-label="구단 조회 시즌 선택"
                className="absolute inset-0 cursor-pointer opacity-0"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y} 시즌
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => setYear((y) => Math.min(latestSeason, y + 1))}
              disabled={year >= latestSeason}
              aria-label="다음 시즌"
              className="flex h-7 w-7 items-center justify-center rounded-chip text-fg2 transition-colors hover:bg-surface2 hover:text-fg disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>

        {isLoading && (
          <section className="rounded-card border border-line bg-surface p-12 text-center shadow-card">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
            <p className="text-[13px] text-fg3">{year} 시즌 구단 기록을 불러오는 중입니다.</p>
          </section>
        )}

        {!isLoading && !team && (
          <section className="rounded-card border border-line bg-surface p-12 text-center shadow-card">
            <p className="text-[13px] text-fg3">{error || '구단 기록을 찾지 못했습니다.'}</p>
          </section>
        )}

        {team && resolvedTeamCode && (
          <>
            <section className="rounded-card border border-line bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <TeamBadge team={team.teamCode} fallbackLabel={team.shortName} size={52} radius={15} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-xl font-bold tracking-[-0.03em] text-fg">{team.teamName}</h1>
                      {psOutcome && (
                        <Link
                          href={`/postseason?year=${year}`}
                          className={`rounded-chip px-2.5 py-0.5 text-xs font-bold ${
                            psOutcome.includes('우승')
                              ? 'bg-accent-soft text-accent'
                              : 'bg-surface2 text-fg2 hover:text-fg'
                          }`}
                        >
                          {year} {psOutcome} →
                        </Link>
                      )}
                    </div>
                    <p className="tnum mt-0.5 text-xs text-fg3">
                      {team.year} 정규시즌 {team.rank}위
                      {team.gameBehind > 0 ? ` · ${team.gameBehind.toFixed(1)}게임차` : ' · 정규시즌 1위'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/predictions?year=${year}`}
                    className="rounded-chip bg-surface2 px-3 py-1.5 text-xs font-semibold text-fg2 hover:text-fg"
                  >
                    {year} 우승 확률 보기 →
                  </Link>
                  <Link
                    href={`/records?year=${year}`}
                    className="rounded-chip bg-surface2 px-3 py-1.5 text-xs font-semibold text-fg2 hover:text-fg"
                  >
                    {year} 기록실 →
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-6">
                <Stat label="성적" value={`${team.wins}-${team.losses}-${team.draws}`} />
                <Stat label="승률" value={team.winRate.toFixed(3).replace(/^0/, '')} />
                <Stat label="팀 타율" value={team.battingAvg.toFixed(3).replace(/^0/, '')} />
                <Stat label="팀 평균자책" value={team.era.toFixed(2)} />
                <Stat label="득점" value={String(team.runs)} />
                <Stat label="실점" value={String(team.runsAllowed)} />
              </div>
            </section>

            {/* 2026 스토브리그 & 포지션별 WAR 진단 섹션 */}
            <TeamStoveLeagueSection teamCode={resolvedTeamCode} />

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card title="월별 성적">
                <MonthlyRecord rows={team.monthly} />
              </Card>

              <Card title="상대별 전적">
                <VsRecord rows={team.vs} />
              </Card>

              <Card title="최근 10경기">
                <GameList rows={team.recent} />
              </Card>

              <Card
                title="남은 경기"
                hint={
                  trueLeft > scheduledLeft
                    ? `일정 ${scheduledLeft}경기 · 실제 ${trueLeft}경기`
                    : undefined
                }
              >
                <GameList rows={team.upcoming} upcoming />
                {trueLeft > scheduledLeft && (
                  <p className="pt-2 text-2xs leading-relaxed text-fg3">
                    우천 순연 후 편성일이 아직 공지되지 않은 {trueLeft - scheduledLeft}경기는
                    일정에 없습니다. 공지되면 자동으로 들어옵니다.
                  </p>
                )}
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Roster rows={team.hitters} title="타자" />
              <Roster rows={team.pitchers} title="투수" />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function TeamStoveLeagueSection({ teamCode }: { teamCode: TeamCode }) {
  const profile = TEAM_NEEDS_2026[teamCode];
  const ownFA2027 = FA_2027.filter((p) => p.team === teamCode);
  const ownFA2028 = FA_2028_CANDIDATES.filter((p) => p.team === teamCode);

  const roleBreakdown = ROLES.map((role) => ({
    role,
    war: profile.positionWar[role],
    rank: positionWarRank(teamCode, role),
  }));

  const weakestRoles = [...roleBreakdown]
    .sort((a, b) => b.rank - a.rank || a.war - b.war)
    .slice(0, 2);

  // 타 구단 미계약 FA 중 이 구단의 취약 포지션을 보강할 수 있거나 이 구단이 Top 3 행선지에 포함된 선수
  const externalTargets = FA_2027.filter((p) => !p.contract && p.team !== teamCode)
    .map((player) => {
      const pred = predictDestination(player);
      const match = pred?.topCandidates.find((c) => c.team === teamCode);
      const fillsWeakness = weakestRoles.some((w) => w.role === player.stats.role && w.rank >= 6);
      return { player, match, fillsWeakness };
    })
    .filter((item) => item.match || item.fillsWeakness)
    .sort(
      (a, b) =>
        (b.match?.probability ?? 0) - (a.match?.probability ?? 0) ||
        b.player.stats.war - a.player.stats.war,
    )
    .slice(0, 4);

  return (
    <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hair pb-3.5">
        <div>
          <span className="text-xs font-semibold text-accent">2026–2027 스토브리그 & 전력 진단</span>
          <h2 className="mt-0.5 text-[17px] font-bold tracking-[-0.025em] text-fg">
            {TEAM_ASSETS[teamCode].name} 포지션별 WAR & FA 현황
          </h2>
        </div>
        <Link
          href="/fa"
          className="rounded-chip bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent hover:opacity-80"
        >
          전체 FA 시장 보기 →
        </Link>
      </div>

      {/* 5대 포지션 WAR 및 리그 순위 */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {roleBreakdown.map(({ role, war, rank }) => {
          const isWeak = rank >= 7;
          const isStrong = rank <= 3;
          return (
            <div
              key={role}
              className={`rounded-control border px-3.5 py-3 ${
                isWeak
                  ? 'border-accent/45 bg-accent-soft/25'
                  : 'border-line bg-surface2/45'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-fg2">{role}</span>
                <span
                  className={`tnum rounded-chip px-1.5 py-0.5 text-[10.5px] font-bold ${
                    isWeak
                      ? 'bg-accent-soft text-accent'
                      : isStrong
                        ? 'bg-surface text-fg'
                        : 'text-fg3'
                  }`}
                >
                  {rank}위 {isWeak ? '· 보강 필요' : isStrong ? '· 강점' : ''}
                </span>
              </div>
              <p className="tnum mt-1.5 text-[19px] font-bold tracking-[-0.03em] text-fg">
                {war.toFixed(2)}
                <span className="ml-1 text-xs font-medium text-fg3">WAR</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* 내부 2027 FA 승인 선수 */}
        <div className="rounded-control border border-line bg-surface2/35 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-fg">
              구단 내부 2027 FA 대상자 ({ownFA2027.length}명)
            </h3>
            <span className="text-xs text-fg3">
              2028 예상 후보 {ownFA2028.length}명
            </span>
          </div>

          {ownFA2027.length === 0 ? (
            <p className="mt-3 text-xs text-fg3">
              이번 2027 FA 승인 선수 명단에 소속 선수가 없습니다. (2028 예상 후보:{' '}
              {ownFA2028.map((p) => p.name).join(', ') || '없음'})
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {ownFA2027.map((p) => {
                const pred = !p.contract ? predictDestination(p) : null;
                return (
                  <div
                    key={p.name}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-line bg-surface px-3 py-2.5 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/players/${p.stats.playerId}`}
                          className="font-bold text-fg hover:text-accent hover:underline"
                        >
                          {p.name}
                        </Link>
                        <span className="text-fg3">
                          ({p.stats.role} · {p.grade}등급 · WAR {p.stats.war.toFixed(2)})
                        </span>
                      </div>
                      <p className="tnum mt-0.5 text-[11px] text-fg3">{p.stats.summaryLine}</p>
                    </div>
                    {p.contract ? (
                      <span className="rounded-chip bg-surface2 px-2.5 py-1 text-[11px] font-bold text-fg">
                        잔류 완료 ({p.contract.years} {p.contract.maxEok}억)
                      </span>
                    ) : (
                      <span className="rounded-chip bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
                        미정 · {pred?.label ?? '협상 중'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 취약 포지션 기반 외부 FA 영입 적합 후보 */}
        <div className="rounded-control border border-line bg-surface2/35 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-fg">
              포지션 약점 기반 외부 FA 매칭 후보
            </h3>
            <span className="text-xs text-fg3">
              취약 포지션: {weakestRoles.map((w) => `${w.role}(${w.rank}위)`).join(' · ')}
            </span>
          </div>

          {externalTargets.length === 0 ? (
            <p className="mt-3 text-xs text-fg3">
              현재 미계약 외부 FA 중 뚜렷한 포지션 결손 매칭 후보가 없습니다.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {externalTargets.map(({ player, match }) => (
                <div
                  key={player.name}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-line bg-surface px-3 py-2.5 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <TeamBadge team={player.team} size={24} radius={6} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/players/${player.stats.playerId}`}
                          className="font-bold text-fg hover:text-accent hover:underline"
                        >
                          {player.name}
                        </Link>
                        <span className="text-fg3">
                          (원소속 {TEAM_ASSETS[player.team].shortName} · {player.stats.role} ·{' '}
                          {player.grade}등급)
                        </span>
                      </div>
                      <p className="tnum mt-0.5 text-[11px] text-fg3">
                        2026 WAR {player.stats.war.toFixed(2)} · {player.stats.primaryMetricLabel}{' '}
                        {player.stats.primaryMetricValue}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-chip bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
                    {match ? `행선지 적합도 ${match.probability}%` : `${player.stats.role} 보강 후보`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
