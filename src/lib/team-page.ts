import { NAVER_HEADERS, REVALIDATE } from '@/lib/naver';
import {
  TeamGameLine,
  TeamMonthRecord,
  TeamPage,
  TeamRosterEntry,
  TeamVsRecord,
} from '@/types/team-page';
import { fetchRegularSeasonGames } from '@/lib/head-to-head';
import { findTeam, naverCodeOf, TeamCode } from '@/lib/team-assets';

type Raw = Record<string, any>;

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const str = (v: unknown) => String(v ?? '');
const pad = (n: number) => String(n).padStart(2, '0');
const lastDay = (y: number, m: number) => new Date(y, m, 0).getDate();

async function fetchJson(url: string, revalidate: number) {
  const res = await fetch(url, { headers: NAVER_HEADERS, next: { revalidate } });
  if (!res.ok) throw new Error(`naver ${res.status}`);
  return res.json();
}

const shortOf = (naver: string) => findTeam(naver)?.shortName ?? naver;
const internalOf = (naver: string) => findTeam(naver)?.code ?? naver;

/** 로스터. 팀 코드로 걸러서 받으면 전체 목록을 받을 필요가 없다. */
async function fetchRoster(
  year: number,
  team: string,
  type: 'HITTER' | 'PITCHER',
  revalidate: number,
): Promise<TeamRosterEntry[]> {
  const json = await fetchJson(
    `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/players?playerType=${type}&teamCode=${team}&pageSize=500`,
    revalidate,
  ).catch(() => null);

  const rows: Raw[] = json?.result?.seasonPlayerStats ?? [];
  const isHitter = type === 'HITTER';

  return rows
    .map((r) => {
      // WAR 은 2017년부터만 있다. 없는 값을 0 으로 보이면 안 되므로 null 로 둔다.
      const war = year >= 2017 ? num(isHitter ? r.hitterWar : r.pitcherWar) : null;
      return {
        playerId: str(r.playerId),
        name: str(r.playerName),
        backNumber: str(r.backNumber),
        position: isHitter ? '야수' : '투수',
        primary: isHitter
          ? num(r.hitterHra).toFixed(3).replace(/^0/, '')
          : num(r.pitcherEra).toFixed(2),
        primaryLabel: isHitter ? '타율' : 'ERA',
        games: num(isHitter ? r.hitterGameCount : r.pitcherGameCount),
        war,
      };
    })
    .sort((a, b) => (b.war ?? 0) - (a.war ?? 0) || b.games - a.games);
}

