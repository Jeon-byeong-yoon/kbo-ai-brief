'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { ChampionBanner } from '@/components/ChampionBanner';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { TEAM_ASSETS, TEAM_CODES, type TeamCode } from '@/lib/team-assets';
import {
  FA_2027,
  FA_2028_CANDIDATES,
  FA_AS_OF,
  FA_SOURCES,
  predictDestination,
  type FAPlayer,
} from '@/lib/fa-market';

type Season = '2027' | '2028';
type Status = 'all' | 'signed' | 'pending';

const teamName = (code: TeamCode) => TEAM_ASSETS[code].shortName;

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent hover:underline">{children} ↗</a>;
}

export default function FAMarketPage() {
  const [favoriteTeam, setFavoriteTeam] = useState('NONE');
  const [season, setSeason] = useState<Season>('2027');
  const [status, setStatus] = useState<Status>('all');
  const [team, setTeam] = useState<TeamCode | 'ALL'>('ALL');
  const [query, setQuery] = useState('');
  const [selectedName, setSelectedName] = useState<string | null>(null);

  useEffect(() => {
    setFavoriteTeam(localStorage.getItem('kbo_favorite_team') ?? 'NONE');
  }, []);

  const current = useMemo(() => FA_2027
    .filter((player) => team === 'ALL' || player.team === team)
    .filter((player) => player.name.includes(query.trim()))
    .filter((player) => status === 'all' || (status === 'signed' ? !!player.contract : !player.contract))
    .sort((a, b) => Number(!!b.contract) - Number(!!a.contract)), [team, query, status]);
  const next = useMemo(() => FA_2028_CANDIDATES
    .filter((player) => team === 'ALL' || player.team === team)
    .filter((player) => player.name.includes(query.trim())), [team, query]);
  const selected = FA_2027.find((player) => player.name === selectedName && !player.contract);
  const prediction = selected ? predictDestination(selected) : null;
  const signedCount = FA_2027.filter((player) => player.contract).length;

  const changeSeason = (value: Season) => {
    setSeason(value);
    setStatus('all');
    setSelectedName(null);
  };
  const changeFavoriteTeam = (code: string) => {
    setFavoriteTeam(code);
    localStorage.setItem('kbo_favorite_team', code);
  };

  return (
    <div className="min-h-screen bg-bg pb-16">
      <Header favoriteTeam={favoriteTeam} onFavoriteTeamChange={changeFavoriteTeam} />
      <main className="mx-auto flex max-w-shell flex-col gap-5 px-4 pt-6 sm:px-6 lg:px-8">
        <ChampionBanner />
        <section className="rounded-card border border-line bg-surface p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-accent">
            <span className="rounded-chip bg-accent-soft px-2.5 py-1">스토브리그</span>
            <span className="text-fg3">{FA_AS_OF.replaceAll('-', '.')} 확인 기준</span>
          </div>
          <h1 className="mt-3 text-[26px] font-bold tracking-[-0.04em] text-fg sm:text-[32px]">KBO FA 시장</h1>
          <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-fg2">
            공식 승인 선수의 계약 현황과 다음 시즌 예상 후보를 함께 봅니다. 계약 금액은 옵션을 포함한 최대 총액입니다.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              ['승인 선수', FA_2027.length, '명'],
              ['계약 확인', signedCount, '명'],
              ['발표 미확인', FA_2027.length - signedCount, '명'],
            ].map(([label, count, unit]) => (
              <div key={label} className="rounded-control border border-line bg-surface2 px-3 py-3 sm:px-5">
                <p className="text-xs text-fg2">{label}</p>
                <p className="tnum mt-1 text-[22px] font-bold tracking-[-0.04em] text-fg sm:text-[27px]">{count}<span className="ml-1 text-sm font-medium text-fg3">{unit}</span></p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-2 border-b border-line" role="tablist" aria-label="FA 시즌">
          {([['2027', '2027 FA · 현재 시장'], ['2028', '2028 FA · 예상 후보']] as const).map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={season === value} onClick={() => changeSeason(value)}
              className={`border-b-2 px-3 pb-3 pt-1 text-[13px] font-semibold transition-colors sm:px-5 sm:text-sm ${season === value ? 'border-accent text-accent' : 'border-transparent text-fg2 hover:text-fg'}`}>
              {label}
            </button>
          ))}
        </div>

        <section className="rounded-card border border-line bg-surface shadow-card">
          <div className="flex flex-col gap-3 border-b border-hair p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-[17px] font-bold tracking-[-0.025em] text-fg">{season === '2027' ? '2027 FA 승인 선수' : '2028 FA 예상 후보'}</h2>
              <p className="mt-0.5 text-xs text-fg3">{season === '2027' ? 'KBO 공식 승인 22명 · 계약 발표는 확인된 4건만 반영' : 'KBO 공식 공시 전 · 비공식 참고 목록이며 대상은 달라질 수 있음'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input type="search" aria-label="선수 검색" placeholder="선수 검색" value={query} onChange={(e) => setQuery(e.target.value)}
                className="min-w-0 flex-1 rounded-control border border-line bg-surface px-3 py-2 text-[13px] text-fg outline-none placeholder:text-fg3 sm:w-40 sm:flex-none" />
              <select aria-label="구단 필터" value={team} onChange={(e) => setTeam(e.target.value as TeamCode | 'ALL')}
                className="rounded-control border border-line bg-surface px-3 py-2 text-[13px] text-fg">
                <option value="ALL">전체 구단</option>
                {TEAM_CODES.map((code) => <option key={code} value={code}>{TEAM_ASSETS[code].name}</option>)}
              </select>
            </div>
          </div>

          {season === '2027' && (
            <div className="flex gap-1 overflow-x-auto px-4 pt-4 sm:px-5">
              {([['all', '전체', FA_2027.length], ['signed', '계약 완료', signedCount], ['pending', '미정', FA_2027.length - signedCount]] as const).map(([value, label, count]) => (
                <button key={value} type="button" onClick={() => { setStatus(value); setSelectedName(null); }}
                  className={`shrink-0 rounded-chip px-3 py-1.5 text-[12.5px] ${status === value ? 'bg-accent-soft font-semibold text-accent' : 'font-medium text-fg2 hover:bg-surface2'}`}>
                  {label} <span className="tnum">{count}</span>
                </button>
              ))}
            </div>
          )}

          <div className="p-4 sm:p-5">
            {season === '2027' ? (
              current.length ? <div className="grid gap-2.5">{current.map((player) => (
                <PlayerRow key={player.name} player={player} selected={selectedName === player.name} onSelect={() => setSelectedName(selectedName === player.name ? null : player.name)} />
              ))}</div> : <p className="py-12 text-center text-sm text-fg3">조건에 맞는 선수가 없습니다.</p>
            ) : (
              next.length ? <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">{next.map((player) => (
                <div key={`${player.team}-${player.name}`} className="flex items-center gap-3 rounded-control border border-line px-3.5 py-3">
                  <TeamBadge team={player.team} size={32} radius={9} />
                  <span className="font-semibold text-fg">{player.name}</span>
                  <span className="ml-auto text-xs text-fg3">{teamName(player.team)} · 예상</span>
                </div>
              ))}</div> : <p className="py-12 text-center text-sm text-fg3">조건에 맞는 선수가 없습니다.</p>
            )}
          </div>
        </section>

        {season === '2027' && selected && prediction && (
          <section className="rounded-card border border-accent/30 bg-surface p-5 shadow-card sm:p-6" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-accent">행선지 예측 · 실험 기능</p>
                <h2 className="mt-1 text-[20px] font-bold tracking-[-0.03em] text-fg">{selected.name} → {TEAM_ASSETS[prediction.team].name}</h2>
              </div>
              <span className="rounded-chip bg-surface2 px-3 py-1.5 text-xs font-semibold text-fg2">확신도 {prediction.confidence}</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-fg2">
              계약 소식이 아닙니다. 공개된 계약 4건과 FA 등급만 반영한 규칙 기반 기준선이며, 구단 수요·협상·해외 진출은 반영하지 못합니다.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[12.5px] leading-relaxed text-fg2">
              {prediction.reasons.map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
          </section>
        )}

        <section className="rounded-control border border-line bg-surface2 px-5 py-4 text-[12.5px] leading-relaxed text-fg2">
          <p className="font-semibold text-fg">자료와 해석 기준</p>
          <p className="mt-1">‘미정’은 계약이 없다고 확정한 뜻이 아니라 {FA_AS_OF.replaceAll('-', '.')}까지 발표를 확인하지 못했다는 뜻입니다. 자동 갱신 데이터가 아닙니다.</p>
          <p className="mt-1">2028 목록은 KBO 공시가 나오기 전의 비공식 예상입니다. 출전 연수, 계약 옵션, 은퇴 여부에 따라 실제 명단과 달라질 수 있습니다.</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <SourceLink href={FA_SOURCES.approved}>KBO 승인 명단</SourceLink>
            <SourceLink href={FA_SOURCES.eligible}>KBO 자격·등급 공시</SourceLink>
            <SourceLink href={FA_SOURCES.doosan}>두산 계약 발표</SourceLink>
            <SourceLink href={FA_SOURCES.ssg}>SSG 계약 발표</SourceLink>
            <SourceLink href={FA_SOURCES.next}>2028 비공식 예상 출처</SourceLink>
          </div>
        </section>
      </main>
    </div>
  );
}

