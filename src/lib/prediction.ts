import { NAVER_HEADERS, REVALIDATE } from '@/lib/naver';
import { ChampionshipPrediction, TeamOutcome, TeamStrength } from '@/types/prediction';

/**
 * 모델 상수는 추정하지 않고 2008~2025 실제 경기에서 측정했다.
 *  - 홈 승률: 정규시즌 9,732경기(무승부 제외) 중 홈 4,961승 -> 0.5196
 *  - 피타고리안 지수: 140 팀-시즌에 대해 잔차가 최소가 되는 값 -> 1.80
 * 측정 방법은 docs/PREDICTION.md 에 적어 두었다.
 */
export const MODEL = {
  homeWinRate: 0.5196,
  pythagoreanExponent: 1.8,
  /** 대체 선수로만 채운 팀이 144경기에서 거둘 승수. WAR 을 승률로 바꾸는 기준점. */
  replacementWins: 43,
  seasonGames: 144,
  weights: { pythagorean: 0.45, actual: 0.25, depth: 0.3 },
  /** 전력 추정치를 리그 평균(.500) 쪽으로 당기는 비율. 표본이 완벽하지 않으므로 둔다. */
  regression: 0.2,
  calibratedOn: '2008~2025 정규시즌 9,732경기 / 140 팀-시즌',
} as const;

type Raw = Record<string, any>;

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

async function fetchJson(url: string, revalidate: number) {
  const res = await fetch(url, { headers: NAVER_HEADERS, next: { revalidate } });
  if (!res.ok) throw new Error(`naver ${res.status}`);
  return res.json();
}

const pad = (n: number) => String(n).padStart(2, '0');
const lastDay = (y: number, m: number) => new Date(y, m, 0).getDate();

/** 아직 치르지 않은 정규시즌 경기 (원정팀, 홈팀 코드 쌍) */
async function fetchRemainingGames(
  year: number,
  codes: Set<string>,
  revalidate: number,
): Promise<Array<[string, string]>> {
  const out: Array<[string, string]> = [];
  const today = new Date().toISOString().slice(0, 10);

  for (let m = 3; m <= 11; m += 1) {
    const from = `${year}-${pad(m)}-01`;
    const to = `${year}-${pad(m)}-${pad(lastDay(year, m))}`;
    if (to < today) continue; // 지난 달은 볼 필요 없다

    const json = await fetchJson(
      `https://api-gw.sports.naver.com/schedule/games?fromDate=${from}&toDate=${to}&upperCategoryId=kbaseball&size=400`,
      revalidate,
    ).catch(() => null);

    for (const g of json?.result?.games ?? []) {
      if (g.categoryId !== 'kbo') continue;
      if (g.statusCode !== 'BEFORE' && g.statusCode !== 'READY') continue;
      if (!codes.has(g.awayTeamCode) || !codes.has(g.homeTeamCode)) continue;
      out.push([g.awayTeamCode, g.homeTeamCode]);
    }
  }
  return out;
}

/**
 * 네이버 팀 기록의 nextScheduleGameId 는 "20260926WOKT02026" 처럼 앞 8자리가 경기 날짜다.
 * 아직 치르지 않은 경기 중 가장 이른 날짜를 데이터 기준일로 본다.
 * 다만 이 필드는 조회한 연도와 무관하게 항상 "지금" 다음 경기를 가리키므로
 * 진행 중인 시즌에만 의미가 있다.
 *
 * fetch 캐시는 stale-while-revalidate 라서, 갱신이 밀리면 낡은 응답이 그대로 나간다.
 * 그때는 이 값도 같이 과거에 머무르므로 데이터가 며칠 밀렸는지 바로 드러난다.
 * 계산 시각(generatedAt)은 매 요청 새로 찍히므로 신선도 지표가 될 수 없다.
 */