/** 아직 치르지 않은 경기. 일정에 올라온 것만 보이므로 순연 경기는 빠질 수 있다. */
async function fetchUpcoming(
  year: number,
  team: string,
  revalidate: number,
): Promise<TeamGameLine[]> {
  const today = new Date().toISOString().slice(0, 10);
  const out: TeamGameLine[] = [];

  for (let m = 3; m <= 11; m += 1) {
    const to = `${year}-${pad(m)}-${pad(lastDay(year, m))}`;
    if (to < today) continue;
    const json = await fetchJson(
      `https://api-gw.sports.naver.com/schedule/games?fromDate=${year}-${pad(m)}-01&toDate=${to}&upperCategoryId=kbaseball&size=400`,
      revalidate,
    ).catch(() => null);

    for (const g of (json?.result?.games ?? []) as Raw[]) {
      if (g.categoryId !== 'kbo') continue;
      if (g.statusCode !== 'BEFORE' && g.statusCode !== 'READY') continue;
      // 순연된 경기는 지난 날짜에 BEFORE 로 남아 있기도 하다. 그건 남은 경기가 아니다.
      if (str(g.gameDate) < today) continue;
      const home = str(g.homeTeamCode) === team;
      if (!home && str(g.awayTeamCode) !== team) continue;
      const opp = home ? str(g.awayTeamCode) : str(g.homeTeamCode);
      out.push({
        gameId: str(g.gameId),
        date: str(g.gameDate),
        opponent: internalOf(opp),
        opponentShortName: shortOf(opp),
        home,
        result: null,
        score: str(g.gameDateTime).slice(11, 16) || '',
      });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 10);
}

export async function fetchTeamPage(code: TeamCode, year: number): Promise<TeamPage | null> {
  const team = naverCodeOf(code);
  if (!team) return null;

  const isCurrent = year >= new Date().getFullYear();
  const revalidate = isCurrent ? REVALIDATE.season : REVALIDATE.archived;

  const [standingsJson, regular, hitters, pitchers, upcoming] = await Promise.all([
    fetchJson(
      `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/teams`,
      revalidate,
    ),
    fetchRegularSeasonGames(year),
    fetchRoster(year, team, 'HITTER', revalidate),
    fetchRoster(year, team, 'PITCHER', revalidate),
    isCurrent ? fetchUpcoming(year, team, revalidate) : Promise.resolve([]),
  ]);

  const teams: Raw[] = standingsJson?.result?.seasonTeamStats ?? [];
  const me = teams.find((t) => str(t.teamId) === team);
  if (!me) return null;

  // 정규시즌 순위는 네이버의 wra 로 매긴다. ranking 은 포스트시즌까지 반영한 최종 순위다.
  const rank =
    [...teams].sort((a, b) => num(b.wra) - num(a.wra)).findIndex((t) => str(t.teamId) === team) + 1;

  const mine = (regular ?? []).filter(
    (g) => g.homeTeamCode === team || g.awayTeamCode === team,
  );

  const toLine = (g: (typeof mine)[number]): TeamGameLine => {
    const home = g.homeTeamCode === team;
    const my = home ? num(g.homeTeamScore) : num(g.awayTeamScore);
    const their = home ? num(g.awayTeamScore) : num(g.homeTeamScore);
    const opp = home ? g.awayTeamCode : g.homeTeamCode;
    return {
      gameId: g.gameId,
      date: g.gameDate,
      opponent: internalOf(opp),
      opponentShortName: shortOf(opp),
      home,
      result: my > their ? 'W' : my < their ? 'L' : 'D',
      score: `${my}:${their}`,
    };
  };

  // 월별 성적
  const byMonth = new Map<number, TeamMonthRecord>();
  for (const g of mine) {
    const month = Number(g.gameDate.slice(5, 7));
    const row =
      byMonth.get(month) ?? { month, wins: 0, losses: 0, draws: 0, winRate: 0 };
    const line = toLine(g);
    if (line.result === 'W') row.wins += 1;
    else if (line.result === 'L') row.losses += 1;
    else row.draws += 1;
    byMonth.set(month, row);
  }
  const monthly = [...byMonth.values()]
    .map((r) => ({ ...r, winRate: r.wins + r.losses > 0 ? r.wins / (r.wins + r.losses) : 0 }))
    .sort((a, b) => a.month - b.month);

  // 상대별 전적
  const byOpponent = new Map<string, TeamVsRecord>();
  for (const g of mine) {
    const line = toLine(g);
    const row =
      byOpponent.get(line.opponent) ?? {
        opponent: line.opponent,
        opponentShortName: line.opponentShortName,
        wins: 0,
        losses: 0,
        draws: 0,
      };
    if (line.result === 'W') row.wins += 1;
    else if (line.result === 'L') row.losses += 1;
    else row.draws += 1;
    byOpponent.set(line.opponent, row);
  }

  return {
    year,
    teamCode: code,
    teamName: str(me.teamName),
    shortName: str(me.teamShortName || me.teamName),
    rank,
    wins: num(me.winGameCount),
    losses: num(me.loseGameCount),
    draws: num(me.drawnGameCount),
    winRate: num(me.wra),
    gameBehind: num(me.gameBehind),
    battingAvg: num(me.offenseHra),
    era: num(me.defenseEra),
    runs: num(me.offenseRun),
    runsAllowed: num(me.defenseR),
    monthly,
    recent: mine.slice(-10).map(toLine).reverse(),
    upcoming,
    vs: [...byOpponent.values()].sort((a, b) => b.wins - a.wins || a.losses - b.losses),
    hitters: hitters.slice(0, 15),
    pitchers: pitchers.slice(0, 15),
  };
}
