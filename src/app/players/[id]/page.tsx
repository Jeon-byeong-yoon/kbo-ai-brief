'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { BattingCareer, PitchingCareer, AdvancedNote } from '@/components/players/CareerTables';
import { PlayerCareer } from '@/types/player-career';

const Meta: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-2xs text-fg3">{label}</p>
    <p className="tnum text-[13px] font-semibold text-fg">{value}</p>
  </div>
);

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [player, setPlayer] = useState<PlayerCareer | null>(null);
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
    fetch(`/api/players/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.success) setPlayer(j.data);
        else setError(j.error ?? '선수 기록을 불러오지 못했습니다.');
      })
      .catch(() => alive && setError('선수 기록을 불러오지 못했습니다.'))
      .finally(() => alive && setIsLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const seasons = player ? [...player.batting, ...player.pitching].map((r) => r.year) : [];
  const span = seasons.length > 0 ? `${Math.min(...seasons)}~${Math.max(...seasons)}` : '';

  return (
    <div className="min-h-screen bg-bg">
      <Header favoriteTeam={favoriteTeam} onFavoriteTeamChange={handleFavoriteTeamChange} />

      <main className="mx-auto flex max-w-shell flex-col gap-5 px-4 py-6 sm:px-6">
        <Link href="/records" className="text-xs text-fg3 transition-colors hover:text-fg">
          기록실로
        </Link>

        {isLoading && (
          <section className="rounded-card border border-line bg-surface p-8 text-center shadow-card">
            <p className="text-[13px] text-fg3">선수 기록을 불러오는 중입니다.</p>
          </section>
        )}

        {!isLoading && !player && (
          <section className="rounded-card border border-line bg-surface p-8 text-center shadow-card">
            <p className="text-[13px] text-fg3">{error || '선수를 찾지 못했습니다.'}</p>
          </section>
        )}

        {player && (
          <>
            <section className="rounded-card border border-line bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-center gap-4">
                <TeamBadge team={player.teamCode} fallbackLabel={player.teamName} size={52} radius={15} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h1 className="text-xl font-bold tracking-[-0.03em] text-fg">{player.name}</h1>
                    {player.backNumber && (
                      <span className="tnum text-sm font-semibold text-fg3">
                        No.{player.backNumber}
                      </span>
                    )}
                    {player.isRetired && (
                      <span className="rounded-chip bg-surface2 px-2 py-0.5 text-2xs text-fg2">은퇴</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-fg3">
                    {[player.teamName, player.position].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                <Meta label="활동 시즌" value={span} />
                <Meta label="시즌 수" value={`${new Set(seasons).size}시즌`} />
                {player.height > 0 && <Meta label="신장" value={`${player.height}cm`} />}
                {player.weight > 0 && <Meta label="체중" value={`${player.weight}kg`} />}
              </div>
            </section>

            <BattingCareer rows={player.batting} total={player.battingTotal} />
            <PitchingCareer rows={player.pitching} total={player.pitchingTotal} />
            {player.hasPreAdvancedSeasons && <AdvancedNote />}
          </>
        )}
      </main>
    </div>
  );
}
