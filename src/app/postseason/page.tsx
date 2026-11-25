'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { ChampionBanner } from '@/components/ChampionBanner';
import { PostseasonBracket } from '@/components/PostseasonBracket';

export default function PostseasonPage() {
  const [favoriteTeam, setFavoriteTeam] = useState('NONE');

  useEffect(() => {
    setFavoriteTeam(localStorage.getItem('kbo_favorite_team') ?? 'NONE');
  }, []);

  const changeFavoriteTeam = (code: string) => {
    setFavoriteTeam(code);
    localStorage.setItem('kbo_favorite_team', code);
  };

  return (
    <div className="min-h-screen bg-bg pb-16">
      <Header favoriteTeam={favoriteTeam} onFavoriteTeamChange={changeFavoriteTeam} />
      <main className="mx-auto flex max-w-shell flex-col gap-5 px-4 pt-6 sm:px-6 lg:px-8">
        <ChampionBanner />
        <PostseasonBracket />
      </main>
    </div>
  );
}
