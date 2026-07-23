'use client';

import { KeyboardEvent, useEffect, useState } from 'react';
import { PlayerSearchResult } from '@/types/kbo';

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
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5 shadow-lg">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400">Player Finder</p>
        <h2 className="mt-1 text-base font-black text-white">1군 선수 검색</h2>
        <p className="mt-1 text-xs text-slate-500">
          선수 이름을 입력해 2026 시즌 누적 기록을 확인하세요.
        </p>
      </div>

      <div className="relative mt-4">
        <label htmlFor="player-search" className="sr-only">선수 이름</label>
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
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-10 text-sm font-semibold text-white outline-none transition focus:border-indigo-500"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="player-search-results"
        />
        <span className="pointer-events-none absolute right-3 top-3 text-slate-500">
          {isLoading ? '···' : '⌕'}
        </span>

        {query.trim() && !isLoading && (results.length > 0 || error) && (
          <div
            id="player-search-results"
            className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl"
          >
            {error ? (
              <p className="px-4 py-3 text-xs text-rose-300">{error}</p>
            ) : results.map((player, index) => (
              <button
                key={player.id}
                type="button"
                onClick={() => choose(player)}
                className={`flex w-full items-center justify-between px-4 py-3 text-left text-xs transition ${
                  index === activeIndex ? 'bg-indigo-500/20' : 'hover:bg-slate-800'
                }`}
              >
                <span>
                  <strong className="text-sm text-white">{player.name}</strong>
                  <span className="ml-2 text-slate-500">{player.position}</span>
                </span>
                <span className="font-semibold text-slate-400">{player.team}</span>
              </button>
            ))}
          </div>
        )}

        {query.trim() && !isLoading && !error && results.length === 0 && !selected && (
          <p className="mt-2 text-xs text-slate-500">일치하는 선수가 없습니다.</p>
        )}
      </div>

      {selected && (
        <article className="mt-5 overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 to-slate-950 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-400/10 text-lg font-black text-indigo-200">
              {selected.name.slice(-2)}
            </div>
            <div>
              <span className="text-[10px] font-black text-indigo-300">
                {selected.playerType === 'PITCHER' ? 'PITCHER' : 'BATTER'}
              </span>
              <h3 className="text-xl font-black text-white">{selected.name}</h3>
              <p className="text-xs font-semibold text-slate-400">{selected.team} · {selected.position}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-300">
              {selected.seasonYear} 시즌 누적 기록
            </h4>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black text-emerald-300">
              7월 23일 경기 반영
            </span>
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {selected.stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                <dt className="text-[10px] font-semibold text-slate-500">{stat.label}</dt>
                <dd className="mt-1 text-base font-black text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[10px] text-slate-600">
            네이버 스포츠 2026 KBO 시즌 기록 기준 · 선수 프로필 사진은 제공하지 않습니다.
          </p>
        </article>
      )}
    </section>
  );
}
