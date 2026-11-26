'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { ChampionBanner } from '@/components/ChampionBanner';
import { PostseasonBracket } from '@/components/PostseasonBracket';
import { POSTSEASON_BY_YEAR } from '@/lib/postseason-2026';

export default function PostseasonPage() {
  const [favoriteTeam, setFavoriteTeam] = useState('NONE');
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setFavoriteTeam(localStorage.getItem('kbo_favorite_team') ?? 'NONE');
    const fromUrl = Number(new URLSearchParams(window.location.search).get('year'));
    if (Number.isInteger(fromUrl) && POSTSEASON_BY_YEAR[fromUrl]) {
      setYear(fromUrl);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (String(year) === url.searchParams.get('year')) return;
    url.searchParams.set('year', String(year));
    window.history.replaceState(null, '', url);
  }, [year]);

  const changeFavoriteTeam = (code: string) => {
    setFavoriteTeam(code);
    localStorage.setItem('kbo_favorite_team', code);
  };

  return (
    <div className="min-h-screen bg-bg pb-16">
      <Header favoriteTeam={favoriteTeam} onFavoriteTeamChange={changeFavoriteTeam} />
      <main className="mx-auto flex max-w-shell flex-col gap-5 px-4 pt-6 sm:px-6 lg:px-8">
        <ChampionBanner />
        <PostseasonBracket year={year} onYearChange={setYear} />
      </main>
    </div>
  );
}
