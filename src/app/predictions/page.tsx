'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ChampionBanner } from '@/components/ChampionBanner';
import { ChampionshipOdds } from '@/components/predictions/ChampionshipOdds';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons';
import { ChampionshipPrediction } from '@/types/prediction';
import { FIRST_SEASON } from '@/types/season';
import { TEAM_ASSETS, findTeam } from '@/lib/team-assets';
import { POSTSEASON_BY_YEAR, POSTSEASON_YEARS } from '@/lib/postseason-2026';

export default function PredictionsPage() {
  const latestSeason = new Date().getFullYear();
  const [year, setYear] = useState(latestSeason);
  const [data, setData] = useState<ChampionshipPrediction | null>(null);
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

  const handleFavoriteTeamChange = (code: string) => {
    setFavoriteTeam(code);
    localStorage.setItem('kbo_favorite_team', code);
  };

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setError('');
    fetch(`/api/predictions/${year}`)
      .then((res) => res.json())
      .then((json) => {
        if (!alive) return;
        if (json.success) setData(json.data);
        else {
          setData(null);
          setError(json.error ?? '예측을 불러오지 못했습니다.');
        }
      })
      .catch(() => {
        if (alive) {
          setData(null);
          setError('예측을 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [year]);

  const years = useMemo(
    () => Array.from({ length: latestSeason - FIRST_SEASON + 1 }, (_, i) => latestSeason - i),
    [latestSeason],
  );

  const postseason = POSTSEASON_BY_YEAR[year] ?? null;

  return (
    <div className="min-h-screen bg-bg pb-16">
      <Header favoriteTeam={favoriteTeam} onFavoriteTeamChange={handleFavoriteTeamChange} />

      <main className="mx-auto flex max-w-shell flex-col gap-5 px-4 pt-6 sm:px-6 lg:px-8">
        <ChampionBanner />

        {/* 시즌 선택 바 */}
        <section className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-accent">우승 확률 시뮬레이션 & 결과 복기</p>
              <h1 className="mt-0.5 text-[18px] font-bold tracking-[-0.03em] text-fg sm:text-[20px]">
                {year} 시즌 한국시리즈 우승 확률 예측
              </h1>
              <p className="mt-0.5 text-xs text-fg3">
                연도를 바꾸면 해당 시즌의 전력 추정치(피타고리안·실제 승률·선수 WAR) 기반 시뮬레이션 확률과 실제 포스트시즌 결과를 함께 복기할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-control border border-line bg-surface2/60 px-1.5 py-1">
              <button
                type="button"
                onClick={() => setYear((y) => Math.max(FIRST_SEASON, y - 1))}
                disabled={year <= FIRST_SEASON}
                aria-label="이전 시즌"
                className="flex h-8 w-8 items-center justify-center rounded-chip text-fg2 transition-colors hover:bg-surface hover:text-fg disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeftIcon />
              </button>

              <label className="relative flex items-center gap-1.5 rounded-control px-2.5 py-1 transition-colors hover:bg-surface">
                <span className="tnum min-w-[54px] text-center text-[18px] font-bold tracking-[-0.03em] text-fg">
                  {year}
                </span>
                <ChevronDownIcon className="text-fg3" />
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  aria-label="시뮬레이션 시즌 선택"
                  className="absolute inset-0 cursor-pointer opacity-0"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y} 시즌{POSTSEASON_BY_YEAR[y] ? ` (${TEAM_ASSETS[POSTSEASON_BY_YEAR[y].champion].shortName} 우승)` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setYear((y) => Math.min(latestSeason, y + 1))}
                disabled={year >= latestSeason}
                aria-label="다음 시즌"
                className="flex h-8 w-8 items-center justify-center rounded-chip text-fg2 transition-colors hover:bg-surface hover:text-fg disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {POSTSEASON_YEARS.map((y) => {
              const active = y === year;
              const ps = POSTSEASON_BY_YEAR[y];
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-chip border px-2.5 py-1 text-xs transition-colors ${
                    active
                      ? 'border-accent bg-accent-soft font-bold text-accent'
                      : 'border-line bg-surface2/50 font-medium text-fg2 hover:border-accent/40 hover:text-fg'
                  }`}
                >
                  <span className="tnum">{y}</span>
                  <TeamBadge team={ps.champion} size={15} radius={4} />
                  <span className="text-[11px]">{TEAM_ASSETS[ps.champion].shortName}</span>
                </button>
              );
            })}
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-card border border-line bg-surface py-24 text-center shadow-card">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
            <p className="text-[13px] text-fg2">{year} 시즌을 20,000번 시뮬레이션하는 중입니다</p>
          </div>
        ) : error || !data ? (
          <div className="rounded-card border border-line bg-surface py-24 text-center shadow-card">
            <p className="text-[13px] text-fg2">{error || '예측을 불러오지 못했습니다.'}</p>
          </div>
        ) : (
          <>
            {/* 실제 포스트시즌 결과 vs 시뮬레이션 예측 복기 카드 */}
            {postseason && <PostseasonReviewBanner data={data} postseason={postseason} />}

            <ChampionshipOdds data={data} actualChampion={postseason?.champion} />

            <section className="rounded-control border border-line px-5 py-4">
              <h3 className="text-[13.5px] font-bold tracking-[-0.025em] text-fg">이 숫자는 어떻게 나왔나</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-fg2">
                학습한 모델이 아니라 <strong className="font-semibold text-fg">시뮬레이션</strong>입니다.
                팀마다 득실점 기반 피타고리안 승률, 실제 승률, 소속 선수 WAR 합으로 전력을 추정한 뒤,
                남은 경기와 포스트시즌을 {data.iterations.toLocaleString()}번 치러 보고 우승한 횟수를 셉니다.
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-2xs sm:grid-cols-4">
                <div className="flex justify-between gap-2">
                  <dt className="text-fg3">홈 승률</dt>
                  <dd className="tnum font-semibold text-fg2">{data.model.homeWinRate.toFixed(4)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-fg3">피타고리안 지수</dt>
                  <dd className="tnum font-semibold text-fg2">{data.model.pythagoreanExponent}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-fg3">가중치 (피타/실제/뎁스)</dt>
                  <dd className="tnum font-semibold text-fg2">
                    {data.model.weights.pythagorean}/{data.model.weights.actual}/{data.model.weights.depth}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-fg3">평균 회귀</dt>
                  <dd className="tnum font-semibold text-fg2">{data.model.regression}</dd>
                </div>
              </dl>
              <p className="mt-3 text-2xs leading-relaxed text-fg3">
                홈 승률과 피타고리안 지수는 가정한 값이 아니라 {data.model.calibratedOn} 에서 측정했습니다.
                과거 18시즌 검증 결과와 한계는 docs/PREDICTION.md 에 정리돼 있습니다.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function PostseasonReviewBanner({
  data,
  postseason,
}: {
  data: ChampionshipPrediction;
  postseason: (typeof POSTSEASON_BY_YEAR)[number];
}) {
  const modelTop = data.teams[0];
  const modelTopAsset = findTeam(modelTop?.teamCode, modelTop?.shortName, modelTop?.teamName);
  const actualChampOutcome = data.teams.find(
    (t) => findTeam(t.teamCode, t.shortName, t.teamName)?.code === postseason.champion,
  );
  const actualRunnerOutcome = data.teams.find(
    (t) => findTeam(t.teamCode, t.shortName, t.teamName)?.code === postseason.runnerUp,
  );
  const modelMatched = modelTopAsset?.code === postseason.champion;
  const ks = postseason.series[3];
  const ksW = ks.teams.find((t) => t.team === ks.winner)?.wins ?? 4;
  const ksL = ks.teams.find((t) => t.team !== ks.winner)?.wins ?? 0;

  return (
    <section
      aria-label={`${data.year} 모델 예측과 실제 포스트시즌 결과 복기`}
      className="rounded-card border border-line bg-surface p-5 shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-accent">{data.year} 예측 vs 실제 결과 복기</span>
          <span
            className={`rounded-chip px-2.5 py-0.5 text-[11px] font-bold ${
              modelMatched ? 'bg-accent-soft text-accent' : 'bg-surface2 text-fg2'
            }`}
          >
            {modelMatched
              ? '모델 1순위 적중'
              : `정규 ${actualChampOutcome?.rank ?? ''}위 ${TEAM_ASSETS[postseason.champion].shortName} 업셋 우승`}
          </span>
        </div>
        <Link
          href={`/postseason?year=${data.year}`}
          className="rounded-chip bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent hover:opacity-80"
        >
          {data.year} 포스트시즌 대진표 보기 →
        </Link>
      </div>

      <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-control border border-line bg-surface2/50 p-3.5">
          <p className="text-xs text-fg3">시뮬레이션 1순위 후보</p>
          <div className="mt-1.5 flex items-center gap-2.5">
            {modelTop && (
              <>
                <TeamBadge team={modelTop.teamCode} fallbackLabel={modelTop.shortName} size={28} radius={8} />
                <div>
                  <p className="text-[14px] font-bold text-fg">
                    {modelTop.teamName}{' '}
                    <span className="tnum text-accent">{modelTop.championshipOdds.toFixed(1)}%</span>
                  </p>
                  <p className="tnum text-[11.5px] text-fg3">
                    정규 {modelTop.rank}위 · 전력 {modelTop.strength.talent.toFixed(3).replace(/^0/, '')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="rounded-control border border-accent/40 bg-accent-soft/25 p-3.5">
          <p className="text-xs font-semibold text-accent">실제 한국시리즈 우승팀</p>
          <div className="mt-1.5 flex items-center gap-2.5">
            <TeamBadge team={postseason.champion} size={28} radius={8} />
            <div>
              <p className="text-[14px] font-bold text-fg">
                {TEAM_ASSETS[postseason.champion].name}{' '}
                {actualChampOutcome && (
                  <span className="tnum text-accent">
                    (예측 {actualChampOutcome.championshipOdds.toFixed(1)}%)
                  </span>
                )}
              </p>
              <p className="tnum text-[11.5px] text-fg2">
                한국시리즈 {ksW}승 {ksL}패 우승 · 정규 {actualChampOutcome?.rank ?? '-'}위
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-control border border-line bg-surface2/50 p-3.5">
          <p className="text-xs text-fg3">한국시리즈 준우승팀</p>
          <div className="mt-1.5 flex items-center gap-2.5">
            <TeamBadge team={postseason.runnerUp} size={28} radius={8} />
            <div>
              <p className="text-[14px] font-bold text-fg">
                {TEAM_ASSETS[postseason.runnerUp].name}{' '}
                {actualRunnerOutcome && (
                  <span className="tnum text-fg2">
                    (예측 {actualRunnerOutcome.championshipOdds.toFixed(1)}%)
                  </span>
                )}
              </p>
              <p className="tnum text-[11.5px] text-fg3">
                KS 진출 확률 {actualRunnerOutcome ? `${actualRunnerOutcome.finalsOdds.toFixed(1)}%` : '-'} · 정규{' '}
                {actualRunnerOutcome?.rank ?? '-'}위
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-fg2">{postseason.headline}</p>
    </section>
  );
}
