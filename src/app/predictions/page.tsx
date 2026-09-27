'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { ChampionshipOdds } from '@/components/predictions/ChampionshipOdds';
import { ChampionshipPrediction } from '@/types/prediction';

export default function PredictionsPage() {
  const year = new Date().getFullYear();
  const [data, setData] = useState<ChampionshipPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [favoriteTeam, setFavoriteTeam] = useState('NONE');
  useEffect(() => {
    setFavoriteTeam(localStorage.getItem('kbo_favorite_team') ?? 'NONE');
  }, []);
  const handleFavoriteTeamChange = (code: string) => {
    setFavoriteTeam(code);
    localStorage.setItem('kbo_favorite_team', code);
  };

  useEffect(() => {
    let alive = true;
    fetch(`/api/predictions/${year}`)
      .then((res) => res.json())
      .then((json) => {
        if (!alive) return;
        if (json.success) setData(json.data);
        else setError(json.error ?? '예측을 불러오지 못했습니다.');
      })
      .catch(() => alive && setError('예측을 불러오지 못했습니다.'))
      .finally(() => alive && setIsLoading(false));
    return () => {
      alive = false;
    };
  }, [year]);

  return (
    <div className="min-h-screen bg-bg pb-16">
      <Header favoriteTeam={favoriteTeam} onFavoriteTeamChange={handleFavoriteTeamChange} />

      <main className="mx-auto flex max-w-shell flex-col gap-5 px-4 pt-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="rounded-card border border-line bg-surface py-24 text-center shadow-card">
            <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
            <p className="text-[13px] text-fg2">시즌을 수만 번 시뮬레이션하는 중입니다</p>
          </div>
        ) : error || !data ? (
          <div className="rounded-card border border-line bg-surface py-24 text-center shadow-card">
            <p className="text-[13px] text-fg2">{error || '예측을 불러오지 못했습니다.'}</p>
          </div>
        ) : (
          <>
            <ChampionshipOdds data={data} />

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
