import {
  SeasonHitterRecord,
  SeasonPitcherRecord,
  SeasonRecords,
  SeasonTeamRecord,
} from '@/types/season';

const BASE = 'https://api-gw.sports.naver.com/statistics/categories/kbo/seasons';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://sports.naver.com/',
};

type Raw = Record<string, unknown>;

const num = (v: unknown, digits?: number): number => {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return 0;
  return digits === undefined ? n : Number(n.toFixed(digits));
};
const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));

async function fetchJson(path: string, revalidate: number) {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS, next: { revalidate } });
  if (!res.ok) throw new Error(`naver ${res.status} ${path}`);
  return res.json();
}

function toTeam(raw: Raw): SeasonTeamRecord {
  return {
    rank: 0, // 아래 rankTeams() 에서 승률로 다시 매긴다
    finalRank: num(raw.ranking),
    teamCode: str(raw.teamId),
    teamName: str(raw.teamName),
    shortName: str(raw.teamShortName) || str(raw.teamName),
    gamesPlayed: num(raw.gameCount),
    wins: num(raw.winGameCount),
    losses: num(raw.loseGameCount),
    draws: num(raw.drawnGameCount),
    winRate: num(raw.wra, 3),
    gameBehind: num(raw.gameBehind, 1),
    streak: str(raw.continuousGameResult),
    lastFive: str(raw.lastFiveGames),
    avg: num(raw.offenseHra, 3),
    ops: num(raw.offenseOps, 3),
    homeRuns: num(raw.offenseHr),
    runs: num(raw.offenseRun),
    steals: num(raw.offenseSb),
    era: num(raw.defenseEra, 2),
    whip: num(raw.defenseWhip, 2),
    strikeouts: num(raw.defenseKk),
    saves: num(raw.defenseSave),
    errors: num(raw.defenseErr),
  };
}

function toHitter(raw: Raw): SeasonHitterRecord {
  return {
    rank: num(raw.ranking),
    qualified: raw.isQualified === true,
    name: str(raw.playerName),
    team: str(raw.teamShortName) || str(raw.teamName),
    imageUrl: str(raw.playerImageUrl) || null,
    games: num(raw.hitterGameCount),
    avg: num(raw.hitterHra, 3),
    hits: num(raw.hitterHit),
    homeRuns: num(raw.hitterHr),
    rbi: num(raw.hitterRbi),
    steals: num(raw.hitterSb),
    obp: num(raw.hitterObp, 3),
    slg: num(raw.hitterSlg, 3),
    ops: num(raw.hitterOps, 3),
    war: num(raw.hitterWar, 2),
  };
}

function toPitcher(raw: Raw): SeasonPitcherRecord {
  return {
    rank: num(raw.ranking),
    qualified: raw.isQualified === true,
    name: str(raw.playerName),
    team: str(raw.teamShortName) || str(raw.teamName),
    imageUrl: str(raw.playerImageUrl) || null,
    games: num(raw.pitcherGameCount),
    era: num(raw.pitcherEra, 2),
    wins: num(raw.pitcherWin),
    losses: num(raw.pitcherLose),
    saves: num(raw.pitcherSave),
    holds: num(raw.pitcherHold),
    innings: str(raw.pitcherInning) || '0',
    strikeouts: num(raw.pitcherKk),
    whip: num(raw.pitcherWhip, 2),
    war: num(raw.pitcherWar, 2),
  };
}

/**
 * 네이버의 ranking 은 끝난 시즌이면 포스트시즌까지 반영한 최종 순위다.
 * 2015 시즌을 예로 들면 정규시즌 1위는 삼성(88승 56패)인데 ranking 은 한국시리즈
 * 우승팀 두산(79승 65패)이 1 이다. 정규시즌 표에는 승률 순서가 맞으므로 직접 매긴다.
 * 게임차는 네이버가 계산해 준 값이라 동률일 때 보조 기준으로만 쓴다.
 */
function rankTeams(rows: SeasonTeamRecord[]): SeasonTeamRecord[] {
  return [...rows]
    .sort((a, b) => b.winRate - a.winRate || a.gameBehind - b.gameBehind || b.wins - a.wins)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

/**
 * 규정 타석·이닝을 채우지 못한 선수는 네이버가 ranking 을 주지 않는다(null).
 * 그대로 0 으로 두면 8경기 1안타 타율 1.000 같은 선수가 1위로 올라오므로 빼고,
 * 순위가 하나도 없는 시즌이라면(방어) 원래 순서를 유지한다.
 */
function rankOnly<T extends { rank: number }>(rows: T[]): T[] {
  const ranked = rows.filter((row) => row.rank > 0);
  return (ranked.length > 0 ? ranked : rows).sort((a, b) => a.rank - b.rank);
}

/**
 * 한 시즌의 팀·타자·투수 기록을 한 번에 모은다.
 *
 * 지난 시즌은 값이 더 이상 변하지 않으므로 하루, 진행 중인 시즌은 5분 캐시한다.
 * 세 요청 중 일부가 실패해도 나머지는 살려서 돌려준다 — 오래된 시즌은 선수 기록만
 * 비어 있는 경우가 있다.
 */
export async function fetchSeasonRecords(year: number): Promise<SeasonRecords> {
  const isCurrent = year >= new Date().getFullYear();
  const revalidate = isCurrent ? 300 : 60 * 60 * 24;

  const [teams, hitters, pitchers] = await Promise.all([
    fetchJson(`/${year}/teams`, revalidate).catch(() => null),
    fetchJson(`/${year}/players?playerType=HITTER`, revalidate).catch(() => null),
    fetchJson(`/${year}/players?playerType=PITCHER`, revalidate).catch(() => null),
  ]);

  const teamRows: Raw[] = teams?.result?.seasonTeamStats ?? [];
  const hitterRows: Raw[] = hitters?.result?.seasonPlayerStats ?? [];
  const pitcherRows: Raw[] = pitchers?.result?.seasonPlayerStats ?? [];

  return {
    year,
    teams: rankTeams(teamRows.map(toTeam)),
    hitters: rankOnly(hitterRows.map(toHitter)),
    pitchers: rankOnly(pitcherRows.map(toPitcher)),
  };
}
