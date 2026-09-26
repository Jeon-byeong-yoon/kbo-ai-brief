'use client';

import React, { useCallback, useEffect, useState, use } from 'react';
import Link from 'next/link';
import { GameDetail } from '@/lib/game-detail';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRightIcon } from '@/components/ui/Icons';
import { LiveCount, LiveMatchup, LiveWinRate } from '@/components/game/LiveScoreboard';
import { LineupEntry, PitcherLine } from '@/types/live';

type Tab = 'LINEUP' | 'PITCHERS';

const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'LINEUP', label: '타순' },
  { value: 'PITCHERS', label: '투수' },
];

const th = 'whitespace-nowrap pb-2.5 text-center text-2xs font-semibold text-fg3';
const td = 'tnum border-t border-hair py-2.5 text-center text-[12.5px] text-fg2';

function LineupTable({ rows, title }: { rows: LineupEntry[]; title: string }) {
  if (!rows.length) {
    return (
      <section className="rounded-card border border-line bg-surface p-8 text-center shadow-card">
        <p className="text-[13px] text-fg3">{title} 타순이 아직 공개되지 않았습니다.</p>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-line bg-surface px-5 pb-4 pt-4 shadow-card">
      <h5 className="mb-3 text-[13.5px] font-bold tracking-[-0.025em] text-fg">{title}</h5>
      <div className="custom-scrollbar -mx-1 overflow-x-auto px-1">
        <table className="w-full border-collapse" style={{ minWidth: 420 }}>
          <thead>
            <tr>
              <th className={`${th} w-9`}>타순</th>
              <th className={`${th} text-left`}>선수</th>
              <th className={th}>타수</th>
              <th className={th}>안타</th>
              <th className={th}>타점</th>
              <th className={th}>득점</th>
              <th className={th}>볼넷</th>
              <th className={th}>삼진</th>
              <th className={th}>시즌</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.order}-${row.seqno}-${i}`} className="transition-colors hover:bg-surface2">
                <td className={td}>
                  {row.isStarter ? row.order : <span className="text-fg3">└</span>}
                </td>
                <td className="border-t border-hair py-2.5">
                  <div className="flex min-w-0 items-center gap-2 pr-2">
                    <span className="truncate text-[13px] font-semibold tracking-[-0.02em] text-fg">
                      {row.name}
                    </span>
                    <span className="shrink-0 text-2xs text-fg3">{row.position}</span>
                  </div>
                </td>
                <td className={td}>{row.atBats}</td>
                <td className={`${td} font-semibold text-fg`}>{row.hits}</td>
                <td className={td}>{row.rbi}</td>
                <td className={td}>{row.runs}</td>
                <td className={td}>{row.walks}</td>
                <td className={td}>{row.strikeouts}</td>
                <td className={td}>{row.seasonAvg ? row.seasonAvg.toFixed(3).replace(/^0/, '') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PitcherTable({ rows, title }: { rows: PitcherLine[]; title: string }) {
  if (!rows.length) {
    return (
      <section className="rounded-card border border-line bg-surface p-8 text-center shadow-card">
        <p className="text-[13px] text-fg3">{title} 투수 기록이 아직 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-line bg-surface px-5 pb-4 pt-4 shadow-card">
      <h5 className="mb-3 text-[13.5px] font-bold tracking-[-0.025em] text-fg">{title}</h5>
      <div className="custom-scrollbar -mx-1 overflow-x-auto px-1">
        <table className="w-full border-collapse" style={{ minWidth: 420 }}>
          <thead>
            <tr>
              <th className={`${th} text-left`}>투수</th>
              <th className={th}>이닝</th>
              <th className={th}>투구수</th>
              <th className={th}>피안타</th>
              <th className={th}>삼진</th>
              <th className={th}>볼넷</th>
              <th className={th}>실점</th>
              <th className={th}>자책</th>
              <th className={th}>시즌 ERA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={`${row.name}-${i}`} className="transition-colors hover:bg-surface2">
                <td className="border-t border-hair py-2.5">
                  <div className="flex min-w-0 items-center gap-2 pr-2">
                    <span className="truncate text-[13px] font-semibold tracking-[-0.02em] text-fg">
                      {row.name}
                    </span>
                    <span className="shrink-0 text-2xs text-fg3">#{row.backNumber}</span>
                  </div>
                </td>
                <td className={`${td} font-semibold text-fg`}>{row.innings}</td>
                <td className={td}>{row.pitchCount}</td>
                <td className={td}>{row.hits}</td>
                <td className={td}>{row.strikeouts}</td>
                <td className={td}>{row.walks}</td>
                <td className={td}>{row.runs}</td>
                <td className={`${td} font-semibold text-fg`}>{row.earnedRuns}</td>
                <td className={td}>{row.seasonEra || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = use(params);

  const [game, setGame] = useState<GameDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('LINEUP');
  const [updatedAt, setUpdatedAt] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${gameId}`);
      const json = await res.json();
      if (json.success) {
        setGame(json.data);
        setUpdatedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to fetch game detail:', err);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    load();
  }, [load]);

  // 진행 중인 경기만 짧은 주기로 다시 받는다. 끝난 경기는 더 이상 바뀌지 않는다.
  useEffect(() => {
    if (!game?.isLive) return;
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [game?.isLive, load]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg p-6">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
        <p className="text-[13px] text-fg2">경기 정보를 불러오는 중입니다</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg p-6">
        <h2 className="text-lg font-bold tracking-[-0.03em] text-fg">경기 정보를 찾을 수 없습니다</h2>
        <Link
          href="/"
          className="mt-5 rounded-[9px] bg-surface2 px-4 py-2 text-[12.5px] font-semibold text-fg transition-colors hover:bg-track"
        >
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  const isScheduled = game.status === 'SCHEDULED';
  const innings = Math.max(game.inningScores?.away.length ?? 9, game.inningScores?.home.length ?? 9, 9);
  const statusLabel =
    game.status === 'FINISHED'
      ? '경기 종료'
      : game.status === 'CANCELLED' || game.status === 'POSTPONED'
        ? '경기 취소'
        : isScheduled
          ? '경기 예정'
          : game.currentInning || '진행중';

  const scoreRows = [
    { key: 'away', team: game.awayTeam, scores: game.inningScores?.away ?? [], rheb: game.awayRheb },
    { key: 'home', team: game.homeTeam, scores: game.inningScores?.home ?? [], rheb: game.homeRheb },
  ];

  return (
    <div className="min-h-screen bg-bg pb-16">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-[60px] max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-1.5 text-[13px] font-semibold text-fg2 transition-colors hover:text-fg">
            <ArrowRightIcon className="rotate-180 text-fg3" />
            대시보드
          </Link>
          <span className="tnum hidden truncate text-xs text-fg3 sm:block">
            {game.date} · {game.stadium}
            {game.weather ? ` · ${game.weather}` : ''}
          </span>
          <div className="flex items-center gap-2.5">
            {game.isLive ? (
              <span className="flex items-center gap-1.5 rounded-chip bg-live-soft px-2 py-1 text-2xs font-bold text-live">
                <span className="h-[5px] w-[5px] animate-pulse rounded-full bg-live" />
                {statusLabel}
              </span>
            ) : (
              <span className="rounded-chip bg-surface2 px-2 py-1 text-2xs font-semibold text-fg2">
                {statusLabel}
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-5 px-4 pt-6 sm:px-6">
        {/* 스코어 헤더 */}
        <section className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
              <TeamBadge team={game.awayTeam.code} fallbackLabel={game.awayTeam.shortName} size={56} radius={16} />
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold tracking-[-0.03em] text-fg sm:text-xl">
                  {game.awayTeam.name}
                </h3>
                <p className="mt-0.5 text-xs text-fg3">선발 {game.awayPitcher}</p>
              </div>
            </div>

            <div className="shrink-0 px-2 text-center sm:px-4">
              {isScheduled ? (
                <span className="tnum text-3xl font-bold tracking-[-0.04em] text-fg sm:text-4xl">{game.time}</span>
              ) : (
                <div className="tnum flex items-center justify-center gap-2.5 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
                  <span className={game.awayScore > game.homeScore ? 'text-fg' : 'text-fg3'}>{game.awayScore}</span>
                  <span className="text-2xl font-normal text-fg3">:</span>
                  <span className={game.homeScore > game.awayScore ? 'text-fg' : 'text-fg3'}>{game.homeScore}</span>
                </div>
              )}
              {game.winPitcher && (
                <p className="mt-2 text-2xs text-fg3">
                  승 {game.winPitcher} · 패 {game.losePitcher}
                </p>
              )}
            </div>

            <div className="flex flex-1 flex-col-reverse items-center justify-end gap-3 text-center sm:flex-row sm:text-right">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold tracking-[-0.03em] text-fg sm:text-xl">
                  {game.homeTeam.name}
                </h3>
                <p className="mt-0.5 text-xs text-fg3">선발 {game.homePitcher}</p>
              </div>
              <TeamBadge team={game.homeTeam.code} fallbackLabel={game.homeTeam.shortName} size={56} radius={16} />
            </div>
          </div>
        </section>

        {/* 실시간 상황 */}
        {game.live && (
          <section className="flex flex-col gap-4 rounded-card border border-accent bg-surface p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h4 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.025em] text-fg">
                <span className="h-[6px] w-[6px] animate-pulse rounded-full bg-live" />
                {game.live.inning}
              </h4>
              <span className="tnum text-2xs text-fg3">{updatedAt} 갱신 · 10초마다</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <LiveCount live={game.live} />
              <div className="min-w-[200px] flex-1">
                <LiveMatchup live={game.live} />
              </div>
            </div>

            <LiveWinRate live={game.live} awayName={game.awayTeam.shortName} homeName={game.homeTeam.shortName} />
          </section>
        )}

        {/* 이닝별 점수판 */}
        {!isScheduled && (
          <section className="rounded-card border border-line bg-surface px-5 pb-3.5 pt-4 shadow-card">
            <div className="flex items-end justify-between gap-3 pb-3.5">
              <h4 className="text-[15px] font-bold tracking-[-0.025em] text-fg">이닝별 점수</h4>
              <span className="text-xs text-fg3">R 득점 · H 안타 · E 실책 · B 사사구</span>
            </div>
            <div className="custom-scrollbar -mx-1 overflow-x-auto px-1">
              <table className="w-full border-collapse text-center" style={{ minWidth: 560 }}>
                <thead>
                  <tr className="text-2xs font-semibold text-fg3">
                    <th className="pb-2.5 pr-3 text-left font-semibold">팀</th>
                    {Array.from({ length: innings }, (_, i) => (
                      <th key={i} className="w-7 pb-2.5 font-semibold">{i + 1}</th>
                    ))}
                    <th className="w-9 pb-2.5 font-semibold text-fg2">R</th>
                    <th className="w-9 pb-2.5 font-semibold">H</th>
                    <th className="w-9 pb-2.5 font-semibold">E</th>
                    <th className="w-9 pb-2.5 font-semibold">B</th>
                  </tr>
                </thead>
                <tbody className="tnum text-[13px]">
                  {scoreRows.map((row) => (
                    <tr key={row.key} className="transition-colors hover:bg-surface2">
                      <td className="border-t border-hair py-3 pr-3 text-left">
                        <div className="flex items-center gap-2">
                          <TeamBadge team={row.team.code} fallbackLabel={row.team.shortName} size={20} radius={6} />
                          <span className="whitespace-nowrap text-[13px] font-semibold tracking-[-0.02em] text-fg">
                            {row.team.name}
                          </span>
                        </div>
                      </td>
                      {Array.from({ length: innings }, (_, i) => {
                        const v = row.scores[i];
                        return (
                          <td key={i} className="border-t border-hair py-3">
                            <span className={Number(v) > 0 ? 'font-bold text-fg' : 'text-fg3'}>
                              {v === undefined ? '-' : v}
                            </span>
                          </td>
                        );
                      })}
                      <td className="border-t border-hair py-3 text-sm font-bold text-fg">{row.rheb.runs}</td>
                      <td className="border-t border-hair py-3 text-fg2">{row.rheb.hits}</td>
                      <td className="border-t border-hair py-3 text-fg3">{row.rheb.errors}</td>
                      <td className="border-t border-hair py-3 text-fg3">{row.rheb.walks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 타순 / 투수 */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-0.5 rounded-control bg-track p-[3px]">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`flex-1 rounded-chip py-2 text-[13px] transition-colors ${
                  tab === t.value ? 'bg-thumb font-semibold text-fg shadow-thumb' : 'font-medium text-fg2 hover:text-fg'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {tab === 'LINEUP' ? (
              <>
                <LineupTable rows={game.awayBatters} title={game.awayTeam.name} />
                <LineupTable rows={game.homeBatters} title={game.homeTeam.name} />
              </>
            ) : (
              <>
                <PitcherTable rows={game.awayPitchers} title={game.awayTeam.name} />
                <PitcherTable rows={game.homePitchers} title={game.homeTeam.name} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
