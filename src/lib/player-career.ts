import {
  ADVANCED_FROM,
  CAREER_FROM,
  CareerBattingSeason,
  CareerPitchingSeason,
  PlayerCareer,
} from '@/types/player-career';
import { findTeam } from '@/lib/team-assets';
import { fetchLeagueContext, LeagueYear } from '@/lib/league-context';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://sports.naver.com/',
};

/** 네이버가 KBO 기록을 주는 첫 시즌 */
export const FIRST_SEASON = CAREER_FROM;

type Raw = Record<string, any>;

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** 0 이면 값이 없는 것으로 본다. WAR·wRC+ 는 없는 시즌에 0 으로 온다. */
const advanced = (year: number, v: unknown): number | null => {
  if (year < ADVANCED_FROM) return null;
  const n = num(v);
  return n === 0 ? null : n;
};

/**
 * 이닝을 아웃 수로 바꾼다. `pitcherInning` 은 숫자(155)로 올 때도 있고
 * "138 2/3" 같은 문자열로 올 때도 있다.
 */
export function inningsToOuts(v: unknown): number {
  if (typeof v === 'number') return Math.round(v * 3);
  const s = String(v ?? '').trim();
  if (!s) return 0;
  const m = /^(\d+)?\s*(?:(\d)\/3)?$/.exec(s);
  if (!m) return Math.round(num(s) * 3);
  return num(m[1]) * 3 + num(m[2]);
}

export function outsToInnings(outs: number): string {
  const whole = Math.floor(outs / 3);
  const rest = outs % 3;
  return rest === 0 ? String(whole) : `${whole} ${rest}/3`;
}

async function fetchSeason(year: number, type: 'HITTER' | 'PITCHER', isCurrent: boolean) {
  const url = `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/players?playerType=${type}&pageSize=500`;
  const res = await fetch(url, {
    headers: HEADERS,
    // 끝난 시즌은 더 바뀌지 않는다. 진행 중인 시즌만 짧게 잡는다.
    next: { revalidate: isCurrent ? 600 : 60 * 60 * 24 * 7 },
  });
  if (!res.ok) throw new Error(`naver ${res.status}`);
  const json = await res.json();
  return (json?.result?.seasonPlayerStats ?? []) as Raw[];
}

/** 2007년 기록은 teamName 이 비어 있다. profile JSON 에서 꺼내 채운다. */
function teamOf(r: Raw): { name: string; short: string } {
  const direct = String(r.teamShortName || r.teamName || '');
  if (direct) return { name: String(r.teamName || direct), short: direct };
  let profile: Raw = {};
  try {
    profile = JSON.parse(String(r.profile ?? '{}'));
  } catch {
    profile = {};
  }
  const asset = findTeam(String(profile.teamCode ?? ''), String(profile.teamName ?? ''));
  return {
    name: asset?.name ?? String(profile.teamName ?? ''),
    short: asset?.shortName ?? String(profile.teamName ?? ''),
  };
}

function toBatting(r: Raw): CareerBattingSeason {
  const year = num(r.year);
  const team = teamOf(r);
  return {
    year,
    teamName: team.name,
    teamShortName: team.short,
    games: num(r.hitterGameCount),
    atBats: num(r.hitterAb),
    hits: num(r.hitterHit),
    doubles: num(r.hitterH2),
    triples: num(r.hitterH3),
    homeRuns: num(r.hitterHr),
    rbi: num(r.hitterRbi),
    runs: num(r.hitterRun),
    steals: num(r.hitterSb),
    walks: num(r.hitterBb),
    strikeouts: num(r.hitterKk),
    avg: num(r.hitterHra),
    obp: num(r.hitterObp),
    slg: num(r.hitterSlg),
    ops: num(r.hitterOps),
    wrcPlus: advanced(year, r.hitterWrcPlus),
    war: advanced(year, r.hitterWar),
    opsPlus: null,
  };
}

function toPitching(r: Raw): CareerPitchingSeason {
  const year = num(r.year);
  const outs = inningsToOuts(r.pitcherInning);
  const team = teamOf(r);
  return {
    year,
    teamName: team.name,
    teamShortName: team.short,
    games: num(r.pitcherGameCount),
    wins: num(r.pitcherWin),
    losses: num(r.pitcherLose),
    saves: num(r.pitcherSave),
    holds: num(r.pitcherHold),
    innings: outsToInnings(outs),
    outs,
    strikeouts: num(r.pitcherKk),
    walks: num(r.pitcherBb),
    earnedRuns: num(r.pitcherEr),
    era: num(r.pitcherEra),
    whip: num(r.pitcherWhip),
    war: advanced(year, r.pitcherWar),
    eraPlus: null,
  };
}

