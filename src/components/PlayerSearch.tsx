'use client';

import { KeyboardEvent, useEffect, useState } from 'react';
import { PlayerSearchResult } from '@/types/kbo';
import { TeamBadge } from './ui/TeamBadge';
import { SearchIcon } from './ui/Icons';

export function PlayerSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [selected, setSelected] = useState<PlayerSearchResult | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/players/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('검색 요청 실패');
        const json = await response.json();
        setResults(json.data ?? []);
        setActiveIndex(-1);
      } catch (searchError) {
        if ((searchError as Error).name !== 'AbortError') {
          setError('선수 검색 결과를 불러오지 못했습니다.');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const choose = (player: PlayerSearchResult) => {
    setSelected(player);
    setQuery(player.name);
    setResults([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      choose(results[activeIndex]);
    } else if (event.key === 'Escape') {
      setResults([]);
    }
  };

  return (
    <section className="rounded-card border border-line bg-surface px-5 pb-5 pt-4 shadow-card">
      <div>
        <h2 className="text-[15px] font-bold tracking-[-0.025em] text-fg">선수 검색</h2>
        <p className="mt-0.5 text-xs text-fg3">이름을 입력해 2026 시즌 기록을 확인하세요.</p>
      </div>

      <div className="relative mt-3.5">
        <label htmlFor="player-search" className="sr-only">
          선수 이름
        </label>
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg3" />
        <input
          id="player-search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(null);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          placeholder="예: 구자욱, 류현진"
          className="w-full rounded-control border border-line bg-surface2 py-3 pl-10 pr-10 text-[13.5px] font-medium text-fg outline-none transition-colors placeholder:text-fg3 focus:border-accent focus:bg-surface"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="player-search-results"
        />
        {isLoading && (
          <span className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-line border-t-accent" />
        )}

        {query.trim() && !isLoading && (results.length > 0 || error) && (
          <div
            id="player-search-results"
            className="absolute z-20 mt-2 w-full overflow-hidden rounded-control border border-line bg-surface shadow-pop"
          >
            {error ? (
              <p className="px-4 py-3 text-xs text-live">{error}</p>
            ) : (
              results.map((player, index) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => choose(player)}
                  className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors ${
                    index === activeIndex ? 'bg-surface2' : 'hover:bg-surface2'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <TeamBadge team={player.team} fallbackLabel={player.team} size={24} radius={7} />
                    <span className="truncate text-[13px] font-semibold text-fg">{player.name}</span>
                    <span className="shrink-0 text-xs text-fg3">{player.position}</span>
                  </span>
                  <span className="shrink-0 text-xs text-fg2">{player.team}</span>
                </button>
              ))
            )}
          </div>
        )}

        {query.trim() && !isLoading && !error && results.length === 0 && !selected && (
          <p className="mt-2 text-xs text-fg3">일치하는 선수가 없습니다.</p>
        )}
      </div>

      {selected && (
        <article className="mt-4 rounded-control border border-line p-4">
          <div className="flex items-center gap-3.5">
            <TeamBadge team={selected.team} fallbackLabel={selected.team} size={44} radius={13} />
            <div className="min-w-0">
              <span className="text-2xs font-semibold uppercase tracking-[0.04em] text-fg3">
                {selected.playerType === 'PITCHER' ? '투수' : '타자'}
              </span>
              <h3 className="text-[19px] font-bold tracking-[-0.03em] text-fg">{selected.name}</h3>
              <p className="text-xs text-fg2">
                {selected.team} · {selected.position}
              </p>
            </div>
          </div>

          <h4 className="mb-2 mt-4 text-2xs font-semibold uppercase tracking-[0.04em] text-fg3">
            {selected.seasonYear} 시즌 누적
          </h4>
          <dl className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {selected.stats.map((stat) => (
              <div key={stat.label} className="rounded-chip bg-surface2 px-2 py-2.5 text-center">
                <dt className="text-2xs text-fg3">{stat.label}</dt>
                <dd className="tnum mt-1 text-[15px] font-bold tracking-[-0.02em] text-fg">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-3.5 text-2xs text-fg3">
            네이버 스포츠 KBO 기록 기준 · 선수 프로필 사진은 제공하지 않습니다.
          </p>
        </article>
      )}
    </section>
  );
}
