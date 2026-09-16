'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import {
  SeasonHitters,
  SeasonPitchers,
  SeasonTeamStandings,
  SeasonTeamStats,
} from '@/components/records/SeasonTables';
import { SeasonHeadToHead } from '@/components/records/SeasonHeadToHead';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/Icons';
import { FIRST_SEASON, SeasonRecords } from '@/types/season';
import { HeadToHead } from '@/types/head-to-head';

type Tab = 'TEAM_RANK' | 'TEAM_STATS' | 'HEAD_TO_HEAD' | 'HITTERS' | 'PITCHERS';

const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'TEAM_RANK', label: '팀 순위' },
  { value: 'TEAM_STATS', label: '팀 기록' },
  { value: 'HEAD_TO_HEAD', label: '상대전적' },
  { value: 'HITTERS', label: '타자 기록' },
  { value: 'PITCHERS', label: '투수 기록' },
];

export default function RecordsPage() {
  const latestSeason = new Date().getFullYear();
  const [year, setYear] = useState(latestSeason);

  // 연도를 URL 에 남겨 공유·북마크가 되게 한다. useSearchParams 는 Suspense 경계를
  // 요구하므로 마운트 후 location 을 직접 읽는다.
  useEffect(() => {
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
  const [tab, setTab] = useState<Tab>('TEAM_RANK');
  const [records, setRecords] = useState<SeasonRecords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 상대전적은 시즌 일정을 월 단위로 아홉 번 받아 집계해야 해서 무겁다.
  // 탭을 실제로 열었을 때만 부르고, 연도별로 들고 있는다.
  const [headToHead, setHeadToHead] = useState<HeadToHead | null>(null);
  const [h2hState, setH2hState] = useState<'idle' | 'loading' | 'error'>('idle');

  // 관심 구단은 대시보드와 같은 저장소를 쓴다.
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
    setIsLoading(true);
    setError('');

    fetch(`/api/seasons/${year}`)
      .then((res) => res.json())
      .then((json) => {
        if (!alive) return;
        if (json.success) setRecords(json.data);
        else {
          setRecords(null);
          setError(json.error ?? '시즌 기록을 불러오지 못했습니다.');
        }
      })
      .catch(() => {
        if (alive) {
          setRecords(null);
          setError('시즌 기록을 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [year]);

  useEffect(() => {
    if (tab !== 'HEAD_TO_HEAD') return;
    if (headToHead?.year === year) return;

    let alive = true;
    setH2hState('loading');

    fetch(`/api/seasons/${year}/head-to-head`)
      .then((res) => res.json())
      .then((json) => {
        if (!alive) return;
        if (json.success) {
          setHeadToHead(json.data);
          setH2hState('idle');
        } else {
          setHeadToHead(null);
          setH2hState('error');
        }
      })
      .catch(() => {
        if (alive) {
          setHeadToHead(null);
          setH2hState('error');
        }
      });

    return () => {
      alive = false;
    };
  }, [tab, year, headToHead?.year]);

  const years = useMemo(
    () => Array.from({ length: latestSeason - FIRST_SEASON + 1 }, (_, i) => latestSeason - i),
    [latestSeason],
  );

  return (
    <div className="min-h-screen bg-bg pb-16">
      <Header favoriteTeam={favoriteTeam} onFavoriteTeamChange={handleFavoriteTeamChange} />

      <main className="mx-auto flex max-w-shell flex-col gap-5 px-4 pt-6 sm:px-6 lg:px-8">
        <section className="rounded-card border border-line bg-surface shadow-card">
          {/* 연도 네비게이터 */}
          <div className="flex items-center justify-between gap-3 border-b border-hair px-4 py-3.5 sm:px-5">
            <div>
              <h2 className="text-[15px] font-bold tracking-[-0.025em] text-fg">기록실</h2>
              <p className="mt-0.5 text-xs text-fg3">정규시즌 · {FIRST_SEASON}~{latestSeason}</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setYear((y) => Math.max(FIRST_SEASON, y - 1))}
                disabled={year <= FIRST_SEASON}
                aria-label="이전 시즌"
                className="flex h-8 w-8 items-center justify-center rounded-chip text-fg3 transition-colors hover:bg-surface2 hover:text-fg disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeftIcon />
              </button>

              <label className="relative flex items-center gap-1.5 rounded-control px-2 py-1 transition-colors hover:bg-surface2">
                <span className="tnum min-w-[54px] text-center text-[19px] font-bold tracking-[-0.03em] text-fg">
                  {year}
                </span>
                <ChevronDownIcon className="text-fg3" />
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  aria-label="시즌 선택"
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
                className="flex h-8 w-8 items-center justify-center rounded-chip text-fg3 transition-colors hover:bg-surface2 hover:text-fg disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRightIcon />
              </button>
            </div>
          </div>

          {/* 탭 */}
          <div className="px-4 pt-3 sm:px-5">
            <div className="flex gap-0.5 overflow-x-auto rounded-control bg-track p-[3px]">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={`flex-1 whitespace-nowrap rounded-chip px-3 py-1.5 text-[13px] transition-colors ${
                    tab === t.value
                      ? 'bg-thumb font-semibold text-fg shadow-thumb'
                      : 'font-medium text-fg2 hover:text-fg'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 표 */}
          <div className="px-4 pb-4 pt-3 sm:px-5">
            {isLoading ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
                <p className="text-[13px] text-fg2">{year} 시즌 기록을 불러오는 중입니다</p>
              </div>
            ) : error ? (
              <p className="py-20 text-center text-[13px] text-fg2">{error}</p>
            ) : records ? (
              <>
                {tab === 'TEAM_RANK' && <SeasonTeamStandings rows={records.teams} />}
                {tab === 'TEAM_STATS' && <SeasonTeamStats rows={records.teams} />}
                {tab === 'HEAD_TO_HEAD' &&
                  (h2hState === 'loading' ? (
                    <div className="py-20 text-center">
                      <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-line border-t-accent" />
                      <p className="text-[13px] text-fg2">시즌 일정을 모아 상대전적을 계산하는 중입니다</p>
                    </div>
                  ) : h2hState === 'error' || !headToHead ? (
                    <p className="py-20 text-center text-[13px] text-fg2">
                      이 시즌의 상대전적을 계산하지 못했습니다.
                    </p>
                  ) : (
                    <SeasonHeadToHead data={headToHead} />
                  ))}
                {tab === 'HITTERS' && <SeasonHitters rows={records.hitters} />}
                {tab === 'PITCHERS' && <SeasonPitchers rows={records.pitchers} />}
              </>
            ) : null}
          </div>
        </section>

        <p className="px-1 text-2xs leading-relaxed text-fg3">
          네이버 스포츠 KBO 기록 기준. 선수 기록은 시즌별 상위 50명까지 제공되며, 규정 타석·이닝을
          채우지 못한 선수는 순위에서 제외됩니다. WAR 은 제공되는 시즌에만 표시합니다.
        </p>
      </main>
    </div>
  );
}
