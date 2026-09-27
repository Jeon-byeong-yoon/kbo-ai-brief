'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { TeamBadge } from '@/components/ui/TeamBadge';
import {
  Card,
  GameList,
  MonthlyRecord,
  Roster,
  VsRecord,
} from '@/components/teams/TeamSections';
import { TeamPage } from '@/types/team-page';
import { TEAM_CODES, TEAM_ASSETS } from '@/lib/team-assets';

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-2xs text-fg3">{label}</p>
    <p className="tnum text-[15px] font-bold tracking-[-0.02em] text-fg">{value}</p>
  </div>
);

export default function TeamDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);

  const [team, setTeam] = useState<TeamPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [favoriteTeam, setFavoriteTeam] = useState('NONE');
  useEffect(() => {
    setFavoriteTeam(localStorage.getItem('kbo_favorite_team') ?? 'NONE');
  }, []);
  const handleFavoriteTeamChange = (next: string) => {
    setFavoriteTeam(next);
    localStorage.setItem('kbo_favorite_team', next);
  };

  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setTeam(null);
    setError('');
    fetch(`/api/teams/${code}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j.success) setTeam(j.data);
        else setError(j.error ?? '구단 기록을 불러오지 못했습니다.');
      })
      .catch(() => alive && setError('구단 기록을 불러오지 못했습니다.'))
      .finally(() => alive && setIsLoading(false));
    return () => {
      alive = false;
    };
  }, [code]);

  const scheduledLeft = team ? team.upcoming.length : 0;
  const trueLeft = team ? 144 - (team.wins + team.losses + team.draws) : 0;

  return (
    <div className="min-h-screen bg-bg">
      <Header favoriteTeam={favoriteTeam} onFavoriteTeamChange={handleFavoriteTeamChange} />

      <main className="mx-auto flex max-w-shell flex-col gap-5 px-4 py-6 sm:px-6">
        <div className="custom-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {TEAM_CODES.map((c) => (
            <Link
              key={c}
              href={`/teams/${c}`}
              className={`flex shrink-0 items-center gap-1.5 rounded-chip px-2.5 py-1.5 text-2xs transition ${
                c === team?.teamCode
                  ? 'bg-accent font-semibold text-white'
                  : 'bg-surface font-medium text-fg2 hover:text-fg'
              }`}
            >
              <TeamBadge team={c} fallbackLabel={TEAM_ASSETS[c].shortName} size={16} radius={5} />
              {TEAM_ASSETS[c].shortName}
            </Link>
          ))}
        </div>

        {isLoading && (
          <section className="rounded-card border border-line bg-surface p-8 text-center shadow-card">
            <p className="text-[13px] text-fg3">구단 기록을 불러오는 중입니다.</p>
          </section>
        )}

        {!isLoading && !team && (
          <section className="rounded-card border border-line bg-surface p-8 text-center shadow-card">
            <p className="text-[13px] text-fg3">{error || '구단을 찾지 못했습니다.'}</p>
          </section>
        )}

        {team && (
          <>
            <section className="rounded-card border border-line bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-center gap-4">
                <TeamBadge team={team.teamCode} fallbackLabel={team.shortName} size={52} radius={15} />
                <div>
                  <h1 className="text-xl font-bold tracking-[-0.03em] text-fg">{team.teamName}</h1>
                  <p className="tnum mt-0.5 text-xs text-fg3">
                    {team.year} 정규시즌 {team.rank}위
                    {team.gameBehind > 0 ? ` · ${team.gameBehind.toFixed(1)}게임차` : ''}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-6">
                <Stat label="성적" value={`${team.wins}-${team.losses}-${team.draws}`} />
                <Stat label="승률" value={team.winRate.toFixed(3).replace(/^0/, '')} />
                <Stat label="팀 타율" value={team.battingAvg.toFixed(3).replace(/^0/, '')} />
                <Stat label="팀 평균자책" value={team.era.toFixed(2)} />
                <Stat label="득점" value={String(team.runs)} />
                <Stat label="실점" value={String(team.runsAllowed)} />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card title="월별 성적">
                <MonthlyRecord rows={team.monthly} />
              </Card>

              <Card title="상대별 전적">
                <VsRecord rows={team.vs} />
              </Card>

              <Card title="최근 10경기">
                <GameList rows={team.recent} />
              </Card>

              <Card
                title="남은 경기"
                hint={
                  trueLeft > scheduledLeft
                    ? `일정 ${scheduledLeft}경기 · 실제 ${trueLeft}경기`
                    : undefined
                }
              >
                <GameList rows={team.upcoming} upcoming />
                {trueLeft > scheduledLeft && (
                  <p className="pt-2 text-2xs leading-relaxed text-fg3">
                    우천 순연 후 편성일이 아직 공지되지 않은 {trueLeft - scheduledLeft}경기는
                    일정에 없습니다. 공지되면 자동으로 들어옵니다.
                  </p>
                )}
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Roster rows={team.hitters} title="타자" />
              <Roster rows={team.pitchers} title="투수" />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
