'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { KBOGame } from '@/types/kbo';
import { GamePlayerHighlight } from '@/components/game/GamePlayerHighlight';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowRightIcon, SparkIcon } from '@/components/ui/Icons';

type DetailTab = 'AI_REPORT' | 'LINEUP' | 'HEAD_TO_HEAD';

const DETAIL_TABS: Array<{ value: DetailTab; label: string }> = [
  { value: 'AI_REPORT', label: 'AI 리포트' },
  { value: 'LINEUP', label: '라인업' },
  { value: 'HEAD_TO_HEAD', label: '상대 전적' },
];

export default function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const gameId = resolvedParams.id;

  const [game, setGame] = useState<KBOGame | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<DetailTab>('AI_REPORT');

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg p-6">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
        <p className="text-[13px] text-fg2">경기 상세를 불러오는 중입니다</p>
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

  const inningCount = Math.max(
    game.inningScores?.away.length ?? 0,
    game.inningScores?.home.length ?? 0,
    9,
  );
  const innings = Array.from({ length: inningCount }, (_, index) => index + 1);
  const isAwayWin = game.awayScore > game.homeScore;
  const isHomeWin = game.homeScore > game.awayScore;
  const isScheduled = game.status === 'SCHEDULED';

  const statusLabel =
    game.status === 'FINISHED'
      ? '경기 종료'
      : game.status === 'CANCELLED' || game.status === 'POSTPONED'
        ? '경기 취소'
        : isScheduled
          ? '경기 예정'
          : game.currentInning || '진행중';

  const scoreboardCell = (value: number | string | undefined) => (
    <span className={Number(value ?? 0) > 0 ? 'font-bold text-fg' : 'text-fg3'}>{value ?? '-'}</span>
  );

  return (
    <div className="min-h-screen bg-bg pb-16">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-[60px] max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-fg2 transition-colors hover:text-fg"
          >
            <ArrowRightIcon className="rotate-180 text-fg3" />
            대시보드
          </Link>
          <span className="tnum hidden truncate text-xs text-fg3 sm:block">
            {game.date} · {game.stadium}
          </span>
          <div className="flex items-center gap-2.5">
            <span className="rounded-chip bg-surface2 px-2 py-1 text-2xs font-semibold text-fg2">
              {statusLabel}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-5 px-4 pt-6 sm:px-6">
        {/* 스코어보드 헤더 */}
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
                <span className="tnum text-3xl font-bold tracking-[-0.04em] text-fg sm:text-4xl">
                  {game.time}
                </span>
              ) : (
                <>
                  <div className="tnum flex items-center justify-center gap-2.5 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
                    <span className={isAwayWin ? 'text-fg' : 'text-fg3'}>{game.awayScore}</span>
                    <span className="text-2xl font-normal text-fg3">:</span>
                    <span className={isHomeWin ? 'text-fg' : 'text-fg3'}>{game.homeScore}</span>
                  </div>
                  <span className="mt-2 inline-block rounded-md bg-surface2 px-2.5 py-1 text-2xs font-semibold text-fg2">
                    {isHomeWin
                      ? `${game.homeTeam.shortName} 승리`
                      : isAwayWin
                        ? `${game.awayTeam.shortName} 승리`
                        : '무승부'}
                  </span>
                </>
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

        {/* 선수 프로필 사진은 제공하지 않는다. 구단 색과 텍스트로만 구분한다. */}
        {game.status === 'FINISHED' && game.bestPlayer && game.worstPlayer && (
          <section aria-labelledby="game-player-highlights" className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-3 px-0.5">
              <h2 id="game-player-highlights" className="text-[15px] font-bold tracking-[-0.025em] text-fg">
                오늘의 선수
              </h2>
              <p className="text-xs text-fg3">당일 기록과 승부 기여도 기준</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <GamePlayerHighlight player={game.bestPlayer} variant="BEST" />
              <GamePlayerHighlight player={game.worstPlayer} variant="WORST" />
            </div>
          </section>
        )}

        {/* 이닝별 점수판 */}
        {game.inningScores && (
          <section className="rounded-card border border-line bg-surface px-5 pb-3.5 pt-4 shadow-card">
            <div className="flex items-end justify-between gap-3 pb-3.5">
              <h4 className="text-[15px] font-bold tracking-[-0.025em] text-fg">이닝별 점수</h4>
              <span className="text-xs text-fg3">R 득점 · H 안타 · E 실책 · B 사사구</span>
            </div>

            <div className="-mx-1 overflow-x-auto px-1">
              <table className="w-full min-w-[560px] border-collapse text-center">
                <thead>
                  <tr className="text-2xs font-semibold text-fg3">
                    <th className="pb-2.5 pr-3 text-left font-semibold">팀</th>
                    {innings.map((i) => (
                      <th key={i} className="w-7 pb-2.5 font-semibold">
                        {i}
                      </th>
                    ))}
                    <th className="w-9 pb-2.5 font-semibold text-fg2">R</th>
                    <th className="w-9 pb-2.5 font-semibold">H</th>
                    <th className="w-9 pb-2.5 font-semibold">E</th>
                    <th className="w-9 pb-2.5 font-semibold">B</th>
                  </tr>
                </thead>
                <tbody className="tnum text-[13px]">
                  {(
                    [
                      ['away', game.awayTeam, game.inningScores.away, game.awayStats, game.awayScore],
                      ['home', game.homeTeam, game.inningScores.home, game.homeStats, game.homeScore],
                    ] as const
                  ).map(([key, team, scores, teamStats, total]) => (
                    <tr key={key} className="transition-colors hover:bg-surface2">
                      <td className="border-t border-hair py-3 pr-3 text-left">
                        <div className="flex items-center gap-2">
                          <TeamBadge team={team.code} fallbackLabel={team.shortName} size={24} radius={7} />
                          <span className="whitespace-nowrap text-[13px] font-semibold tracking-[-0.02em] text-fg">
                            {team.name}
                          </span>
                        </div>
                      </td>
                      {innings.map((inning, idx) => (
                        <td key={inning} className="border-t border-hair py-3">
                          {scoreboardCell(scores[idx])}
                        </td>
                      ))}
                      <td className="border-t border-hair py-3 text-sm font-bold text-fg">
                        {teamStats?.runs ?? total}
                      </td>
                      <td className="border-t border-hair py-3 text-fg2">{teamStats?.hits ?? '-'}</td>
                      <td className="border-t border-hair py-3 text-fg3">{teamStats?.errors ?? '-'}</td>
                      <td className="border-t border-hair py-3 text-fg3">{teamStats?.walks ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 상세 탭 */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-0.5 rounded-control bg-track p-[3px]">
            {DETAIL_TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveTab(t.value)}
                className={`flex-1 rounded-chip py-2 text-[13px] transition-colors ${
                  activeTab === t.value
                    ? 'bg-thumb font-semibold text-fg shadow-thumb'
                    : 'font-medium text-fg2 hover:text-fg'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'AI_REPORT' &&
            (game.aiReview ? (
              <section className="flex flex-col gap-6 rounded-card border border-line bg-surface p-6 shadow-card">
                <div>
                  <span className="mb-2 flex w-fit items-center gap-1.5 rounded-md bg-accent-soft px-2 py-1 text-2xs font-semibold text-accent">
                    <SparkIcon size={12} />
                    AI 리포트
                  </span>
                  <h4 className="text-[17px] font-bold leading-snug tracking-[-0.03em] text-fg">
                    {game.aiReview.headline}
                  </h4>
                  <p className="mt-2 text-[13.5px] leading-relaxed tracking-[-0.01em] text-fg2">
                    {game.aiReview.summary}
                  </p>
                </div>

                <div>
                  <h5 className="mb-2.5 text-2xs font-semibold uppercase tracking-[0.04em] text-fg3">
                    승패를 가른 요인
                  </h5>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {game.aiReview.keyFactors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="rounded-control bg-surface2 px-3.5 py-3 text-[13px] leading-relaxed text-fg"
                      >
                        {factor}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="mb-2.5 text-2xs font-semibold uppercase tracking-[0.04em] text-fg3">
                    선발 투수 피칭 분석
                  </h5>
                  <p className="rounded-control border border-line px-3.5 py-3 text-[13px] leading-relaxed text-fg2">
                    {game.aiReview.pitcherAnalysis}
                  </p>
                </div>
              </section>
            ) : (
              <section className="rounded-card border border-line bg-surface p-12 text-center text-[13px] text-fg2 shadow-card">
                아직 생성된 AI 리포트가 없습니다.
              </section>
            ))}

          {activeTab === 'LINEUP' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {(
                [
                  [game.awayTeam, game.awayLineup, game.awayPitcher],
                  [game.homeTeam, game.homeLineup, game.homePitcher],
                ] as const
              ).map(([team, lineup, pitcher]) => (
                <section
                  key={team.code}
                  className="rounded-card border border-line bg-surface px-5 pb-4 pt-4 shadow-card"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <TeamBadge team={team.code} fallbackLabel={team.shortName} size={26} radius={8} />
                      <h5 className="truncate text-[13.5px] font-bold tracking-[-0.025em] text-fg">
                        {team.name}
                      </h5>
                    </div>
                    <span className="shrink-0 text-xs text-fg3">선발 {pitcher}</span>
                  </div>

                  {lineup?.length ? (
                    <ul className="flex flex-col">
                      {lineup.map((item) => (
                        <li
                          key={item.order}
                          className="tnum flex items-center gap-3 border-t border-hair py-2.5 text-[13px]"
                        >
                          <span className="w-4 shrink-0 text-fg3">{item.order}</span>
                          <span className="w-9 shrink-0 text-xs text-fg3">{item.position}</span>
                          <span className="min-w-0 flex-1 truncate font-semibold tracking-[-0.02em] text-fg">
                            {item.name}
                          </span>
                          <span className="shrink-0 text-fg2">
                            {item.avg.toFixed(3).replace(/^0/, '')}
                          </span>
                          <span className="w-[74px] shrink-0 text-right text-xs text-fg2">
                            {item.hits}안타 {item.rbi}타점
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="py-8 text-center text-[13px] text-fg3">라인업이 아직 공개되지 않았습니다.</p>
                  )}
                </section>
              ))}
            </div>
          )}

          {activeTab === 'HEAD_TO_HEAD' && (
            <section className="rounded-card border border-line bg-surface p-8 text-center shadow-card">
              <h4 className="text-[15px] font-bold tracking-[-0.025em] text-fg">시즌 상대 전적</h4>
              <p className="mx-auto mt-3 max-w-md rounded-control bg-surface2 px-6 py-4 text-[17px] font-bold tracking-[-0.03em] text-fg">
                {game.headToHeadRecord || '기록 없음'}
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