/** 합계. 비율 지표는 더하면 안 되므로 누적값에서 다시 계산한다. */
function battingTotal(rows: CareerBattingSeason[]): CareerBattingSeason | null {
  if (rows.length === 0) return null;
  const s = <K extends keyof CareerBattingSeason>(k: K) =>
    rows.reduce((a, r) => a + (r[k] as number), 0);

  const ab = s('atBats');
  const hits = s('hits');
  const walks = s('walks');
  const doubles = s('doubles');
  const triples = s('triples');
  const hr = s('homeRuns');
  // 희생타·몸에 맞는 공이 없어 출루율은 (안타+볼넷)/(타수+볼넷) 으로 근사한다.
  const obp = ab + walks > 0 ? (hits + walks) / (ab + walks) : 0;
  const singles = hits - doubles - triples - hr;
  const slg = ab > 0 ? (singles + doubles * 2 + triples * 3 + hr * 4) / ab : 0;
  const warSum = rows.filter((r) => r.war !== null).reduce((a, r) => a + (r.war ?? 0), 0);

  return {
    year: 0,
    teamName: '',
    teamShortName: '통산',
    games: s('games'),
    atBats: ab,
    hits,
    doubles,
    triples,
    homeRuns: hr,
    rbi: s('rbi'),
    runs: s('runs'),
    steals: s('steals'),
    walks,
    strikeouts: s('strikeouts'),
    avg: ab > 0 ? hits / ab : 0,
    obp,
    slg,
    ops: obp + slg,
    wrcPlus: null,
    war: rows.some((r) => r.war !== null) ? warSum : null,
    opsPlus: null,
  };
}

function pitchingTotal(rows: CareerPitchingSeason[]): CareerPitchingSeason | null {
  if (rows.length === 0) return null;
  const s = <K extends keyof CareerPitchingSeason>(k: K) =>
    rows.reduce((a, r) => a + (r[k] as number), 0);

  const outs = s('outs');
  const innings = outs / 3;
  const er = s('earnedRuns');
  const walks = s('walks');
  // 피안타가 목록에 없어 WHIP 은 시즌 WHIP 을 이닝으로 가중 평균한다.
  const whipWeighted =
    outs > 0 ? rows.reduce((a, r) => a + r.whip * r.outs, 0) / outs : 0;
  const warSum = rows.filter((r) => r.war !== null).reduce((a, r) => a + (r.war ?? 0), 0);

  return {
    year: 0,
    teamName: '',
    teamShortName: '통산',
    games: s('games'),
    wins: s('wins'),
    losses: s('losses'),
    saves: s('saves'),
    holds: s('holds'),
    innings: outsToInnings(outs),
    outs,
    strikeouts: s('strikeouts'),
    walks,
    earnedRuns: er,
    era: innings > 0 ? (er * 9) / innings : 0,
    whip: whipWeighted,
    war: rows.some((r) => r.war !== null) ? warSum : null,
    eraPlus: null,
  };
}

/**
 * 시대 보정 지표.
 *
 * 리그 평균자책이 2012년 3.82, 2014년 5.22 로 크게 움직여서 ERA 를 그냥 비교하면
 * 시대 차이가 선수 실력으로 보인다. 그래서 그 선수가 던진 **각 시즌의** 리그 평균으로
 * 기대 자책점을 만들어 실제 자책점과 견준다. 한 시즌만 잘 던진 선수와 오래 던진
 * 선수를 같은 기준에 놓는다.
 *
 *   ERA+ = (그 이닝을 리그 평균 투수가 던졌을 때의 자책점) / (실제 자책점) x 100
 *   OPS+ = (출루율/리그출루율 + 장타율/리그장타율 - 1) x 100
 *
 * 100 이 리그 평균이고 높을수록 좋다. 리그 기준선이 없는 시즌은 null 로 둔다.
 */
function eraPlus(
  rows: Array<{ year: number; outs: number; earnedRuns: number }>,
  league: Map<number, LeagueYear>,
): number | null {
  let expected = 0;
  let actual = 0;
  for (const r of rows) {
    const lg = league.get(r.year);
    if (!lg || lg.era <= 0) continue;
    expected += (lg.era * (r.outs / 3)) / 9;
    actual += r.earnedRuns;
  }
  if (expected <= 0 || actual <= 0) return null;
  return (expected / actual) * 100;
}

