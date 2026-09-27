'use client';

import React from 'react';
import { PlayerSearchResult } from '@/types/kbo';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { SearchIcon, CloseIcon } from '@/components/ui/Icons';

export const PlayerPicker: React.FC<{
  label: string;
  onPick: (playerId: string) => void;
  onClear: () => void;
  picked: { name: string; teamName: string; teamCode: string } | null;
}> = ({ label, onPick, onClear, picked }) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<PlayerSearchResult[]>([]);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/players/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((j) => setResults(j.success ? j.data : []))
        .catch(() => undefined);
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  if (picked) {
    return (
      <div className="flex items-center gap-3 rounded-control border border-line bg-surface2 px-3 py-2.5">
        <TeamBadge team={picked.teamCode} fallbackLabel={picked.teamName} size={28} radius={9} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold tracking-[-0.02em] text-fg">{picked.name}</p>
          <p className="truncate text-2xs text-fg3">{picked.teamName}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onClear();
            setQuery('');
            setResults([]);
          }}
          className="shrink-0 rounded-chip p-1 text-fg3 transition-colors hover:text-fg"
          aria-label={`${label} 선택 해제`}
        >
          <CloseIcon size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-control border border-line bg-surface px-3 py-2.5">
        <SearchIcon size={15} className="shrink-0 text-fg3" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={`${label} 선수 이름`}
          className="min-w-0 flex-1 bg-transparent text-[14px] text-fg outline-none placeholder:text-fg3"
        />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-control border border-line bg-surface py-1 shadow-pop">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onMouseDown={() => {
                  onPick(r.playerId);
                  setQuery('');
                  setResults([]);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-surface2"
              >
                <TeamBadge team={r.teamCode} fallbackLabel={r.team} size={22} radius={7} />
                <span className="truncate text-[13px] font-semibold text-fg">{r.name}</span>
                <span className="ml-auto shrink-0 text-2xs text-fg3">
                  {r.playerType === 'PITCHER' ? '투수' : '타자'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
