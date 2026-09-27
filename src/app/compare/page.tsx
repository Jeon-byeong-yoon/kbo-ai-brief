'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { PlayerPicker } from '@/components/compare/PlayerPicker';
import { CompareTable, battingRows, pitchingRows } from '@/components/compare/CompareTable';
import { CAREER_FROM, PlayerCareer } from '@/types/player-career';
import { findTeam } from '@/lib/team-assets';

type Slot = 'a' | 'b';

const span = (p: PlayerCareer) => {
  const years = [...p.batting, ...p.pitching].map((r) => r.year);
  return years.length > 0 ? `${Math.min(...years)}~${Math.max(...years)}` : '';
};

const isPitcher = (p: PlayerCareer) => p.pitching.length >= p.batting.length;

const Card: React.FC<{ player: PlayerCareer }> = ({ player }) => {
  const team = findTeam(player.teamCode, player.teamName);
  return (
    <div className="flex items-center gap-3">
      <TeamBadge team={player.teamCode} fallbackLabel={player.teamName} size={40} radius={12} />
      <div className="min-w-0">
        <Link
          href={`/players/${player.playerId}`}
          className="truncate text-[16px] font-bold tracking-[-0.025em] text-fg hover:text-accent hover:underline"
        >
          {player.name}
        </Link>
        <p className="tnum truncate text-2xs text-fg3">
          {[team?.shortName ?? player.teamName, span(player)].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  );
};

export default function ComparePage() {
  const [players, setPlayers] = useState<Record<Slot, PlayerCareer | null>>({ a: null, b: null });
  const [loading, setLoading] = useState<Record<Slot, boolean>>({ a: false, b: false });
  const [error, setError] = useState('');

  const [favoriteTeam, setFavoriteTeam] = useState('NONE');
  useEffect(() => {
    setFavoriteTeam(localStorage.getItem('kbo_favorite_team') ?? 'NONE');
  }, []);
  const handleFavoriteTeamChange = (code: string) => {
    setFavoriteTeam(code);
    localStorage.setItem('kbo_favorite_team', code);
  };

  const load = useCallback(async (slot: Slot, playerId: string) => {
    setLoading((s) => ({ ...s, [slot]: true }));
    setError('');
    try {
      const res = await fetch(`/api/players/${playerId}`);
      const json = await res.json();
      if (json.success) setPlayers((s) => ({ ...s, [slot]: json.data }));
      else setError(json.error ?? '선수 기록을 불러오지 못했습니다.');
    } catch {
      setError('선수 기록을 불러오지 못했습니다.');
    } finally {
      setLoading((s) => ({ ...s, [slot]: false }));
    }
  }, []);

  // 고른 선수를 URL 에 남겨 공유·북마크가 되게 한다.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const a = q.get('a');
    const b = q.get('b');
    if (a) load('a', a);
    if (b) load('b', b);
  }, [load]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const next = new URLSearchParams();
    if (players.a) next.set('a', players.a.playerId);
    if (players.b) next.set('b', players.b.playerId);
    if (next.toString() === url.searchParams.toString()) return;
    url.search = next.toString();
    window.history.replaceState(null, '', url);
  }, [players]);

  const { a, b } = players;
  const ready = a && b;
  const pitcherMode = ready ? isPitcher(a) && isPitcher(b) : false;
  const batterMode = ready ? !isPitcher(a) && !isPitcher(b) : false;
  const mismatch = ready && !pitcherMode && !batterMode;

  return (
    <div className="min-h-screen bg-bg">
      <Header favoriteTeam={favoriteTeam} onFavoriteTeamChange={handleFavoriteTeamChange} />

      <main className="mx-auto flex max-w-shell flex-col gap-5 px-4 py-6 sm:px-6">
        <section className="rounded-card border border-line bg-surface px-5 pb-5 pt-4 shadow-card">
          <h1 className="text-[15px] font-bold tracking-[-0.025em] text-fg">선수 비교</h1>
          <p className="mt-0.5 text-xs text-fg3">
            두 선수의 통산 기록을 나란히 놓습니다. 시대가 다르면 기록도 달라지므로 리그 평균으로
            보정한 ERA+ · OPS+ 를 함께 봅니다.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(['a', 'b'] as Slot[]).map((slot) => {
              const p = players[slot];
              return (
                <PlayerPicker
                  key={slot}
                  label={slot === 'a' ? '왼쪽' : '오른쪽'}
                  picked={
                    p ? { name: p.name, teamName: p.teamName, teamCode: p.teamCode } : null
                  }
                  onPick={(id) => load(slot, id)}
                  onClear={() => setPlayers((s) => ({ ...s, [slot]: null }))}
                />
              );
            })}
          </div>

          {(loading.a || loading.b) && (
            <p className="pt-3 text-center text-[13px] text-fg3">선수 기록을 불러오는 중입니다.</p>
          )}
          {error && <p className="pt-3 text-center text-[13px] text-lose">{error}</p>}
        </section>

        {ready && mismatch && (
          <section className="rounded-card border border-line bg-surface p-6 text-center shadow-card">
            <p className="text-[13px] text-fg2">
              투수와 타자는 지표가 달라 나란히 두지 않습니다. 같은 포지션끼리 골라 주세요.
            </p>
          </section>
        )}

        {ready && !mismatch && (
          <section className="rounded-card border border-line bg-surface px-5 pb-4 pt-4 shadow-card">
            <div className="grid grid-cols-2 gap-3 pb-4">
              <Card player={a} />
              <div className="flex justify-end">
                <Card player={b} />
              </div>
            </div>

            <CompareTable rows={pitcherMode ? pitchingRows(a, b) : battingRows(a, b)} />

            <div className="flex flex-col gap-1.5 pt-3">
              <p className="text-2xs leading-relaxed text-fg3">
                굵은 쪽이 그 항목에서 앞선 값입니다. 앱이 누가 더 나은 선수인지 정하지는 않습니다.
                가중치를 저희가 정할 근거가 없어서 종합 점수로 뭉뚱그리지 않았습니다.
              </p>
              <p className="text-2xs leading-relaxed text-fg3">
                기록은 네이버 스포츠에서 오고 {CAREER_FROM}년 시즌부터 제공됩니다. 그 전에 뛴 기간은
                빠져 있습니다. WAR 은 2017년부터만 있어 그 전 시즌은 합계에 들어가지 않습니다.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