function dataFreshness(
  teams: Raw[],
  isCurrent: boolean,
): { dataAsOf: string | null; staleDays: number } {
  // nextScheduleGameId 는 어느 연도를 조회하든 그 팀의 "지금" 다음 경기를 가리킨다.
  // 지난 시즌 기록에는 신선도 개념이 없으므로 쓰지 않는다.
  if (!isCurrent) return { dataAsOf: null, staleDays: 0 };

  const dates = teams
    .map((t) => String(t.nextScheduleGameId ?? '').slice(0, 8))
    .filter((d) => /^\d{8}$/.test(d))
    .map((d) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`)
    .sort();

  const dataAsOf = dates[0] ?? null;
  if (!dataAsOf) return { dataAsOf: null, staleDays: 0 };

  const today = new Date().toISOString().slice(0, 10);
  if (dataAsOf >= today) return { dataAsOf, staleDays: 0 };

  const dayMs = 24 * 60 * 60 * 1000;
  const diff = Math.floor((Date.parse(today) - Date.parse(dataAsOf)) / dayMs);
  return { dataAsOf, staleDays: Math.max(0, diff) };
}

type DepthCoverage = 'full' | 'pitcher-only' | 'none';

/**
 * 뎁스를 리그 평균 기준으로 환산한다. 평균 팀이 .500 이 되도록 중심을 맞춘 뒤
 * WAR 차이를 승수 차이로 본다. 절대 수준이 아니라 팀 간 차이만 쓰는 셈이다.
 *
 * 이렇게 하지 않으면 시즌마다 WAR 총량이 달라서 뎁스 항이 리그 전체를 위아래로
 * 밀어 버린다. 실제로 투수 WAR 만 있는 2014~2016 은 리그 평균 뎁스가 .392,
 * 둘 다 있는 2017년 이후는 .531 로 나와 서로 다른 모델이 된다.
 */
export function depthRate(war: number, leagueMeanWar: number): number {
  return 0.5 + (war - leagueMeanWar) / MODEL.seasonGames;
}

export function toStrength(
  t: Raw,
  war: number,
  leagueMeanWar: number,
  coverage: DepthCoverage,
): TeamStrength {
  const wins = num(t.winGameCount);
  const losses = num(t.loseGameCount);
  const draws = num(t.drawnGameCount);
  const gamesPlayed = wins + losses + draws;

  const runs = num(t.offenseRun);
  const runsAllowed = num(t.defenseR);
  const e = MODEL.pythagoreanExponent;

  const pythagoreanWinRate =
    runs > 0 && runsAllowed > 0
      ? runs ** e / (runs ** e + runsAllowed ** e)
      : 0.5;
  const actualWinRate = wins + losses > 0 ? wins / (wins + losses) : 0.5;
  const hasDepth = coverage !== 'none';
  const depthWinRate = hasDepth ? depthRate(war, leagueMeanWar) : 0.5;

  // 뎁스를 못 쓰는 시즌에는 상수를 섞지 않는다. 그러면 전력 격차만 30% 줄어든다.
  // 대신 남은 두 항끼리 가중치를 다시 1 로 맞춘다.
  const { pythagorean: wp, actual: wa, depth: wd } = MODEL.weights;
  const sum = hasDepth ? 1 : wp + wa;
  const blended = hasDepth
    ? pythagoreanWinRate * wp + actualWinRate * wa + depthWinRate * wd
    : (pythagoreanWinRate * wp + actualWinRate * wa) / sum;
  const talent = 0.5 + (blended - 0.5) * (1 - MODEL.regression);

  return {
    teamCode: String(t.teamId),
    teamName: String(t.teamName),
    shortName: String(t.teamShortName || t.teamName),
    wins,
    losses,
    draws,
    gamesPlayed,
    gamesLeft: Math.max(0, MODEL.seasonGames - gamesPlayed),
    actualWinRate,
    pythagoreanWinRate,
    depthWinRate,
    totalWar: war,
    officialWinRate: num(t.wra),
    talent: Math.min(0.8, Math.max(0.2, talent)),
  };
}

/**
 * log5 — 실력이 각각 a, b 인 두 팀이 붙었을 때 a 가 이길 확률.
 * 홈 어드밴티지는 측정한 홈 승률만큼 오즈에 곱해서 반영한다.
 */
export function winProbability(a: number, b: number, aIsHome: boolean): number {
  const base = (a - a * b) / (a + b - 2 * a * b);
  const hfa = MODEL.homeWinRate / (1 - MODEL.homeWinRate);
  const odds = (base / (1 - base)) * (aIsHome ? hfa : 1 / hfa);
  return odds / (1 + odds);
}

/** 단기 시리즈. 홈 배정 패턴(true = 상위 시드 홈)을 그대로 따른다. */
function simulateSeries(
  high: number,
  low: number,
  winsNeeded: number,
  homePattern: boolean[],
  rand: () => number,
): boolean {
  let hi = 0;
  let lo = 0;
  for (const highHome of homePattern) {
    if (hi === winsNeeded || lo === winsNeeded) break;
    const p = winProbability(high, low, highHome);
    if (rand() < p) hi += 1;
    else lo += 1;
  }
  return hi >= winsNeeded;
}

/**
 * KBO 포스트시즌. 시드 배열(0=정규1위 … 4=5위)을 받아 우승 시드와 한국시리즈에
 * 오른 두 시드를 돌려준다.
 *
 *  - 와일드카드: 4위 홈 최대 2경기. 4위는 1승만 해도 올라가므로 5위는 2연승해야 한다
 *  - 준플레이오프: 3위 vs 와일드카드 승자, 5전 3선승
 *  - 플레이오프: 2위 vs 준PO 승자, 5전 3선승
 *  - 한국시리즈: 정규 1위 vs PO 승자, 7전 4선승
 */
function simulatePostseason(
  seedTalent: number[],
  rand: () => number,
): { champion: number; finalists: [number, number] } {
  const wildcard =
    rand() < winProbability(seedTalent[4], seedTalent[3], false) &&
    rand() < winProbability(seedTalent[4], seedTalent[3], false)
      ? 4
      : 3;

  const semiFinal = simulateSeries(
    seedTalent[2],
    seedTalent[wildcard],
    3,
    [true, true, false, false, true],
    rand,
  )
    ? 2
    : wildcard;

  const playoffWinner = simulateSeries(
    seedTalent[1],
    seedTalent[semiFinal],
    3,
    [true, true, false, false, true],
    rand,
  )
    ? 1
    : semiFinal;

  const champion = simulateSeries(
    seedTalent[0],
    seedTalent[playoffWinner],
    4,
    [true, true, false, false, false, true, true],
    rand,
  )
    ? 0
    : playoffWinner;

  return { champion, finalists: [0, playoffWinner] };
}

/** 재현 가능한 난수 (mulberry32) */
function makeRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function predictChampionship(
  year: number,
  iterations = 20000,
): Promise<ChampionshipPrediction | null> {
  const isCurrent = year >= new Date().getFullYear();
  const revalidate = isCurrent ? REVALIDATE.season : REVALIDATE.archived;

  const [standingsJson, hittersJson, pitchersJson] = await Promise.all([
    fetchJson(`https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/teams`, revalidate),
    fetchJson(
      `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/players?playerType=HITTER&pageSize=500`,
      revalidate,
    ).catch(() => null),
    fetchJson(
      `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/players?playerType=PITCHER&pageSize=500`,
      revalidate,
    ).catch(() => null),
  ]);

  const teams: Raw[] = standingsJson?.result?.seasonTeamStats ?? [];
  if (teams.length === 0) return null;

  // 팀별 WAR 합 (선수 뎁스). shortName 으로 묶인다.
  const war = new Map<string, number>();
  const addWar = (rows: Raw[] | undefined, key: string) => {
    let total = 0;
    for (const p of rows ?? []) {
      const name = String(p.teamShortName || p.teamName);
      const v = num(p[key]);
      war.set(name, (war.get(name) ?? 0) + v);
      total += v;
    }
    return total;
  };
  const hitterTotal = addWar(hittersJson?.result?.seasonPlayerStats, 'hitterWar');
  const pitcherTotal = addWar(pitchersJson?.result?.seasonPlayerStats, 'pitcherWar');

  // 네이버는 WAR 을 2017년부터만 준다. 2014~2016 은 투수만 있고 그 전은 아예 없다.
  // 없는 값을 0 으로 받아 그대로 쓰면 전 팀이 같은 뎁스를 갖게 되므로 구분해서 다룬다.
  const depthCoverage: DepthCoverage =
    hitterTotal > 0 && pitcherTotal > 0
      ? 'full'
      : pitcherTotal > 0 || hitterTotal > 0
        ? 'pitcher-only'
        : 'none';

  const teamWars = teams.map((t) => war.get(String(t.teamShortName || t.teamName)) ?? 0);
  const leagueMeanWar = teamWars.reduce((a, b) => a + b, 0) / (teamWars.length || 1);

  const strengths = teams.map((t, i) =>
    toStrength(t, teamWars[i], leagueMeanWar, depthCoverage),
  );
  const byCode = new Map(strengths.map((s) => [s.teamCode, s]));
  const codes = [...byCode.keys()];
  const index = new Map(codes.map((c, i) => [c, i]));

  const remaining = await fetchRemainingGames(year, new Set(codes), revalidate);

  const talent = codes.map((c) => byCode.get(c)!.talent);
  const baseWins = codes.map((c) => byCode.get(c)!.wins);
  const baseLosses = codes.map((c) => byCode.get(c)!.losses);

  const champ = new Array(codes.length).fill(0);
  const finals = new Array(codes.length).fill(0);
  const playoff = new Array(codes.length).fill(0);
  const pennant = new Array(codes.length).fill(0);
  const winSum = new Array(codes.length).fill(0);

  const rand = makeRandom(year * 7919 + remaining.length);

  for (let it = 0; it < iterations; it += 1) {
    const wins = [...baseWins];
    const losses = [...baseLosses];

    for (const [awayCode, homeCode] of remaining) {
      const a = index.get(awayCode)!;
      const h = index.get(homeCode)!;
      if (rand() < winProbability(talent[a], talent[h], false)) {
        wins[a] += 1;
        losses[h] += 1;
      } else {
        wins[h] += 1;
        losses[a] += 1;
      }
    }

    // 최종 순위: 승률 순. 동률은 난수로 가른다(실제로는 상대전적 등으로 가린다).
    const order = codes
      .map((_, i) => i)
      .sort((x, y) => {
        const rx = wins[x] / Math.max(1, wins[x] + losses[x]);
        const ry = wins[y] / Math.max(1, wins[y] + losses[y]);
        return ry - rx || rand() - 0.5;
      });

    for (let i = 0; i < order.length; i += 1) winSum[order[i]] += wins[order[i]];
    pennant[order[0]] += 1;
    for (let i = 0; i < 5; i += 1) playoff[order[i]] += 1;

    const seeds = order.slice(0, 5);
    const seedTalent = seeds.map((i) => talent[i]);
    const { champion, finalists } = simulatePostseason(seedTalent, rand);
    champ[seeds[champion]] += 1;
    for (const seed of finalists) finals[seeds[seed]] += 1;
  }

  // 정규시즌 순위는 네이버의 wra 로 매긴다. 직접 승/(승+패) 로 계산하면 무승부를
  // 승률에 넣던 시절(2009년 KIA 81승 4무 48패 vs SK 80승 6무 47패)이 뒤집힌다.
  // 팀 기록의 ranking 필드는 포스트시즌까지 반영한 최종 순위라 쓸 수 없다.
  const ranked = [...strengths].sort(
    (a, b) => b.officialWinRate - a.officialWinRate || b.actualWinRate - a.actualWinRate,
  );
  const rankOf = new Map(ranked.map((s, i) => [s.teamCode, i + 1]));

  const outcomes: TeamOutcome[] = codes
    .map((code, i) => {
      const s = byCode.get(code)!;
      return {
        teamCode: code,
        teamName: s.teamName,
        shortName: s.shortName,
        rank: rankOf.get(code) ?? 0,
        strength: s,
        projectedWins: winSum[i] / iterations,
        playoffOdds: (playoff[i] / iterations) * 100,
        pennantOdds: (pennant[i] / iterations) * 100,
        finalsOdds: (finals[i] / iterations) * 100,
        championshipOdds: (champ[i] / iterations) * 100,
      };
    })
    .sort((a, b) => b.championshipOdds - a.championshipOdds || a.rank - b.rank);

  return {
    year,
    iterations,
    depthCoverage,
    gamesRemaining: remaining.length,
    regularSeasonOver: remaining.length === 0,
    teams: outcomes,
    model: {
      homeWinRate: MODEL.homeWinRate,
      pythagoreanExponent: MODEL.pythagoreanExponent,
      weights: MODEL.weights,
      regression: MODEL.regression,
      calibratedOn: MODEL.calibratedOn,
    },
    ...dataFreshness(teams, isCurrent),
    generatedAt: new Date().toISOString(),
  };
}