function PlayerRow({ player, selected, onSelect }: { player: FAPlayer; selected: boolean; onSelect: () => void }) {
  const signed = !!player.contract;
  return (
    <div className="flex flex-col gap-3 rounded-control border border-line px-3.5 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4">
      <div className="flex min-w-0 items-center gap-3 sm:w-[210px] sm:shrink-0">
        <TeamBadge team={player.team} size={36} radius={10} />
        <div className="min-w-0">
          <p className="truncate text-[14px] font-bold text-fg">{player.name}</p>
          <p className="text-xs text-fg3">{teamName(player.team)} · {player.grade}등급</p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-between gap-3 sm:min-w-0">
        {signed && player.contract ? (
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-fg">{teamName(player.contract.team)} · {player.contract.years} 최대 {player.contract.maxEok}억원</p>
            <p className="mt-0.5 text-xs text-fg3">계약 완료 · {player.contract.announced.replaceAll('-', '.')} 발표</p>
          </div>
        ) : (
          <div><p className="text-[13px] font-semibold text-fg2">계약 미정</p><p className="mt-0.5 text-xs text-fg3">공식 발표 확인 전</p></div>
        )}
        {signed && player.contract ? <SourceLink href={player.contract.source}>출처</SourceLink> : (
          <button type="button" aria-expanded={selected} onClick={onSelect} className="shrink-0 rounded-chip bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent hover:opacity-80">
            {selected ? '예측 닫기' : '행선지 예측'}
          </button>
        )}
      </div>
    </div>
  );
}