function opsPlus(
  obp: number,
  slg: number,
  rows: Array<{ year: number; atBats: number }>,
  league: Map<number, LeagueYear>,
): number | null {
  // 리그 기준선은 그 선수가 뛴 시즌들을 타수로 가중 평균한다.
  let ab = 0;
  let lgObp = 0;
  let lgSlg = 0;
  for (const r of rows) {
    const lg = league.get(r.year);
    if (!lg || lg.obp <= 0 || lg.slg <= 0) continue;
    ab += r.atBats;
    lgObp += lg.obp * r.atBats;
    lgSlg += lg.slg * r.atBats;
  }
  if (ab <= 0) return null;
  const baseObp = lgObp / ab;
  const baseSlg = lgSlg / ab;
  if (baseObp <= 0 || baseSlg <= 0) return null;
  return (obp / baseObp + slg / baseSlg - 1) * 100;
}

/**
 * 선수 한 명의 커리어를 만든다.
 *
 * 네이버에 선수 개인 상세 API 가 없으므로(403) 2008년부터 올해까지 연도별
 * 선수 목록을 타자·투수 양쪽으로 받아 `playerId` 로 걸러낸다. 호출이 38회라
 * 많아 보이지만 한 번에 0.1초 남짓이고, 끝난 시즌은 일주일 캐시한다.
 */
export async function fetchPlayerCareer(playerId: string): Promise<PlayerCareer | null> {
  const thisYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = FIRST_SEASON; y <= thisYear; y += 1) years.push(y);

  const jobs = years.flatMap((y) =>
    (['HITTER', 'PITCHER'] as const).map((t) =>
      fetchSeason(y, t, y >= thisYear)
        .then((rows) => ({ type: t, rows: rows.filter((r) => String(r.playerId) === playerId) }))
        .catch(() => ({ type: t, rows: [] as Raw[] })),
    ),
  );
  const results = await Promise.all(jobs);

  const battingRaw: Raw[] = [];
  const pitchingRaw: Raw[] = [];
  for (const { type, rows } of results) {
    (type === 'HITTER' ? battingRaw : pitchingRaw).push(...rows);
  }
  if (battingRaw.length === 0 && pitchingRaw.length === 0) return null;

  const batting = battingRaw.map(toBatting).sort((a, b) => a.year - b.year);
  const pitching = pitchingRaw.map(toPitching).sort((a, b) => a.year - b.year);

  // 시대 보정. 뛴 시즌 범위만 받으면 되므로 커리어가 짧으면 호출도 적다.
  const seasons = [...batting, ...pitching].map((r) => r.year);
  const league = await fetchLeagueContext(Math.min(...seasons), Math.max(...seasons)).catch(
    () => new Map(),
  );
  for (const r of pitching) r.eraPlus = eraPlus([r], league);
  for (const r of batting) r.opsPlus = opsPlus(r.obp, r.slg, [r], league);

  // 가장 최근 시즌 기록에서 신상을 가져온다.
  const latest = [...battingRaw, ...pitchingRaw].sort((a, b) => num(b.year) - num(a.year))[0];
  let profile: Raw = {};
  try {
    profile = JSON.parse(String(latest?.profile ?? '{}'));
  } catch {
    profile = {};
  }

  const team = findTeam(String(profile.teamCode ?? ''), String(latest?.teamName ?? ''));

  const bTotal = battingTotal(batting);
  const pTotal = pitchingTotal(pitching);
  if (pTotal) pTotal.eraPlus = eraPlus(pitching, league);
  if (bTotal) bTotal.opsPlus = opsPlus(bTotal.obp, bTotal.slg, batting, league);

  return {
    playerId,
    name: String(latest?.playerName ?? profile.name ?? ''),
    position: String(profile.position ?? ''),
    backNumber: String(profile.backNumber ?? latest?.backNumber ?? ''),
    teamName: String(profile.teamName ?? latest?.teamName ?? ''),
    teamCode: team?.code ?? '',
    height: num(latest?.height),
    weight: num(latest?.weight),
    isRetired: String(latest?.isRetire ?? 'N') === 'Y',
    batting,
    pitching,
    battingTotal: bTotal,
    pitchingTotal: pTotal,
    hasPreAdvancedSeasons: [...batting, ...pitching].some((r) => r.year < ADVANCED_FROM),
  };
}
