'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ChampionBanner } from '@/components/ChampionBanner';
import { TeamBadge } from '@/components/ui/TeamBadge';
import { TEAM_ASSETS, TEAM_CODES, type TeamCode } from '@/lib/team-assets';
import {
  FA_2027,
  FA_2028_CANDIDATES,
  FA_AS_OF,
  FA_SOURCES,
  TEAM_NEEDS_2026,
  predictDestination,
  simulateFASignings,
  type FAPlayer,
  type FAPositionRole,
} from '@/lib/fa-market';

type Season = '2027' | '2028';
type Status = 'all' | 'signed' | 'pending';
type RoleFilter = 'ALL' | FAPositionRole;

const ROLES: readonly RoleFilter[] = ['ALL', '포수', '내야수', '외야수', '선발', '불펜'];

const teamName = (code: TeamCode) => TEAM_ASSETS[code].shortName;

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-accent hover:underline"
    >
      {children} ↗
    </a>
  );
}

export default function FAMarketPage() {
  const [favoriteTeam, setFavoriteTeam] = useState('NONE');
  const [season, setSeason] = useState<Season>('2027');
  const [status, setStatus] = useState<Status>('all');
  const [team, setTeam] = useState<TeamCode | 'ALL'>('ALL');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [query, setQuery] = useState('');
  const [selectedName, setSelectedName] = useState<string | null>(null);

  useEffect(() => {
    setFavoriteTeam(localStorage.getItem('kbo_favorite_team') ?? 'NONE');
  }, []);

  const current = useMemo(
    () =>
      FA_2027
        .filter((player) => team === 'ALL' || player.team === team)
        .filter((player) => roleFilter === 'ALL' || player.stats.role === roleFilter)
        .filter((player) => player.name.includes(query.trim()))
        .filter((player) => status === 'all' || (status === 'signed' ? !!player.contract : !player.contract))
        .sort((a, b) => Number(!!b.contract) - Number(!!a.contract) || b.stats.war - a.stats.war),
    [team, roleFilter, query, status],
  );

  const next = useMemo(
    () =>
      FA_2028_CANDIDATES
        .filter((player) => team === 'ALL' || player.team === team)
        .filter((player) => roleFilter === 'ALL' || player.stats.role === roleFilter)
        .filter((player) => player.name.includes(query.trim()))
        .sort((a, b) => b.stats.war - a.stats.war),
    [team, roleFilter, query],
  );

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
            공식 승인 선수의 2026 시즌 성적·계약 현황과 다음 시즌 예상 후보를 함께 봅니다. 미계약 선수는 선수 WAR·10개 구단 포지션별 WAR 결손도·FA 보상 등급을 결합한 데이터 모델로 예상 행선지 Top 3를 계산합니다.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              ['승인 선수', FA_2027.length, '명'],
              ['계약 확인', signedCount, '명'],
              ['발표 미확인', FA_2027.length - signedCount, '명'],
            ].map(([label, count, unit]) => (
              <div key={label} className="rounded-control border border-line bg-surface2 px-3 py-3 sm:px-5">
                <p className="text-xs text-fg2">{label}</p>
                <p className="tnum mt-1 text-[22px] font-bold tracking-[-0.04em] text-fg sm:text-[27px]">
                  {count}
                  <span className="ml-1 text-sm font-medium text-fg3">{unit}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-2 border-b border-line" role="tablist" aria-label="FA 시즌">
          {([
            ['2027', '2027 FA · 현재 시장'],
            ['2028', '2028 FA · 예상 후보'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={season === value}
              onClick={() => changeSeason(value)}
              className={`border-b-2 px-3 pb-3 pt-1 text-[13px] font-semibold transition-colors sm:px-5 sm:text-sm ${
                season === value ? 'border-accent text-accent' : 'border-transparent text-fg2 hover:text-fg'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <section className="rounded-card border border-line bg-surface shadow-card">
          <div className="flex flex-col gap-3 border-b border-hair p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-[17px] font-bold tracking-[-0.025em] text-fg">
                {season === '2027' ? '2027 FA 승인 선수' : '2028 FA 예상 후보'}
              </h2>
              <p className="mt-0.5 text-xs text-fg3">
                {season === '2027'
                  ? 'KBO 공식 승인 22명 · 계약 발표는 확인된 4건만 반영 · 2026 시즌 WAR 순 정렬'
                  : 'KBO 공식 공시 전 · 비공식 참고 목록이며 2026 시즌 WAR 순으로 정렬'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="search"
                aria-label="선수 검색"
                placeholder="선수 검색"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-w-0 flex-1 rounded-control border border-line bg-surface px-3 py-2 text-[13px] text-fg outline-none placeholder:text-fg3 sm:w-40 sm:flex-none"
              />
              <select
                aria-label="포지션 필터"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="rounded-control border border-line bg-surface px-3 py-2 text-[13px] text-fg"
              >
                <option value="ALL">전체 포지션</option>
                {ROLES.filter((r) => r !== 'ALL').map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <select
                aria-label="구단 필터"
                value={team}
                onChange={(e) => setTeam(e.target.value as TeamCode | 'ALL')}
                className="rounded-control border border-line bg-surface px-3 py-2 text-[13px] text-fg"
              >
                <option value="ALL">전체 구단</option>
                {TEAM_CODES.map((code) => (
                  <option key={code} value={code}>
                    {TEAM_ASSETS[code].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {season === '2027' && (
            <div className="flex gap-1 overflow-x-auto px-4 pt-4 sm:px-5">
              {([
                ['all', '전체', FA_2027.length],
                ['signed', '계약 완료', signedCount],
                ['pending', '미정', FA_2027.length - signedCount],
              ] as const).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setStatus(value);
                    setSelectedName(null);
                  }}
                  className={`shrink-0 rounded-chip px-3 py-1.5 text-[12.5px] ${
                    status === value ? 'bg-accent-soft font-semibold text-accent' : 'font-medium text-fg2 hover:bg-surface2'
                  }`}
                >
                  {label} <span className="tnum">{count}</span>
                </button>
              ))}
            </div>
          )}

          <div className="p-4 sm:p-5">
            {season === '2027' ? (
              current.length ? (
                <div className="grid gap-3">
                  {current.map((player) => (
                    <PlayerRow
                      key={player.name}
                      player={player}
                      selected={selectedName === player.name}
                      onSelect={() => setSelectedName(selectedName === player.name ? null : player.name)}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-fg3">조건에 맞는 선수가 없습니다.</p>
              )
            ) : next.length ? (
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {next.map((player) => (
                  <div
                    key={`${player.team}-${player.name}`}
                    className="flex flex-col gap-2 rounded-control border border-line bg-surface px-3.5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <TeamBadge team={player.team} size={32} radius={9} />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/players/${player.stats.playerId}`}
                          className="truncate text-[14px] font-bold text-fg hover:text-accent hover:underline"
                        >
                          {player.name}
                        </Link>
                        <p className="text-xs text-fg3">
                          {teamName(player.team)} · {player.stats.role}
                        </p>
                      </div>
                      <span className="tnum rounded-chip bg-surface2 px-2 py-0.5 text-[11.5px] font-semibold text-fg2">
                        WAR {player.stats.war.toFixed(2)}
                      </span>
                    </div>
                    <p className="tnum text-[11.5px] text-fg2">{player.stats.summaryLine}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-fg3">조건에 맞는 선수가 없습니다.</p>
            )}
          </div>
        </section>

        {/* "내가 단장이라면" FA 영입·잔류 시뮬레이터 */}
        <FAGMSimulatorSection favoriteTeam={favoriteTeam} />

        {/* 10개 구단 포지션별 WAR 요약표 (행선지 예측 근거 데이터) */}
        <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-accent">예측 모델 입력 데이터</p>
              <h2 className="mt-1 text-[17px] font-bold tracking-[-0.025em] text-fg">
                2026 구단별 포지션 WAR 분포
              </h2>
              <p className="mt-0.5 text-xs text-fg3">
                네이버 2026 시즌 전체 선수(타자 359명·투수 293명)의 WAR 합계입니다. 숫자가 낮은 포지션일수록 해당 구단의 FA 보강 수요 점수가 높게 반영됩니다.
              </p>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-hair text-xs text-fg3">
                  <th className="py-2 pr-3 font-semibold">구단</th>
                  <th className="px-2 py-2 text-right font-semibold">정규 순위</th>
                  <th className="px-2 py-2 text-right font-semibold">포수 WAR</th>
                  <th className="px-2 py-2 text-right font-semibold">내야수 WAR</th>
                  <th className="px-2 py-2 text-right font-semibold">외야수 WAR</th>
                  <th className="px-2 py-2 text-right font-semibold">선발 WAR</th>
                  <th className="px-2 py-2 text-right font-semibold">불펜 WAR</th>
                  <th className="pl-2 py-2 text-right font-semibold">팀 ERA / OPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {TEAM_CODES.map((code) => ({ code, ...TEAM_NEEDS_2026[code] }))
                  .sort((a, b) => a.rank - b.rank)
                  .map((row) => (
                    <tr key={row.code} className="hover:bg-surface2/60">
                      <td className="py-2 pr-3 font-semibold text-fg">
                        <div className="flex items-center gap-2">
                          <TeamBadge team={row.code} size={22} radius={6} />
                          <span>{TEAM_ASSETS[row.code].shortName}</span>
                        </div>
                      </td>
                      <td className="tnum px-2 py-2 text-right text-fg2">{row.rank}위</td>
                      {(['포수', '내야수', '외야수', '선발', '불펜'] as const).map((pos) => {
                        const val = row.positionWar[pos];
                        const isWeak =
                          (pos === '포수' && val < 1.0) ||
                          (pos === '내야수' && val < 8.5) ||
                          (pos === '외야수' && val < 6.0) ||
                          (pos === '선발' && val < 7.2) ||
                          (pos === '불펜' && val < 1.0);
                        return (
                          <td
                            key={pos}
                            className={`tnum px-2 py-2 text-right ${
                              isWeak ? 'font-bold text-accent' : 'text-fg2'
                            }`}
                          >
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                      <td className="tnum pl-2 py-2 text-right text-xs text-fg3">
                        {row.era.toFixed(2)} / {row.ops.toFixed(3)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-control border border-line bg-surface2 px-5 py-4 text-[12.5px] leading-relaxed text-fg2">
          <p className="font-semibold text-fg">자료와 해석 기준</p>
          <p className="mt-1">
            ‘미정’은 계약이 없다고 확정한 뜻이 아니라 {FA_AS_OF.replaceAll('-', '.')}까지 발표를 확인하지 못했다는 뜻입니다. 자동 갱신 데이터가 아닙니다.
          </p>
          <p className="mt-1">
            행선지 예측은 유료 AI 생성 문장이 아니라, 2026 시즌 선수 WAR·10개 구단 포지션별 WAR 결손도·FA 등급 보상 규정을 조합한 통계적 적합도 기준선입니다.
          </p>
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

function PlayerRow({
  player,
  selected,
  onSelect,
}: {
  player: FAPlayer;
  selected: boolean;
  onSelect: () => void;
}) {
  const signed = !!player.contract;
  const prediction = !signed ? predictDestination(player) : null;

  return (
    <div
      className={`rounded-control border transition-colors ${
        selected ? 'border-accent/50 bg-surface' : 'border-line bg-surface'
      }`}
    >
      <div className="flex flex-col gap-3 px-3.5 py-3.5 sm:flex-row sm:items-center sm:gap-4 sm:px-4">
        <div className="flex min-w-0 items-center gap-3 sm:w-[230px] sm:shrink-0">
          <TeamBadge team={player.team} size={38} radius={10} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/players/${player.stats.playerId}`}
                className="truncate text-[14.5px] font-bold text-fg hover:text-accent hover:underline"
              >
                {player.name}
              </Link>
              <span className="rounded-chip bg-surface2 px-2 py-0.5 text-[11px] font-semibold text-fg2">
                {player.stats.role}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-fg3">
              {teamName(player.team)} · {player.grade}등급 ·{' '}
              <span className="tnum font-semibold text-fg2">WAR {player.stats.war.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="tnum text-xs text-fg2">{player.stats.summaryLine}</p>
          {signed && player.contract ? (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-[13.5px] font-bold text-fg">
                {teamName(player.contract.team)} · {player.contract.years} 최대 {player.contract.maxEok}억원
              </span>
              <span className="text-xs text-fg3">
                ({player.contract.announced.replaceAll('-', '.')} 발표)
              </span>
            </div>
          ) : (
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-[13px] font-semibold text-fg2">계약 미정</span>
              {prediction && (
                <span className="text-xs text-fg3">
                  · 모델 1순위: <strong className="font-semibold text-accent">{prediction.label}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 sm:shrink-0">
          {signed && player.contract ? (
            <SourceLink href={player.contract.source}>출처</SourceLink>
          ) : (
            <button
              type="button"
              aria-expanded={selected}
              onClick={onSelect}
              className="shrink-0 rounded-chip bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent hover:opacity-80"
            >
              {selected ? '예측 닫기' : '행선지 예측'}
            </button>
          )}
        </div>
      </div>

      {selected && prediction && (
        <div className="border-t border-hair bg-surface2/55 px-4 py-4 sm:px-5" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-accent">
                데이터 기반 행선지 적합도 Top 3 · {player.name} ({player.stats.role} · {player.grade}등급)
              </p>
              <h3 className="mt-0.5 text-[16px] font-bold tracking-[-0.025em] text-fg">
                1순위 예상: {TEAM_ASSETS[prediction.team].name} ({prediction.topCandidates[0].probability}%)
              </h3>
            </div>
            <span className="rounded-chip bg-surface px-2.5 py-1 text-[11.5px] font-semibold text-fg2">
              확신도 {prediction.confidence} · 공식 발표 전
            </span>
          </div>

          <div className="mt-3.5 grid gap-2.5 sm:grid-cols-3">
            {prediction.topCandidates.map((cand, idx) => (
              <div
                key={cand.team}
                className={`rounded-control border bg-surface p-3 ${
                  idx === 0 ? 'border-accent/45' : 'border-line'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TeamBadge team={cand.team} size={24} radius={6} />
                    <div>
                      <p className="text-[13px] font-bold text-fg">
                        {idx + 1}순위 · {TEAM_ASSETS[cand.team].shortName}
                      </p>
                      <p className="text-[10.5px] text-fg3">
                        {cand.isRetention ? '원소속팀 잔류' : `외부 영입 · ${player.stats.role} WAR ${cand.roleWarRank}위`}
                      </p>
                    </div>
                  </div>
                  <span className="tnum text-[16px] font-bold text-accent">{cand.probability}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${cand.probability}%` }}
                  />
                </div>
                <p className="mt-2 text-[11.5px] leading-relaxed text-fg2">{cand.rationale}</p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11.5px] text-fg3">
            보상 규정: {prediction.compensationRule}
          </p>
        </div>
      )}
    </div>
  );
}

function FAGMSimulatorSection({ favoriteTeam }: { favoriteTeam: string }) {
  const defaultTeam: TeamCode = TEAM_CODES.includes(favoriteTeam as TeamCode)
    ? (favoriteTeam as TeamCode)
    : 'SAMSUNG';
  const [targetTeam, setTargetTeam] = useState<TeamCode>(defaultTeam);

  const pendingPlayers = useMemo(() => FA_2027.filter((p) => !p.contract), []);

  // 구단을 바꾸면 해당 구단의 내부 미계약 FA 선수들은 기본적으로 '잔류 체크' 상태로 시작
  const [selectedNames, setSelectedNames] = useState<string[]>(() =>
    pendingPlayers.filter((p) => p.team === defaultTeam).map((p) => p.name),
  );

  useEffect(() => {
    if (TEAM_CODES.includes(favoriteTeam as TeamCode)) {
      const code = favoriteTeam as TeamCode;
      setTargetTeam(code);
      setSelectedNames(pendingPlayers.filter((p) => p.team === code).map((p) => p.name));
    }
  }, [favoriteTeam, pendingPlayers]);

  const handleTeamChange = (code: TeamCode) => {
    setTargetTeam(code);
    setSelectedNames(pendingPlayers.filter((p) => p.team === code).map((p) => p.name));
  };

  const togglePlayer = (name: string) => {
    setSelectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const sim = useMemo(
    () => simulateFASignings(targetTeam, selectedNames),
    [targetTeam, selectedNames],
  );

  const ownPending = useMemo(
    () => pendingPlayers.filter((p) => p.team === targetTeam),
    [pendingPlayers, targetTeam],
  );
  const externalPending = useMemo(
    () =>
      pendingPlayers
        .filter((p) => p.team !== targetTeam)
        .sort((a, b) => b.stats.war - a.stats.war),
    [pendingPlayers, targetTeam],
  );

  return (
    <section
      aria-label="내가 단장이라면 FA 영입 시뮬레이터"
      className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair pb-4">
        <div>
          <span className="text-xs font-semibold text-accent">스토브리그 시뮬레이터</span>
          <h2 className="mt-0.5 text-[18px] font-bold tracking-[-0.03em] text-fg">
            내가 단장이라면 — 구단별 FA 영입·잔류 WAR 계산기
          </h2>
          <p className="mt-0.5 text-xs text-fg3">
            구단을 고르고 내부 FA 잔류 또는 외부 FA 영입을 체크하면 포지션별 WAR 리그 순위 변화, 2027 시즌 예상 승수 증감, 발생 보상선수 규정을 즉시 계산합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setSelectedNames(pendingPlayers.filter((p) => p.team === targetTeam).map((p) => p.name))
            }
            className="rounded-chip bg-surface2 px-3 py-1.5 text-xs font-semibold text-fg2 hover:text-fg"
          >
            기본(내부 잔류만) 초기화
          </button>
        </div>
      </div>

      {/* 구단 선택 칩 */}
      <div className="mt-3.5 flex gap-1.5 overflow-x-auto pb-1">
        {TEAM_CODES.map((code) => {
          const active = code === targetTeam;
          return (
            <button
              key={code}
              type="button"
              onClick={() => handleTeamChange(code)}
              className={`flex shrink-0 items-center gap-1.5 rounded-chip border px-3 py-1.5 text-xs transition-colors ${
                active
                  ? 'border-accent bg-accent-soft font-bold text-accent'
                  : 'border-line bg-surface2/50 font-medium text-fg2 hover:border-accent/40 hover:text-fg'
              }`}
            >
              <TeamBadge team={code} size={16} radius={4} />
              <span>{TEAM_ASSETS[code].shortName}</span>
            </button>
          );
        })}
      </div>

      {/* 상단 시뮬레이션 결과 요약 카드 4개 */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-control border border-line bg-surface2/50 p-3.5">
          <p className="text-xs text-fg3">순수 WAR 증감</p>
          <p
            className={`tnum mt-1 text-[21px] font-bold tracking-[-0.03em] ${
              sim.netWarDelta > 0
                ? 'text-accent'
                : sim.netWarDelta < 0
                  ? 'text-lose'
                  : 'text-fg'
            }`}
          >
            {sim.netWarDelta > 0 ? `+${sim.netWarDelta.toFixed(2)}` : sim.netWarDelta.toFixed(2)}
            <span className="ml-1 text-xs font-medium text-fg3">WAR</span>
          </p>
          <p className="tnum mt-0.5 text-[11px] text-fg3">
            외부 +{sim.addedExternalWar.toFixed(2)} / 이탈 -{sim.lostOwnWar.toFixed(2)}
          </p>
        </div>

        <div className="rounded-control border border-line bg-surface2/50 p-3.5">
          <p className="text-xs text-fg3">예상 승수 변화 (144경기 환산)</p>
          <p className="tnum mt-1 text-[21px] font-bold tracking-[-0.03em] text-fg">
            {sim.baseWins}승 → <span className="text-accent">{sim.projectedWins}승</span>
          </p>
          <p className="mt-0.5 text-[11px] text-fg3">
            2026 정규 {TEAM_NEEDS_2026[targetTeam].rank}위 기준
          </p>
        </div>

        <div className="rounded-control border border-line bg-surface2/50 p-3.5">
          <p className="text-xs text-fg3">선택한 계약 구성</p>
          <p className="tnum mt-1 text-[18px] font-bold tracking-[-0.03em] text-fg">
            내부 잔류 {sim.retainedPlayers.length}명 · 외부 {sim.externalSignings.length}명
          </p>
          <p className="mt-0.5 text-[11px] text-fg3">
            {sim.lostOwnPlayers.length > 0
              ? `내부 미계약 이탈 가정: ${sim.lostOwnPlayers.map((p) => p.name).join(', ')}`
              : '내부 FA 전원 잔류 시나리오'}
          </p>
        </div>

        <div className="rounded-control border border-line bg-surface2/50 p-3.5">
          <p className="text-xs text-fg3">발생 보상선수 부담</p>
          <p className="tnum mt-1 text-[17px] font-bold tracking-[-0.03em] text-fg">
            20인 외 {sim.compensationSummary.protected20Count}명 · 25인 외{' '}
            {sim.compensationSummary.protected25Count}명
          </p>
          <p className="mt-0.5 text-[11px] text-fg3">
            외부 A등급 {sim.compensationSummary.gradeACount} · B등급{' '}
            {sim.compensationSummary.gradeBCount} · C등급 {sim.compensationSummary.gradeCCount}
          </p>
        </div>
      </div>

      {sim.externalCountLimitExceeded && (
        <p className="mt-3 rounded-control border border-accent/40 bg-accent-soft/30 px-3.5 py-2 text-xs font-semibold text-accent">
          참고: 외부 FA를 {sim.externalSignings.length}명 선택했습니다. KBO 규정상 외부 FA 영입 상한(통상 최대 3명)을 초과하는 가상 시나리오입니다.
        </p>
      )}

      {/* 5대 포지션 WAR 및 리그 순위 변화 */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
        {sim.roleImpacts.map((impact) => {
          const rankUp = impact.afterRank < impact.beforeRank;
          const rankDown = impact.afterRank > impact.beforeRank;
          return (
            <div
              key={impact.role}
              className={`rounded-control border px-3.5 py-2.5 ${
                impact.deltaWar > 0
                  ? 'border-accent/45 bg-accent-soft/20'
                  : impact.deltaWar < 0
                    ? 'border-lose/40 bg-lose-soft/20'
                    : 'border-line bg-surface2/35'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-fg">{impact.role}</span>
                <span
                  className={`tnum font-bold ${
                    rankUp ? 'text-accent' : rankDown ? 'text-lose' : 'text-fg3'
                  }`}
                >
                  {impact.beforeRank}위 → {impact.afterRank}위
                </span>
              </div>
              <p className="tnum mt-1 text-[15px] font-bold text-fg">
                {impact.beforeWar.toFixed(2)} → {impact.afterWar.toFixed(2)}
              </p>
              <p className="tnum text-[11px] text-fg3">
                {impact.deltaWar > 0
                  ? `+${impact.deltaWar.toFixed(2)} WAR 상승`
                  : impact.deltaWar < 0
                    ? `${impact.deltaWar.toFixed(2)} WAR 감소`
                    : '변동 없음'}
              </p>
            </div>
          );
        })}
      </div>

      {/* 선수 선택 체크리스트 (내부 잔류 / 외부 영입) */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-control border border-line bg-surface2/30 p-4">
          <h3 className="text-[13.5px] font-bold text-fg">
            1. {TEAM_ASSETS[targetTeam].shortName} 내부 미계약 FA 잔류 선택 ({ownPending.length}명)
          </h3>
          <p className="mt-0.5 text-[11.5px] text-fg3">
            체크 해제 시 타 구단 이적(전력 이탈)으로 계산됩니다.
          </p>
          {ownPending.length === 0 ? (
            <p className="mt-3 text-xs text-fg3">
              현재 {TEAM_ASSETS[targetTeam].shortName} 소속 미계약 FA가 없습니다.
            </p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {ownPending.map((player) => {
                const checked = selectedNames.includes(player.name);
                return (
                  <button
                    key={player.name}
                    type="button"
                    onClick={() => togglePlayer(player.name)}
                    className={`flex items-center justify-between gap-2 rounded-control border px-3 py-2 text-left text-xs transition-colors ${
                      checked
                        ? 'border-accent bg-accent-soft/35 text-fg'
                        : 'border-line bg-surface text-fg2 hover:border-accent/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold">
                        {checked ? '✓ ' : ''}
                        {player.name}{' '}
                        <span className="font-normal text-fg3">
                          ({player.stats.role} · {player.grade})
                        </span>
                      </p>
                      <p className="tnum text-[11px] text-fg3">
                        WAR {player.stats.war.toFixed(2)} · {player.stats.primaryMetricLabel}{' '}
                        {player.stats.primaryMetricValue}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-chip px-2 py-0.5 text-[10.5px] font-bold ${
                        checked ? 'bg-accent text-white' : 'bg-surface2 text-fg3'
                      }`}
                    >
                      {checked ? '잔류' : '이탈'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-control border border-line bg-surface2/30 p-4">
          <h3 className="text-[13.5px] font-bold text-fg">
            2. 외부 미계약 FA 영입 선택 ({externalPending.length}명)
          </h3>
          <p className="mt-0.5 text-[11.5px] text-fg3">
            영입할 타 구단 FA 선수를 클릭해 추가해 보세요 (2026 WAR 순).
          </p>
          <div className="mt-3 grid max-h-[230px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {externalPending.map((player) => {
              const checked = selectedNames.includes(player.name);
              return (
                <button
                  key={player.name}
                  type="button"
                  onClick={() => togglePlayer(player.name)}
                  className={`flex items-center justify-between gap-2 rounded-control border px-3 py-2 text-left text-xs transition-colors ${
                    checked
                      ? 'border-accent bg-accent-soft/35 text-fg'
                      : 'border-line bg-surface text-fg2 hover:border-accent/40'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <TeamBadge team={player.team} size={22} radius={6} />
                    <div className="min-w-0">
                      <p className="truncate font-bold">
                        {checked ? '✓ ' : ''}
                        {player.name}{' '}
                        <span className="font-normal text-fg3">
                          ({player.stats.role} · {player.grade})
                        </span>
                      </p>
                      <p className="tnum text-[11px] text-fg3">
                        WAR +{player.stats.war.toFixed(2)} · {player.stats.primaryMetricLabel}{' '}
                        {player.stats.primaryMetricValue}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-chip px-2 py-0.5 text-[10.5px] font-bold ${
                      checked ? 'bg-accent text-white' : 'bg-surface2 text-fg3'
                    }`}
                  >
                    {checked ? '영입' : '선택'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {sim.compensationSummary.items.length > 0 && (
        <div className="mt-3.5 rounded-control border border-line bg-surface2/45 px-4 py-3 text-xs text-fg2">
          <p className="font-bold text-fg">외부 영입에 따른 KBO 보상 규정 내역</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[11.5px]">
            {sim.compensationSummary.items.map(({ player, rule }) => (
              <li key={player.name}>
                <strong className="text-fg">
                  {player.name} (원소속 {TEAM_ASSETS[player.team].shortName})
                </strong>
                : {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
