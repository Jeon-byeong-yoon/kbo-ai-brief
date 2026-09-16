import { HeadToHead, HeadToHeadCell, HeadToHeadRow } from '@/types/head-to-head';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://sports.naver.com/',
};

interface ScheduleGame {
  gameId: string;
  gameDate: string;
  homeTeamCode: string;
  awayTeamCode: string;
  homeTeamScore: number;
  awayTeamScore: number;
}

type Record3 = [number, number, number]; // 승, 패, 무

const lastDay = (year: number, month: number) => new Date(year, month, 0).getDate();
const pad = (n: number) => String(n).padStart(2, '0');

async function fetchJson(url: string, revalidate: number) {
  const res = await fetch(url, { headers: HEADERS, next: { revalidate } });
  if (!res.ok) throw new Error(`naver ${res.status}`);
  return res.json();
}

/** 3~11월을 월 단위로 받는다. 네이버 일정 API 는 범위가 한 달을 넘으면 조용히 자른다. */
async function fetchSeasonGames(year: number, revalidate: number): Promise<ScheduleGame[]> {
  const games: ScheduleGame[] = [];

  for (let month = 3; month <= 11; month += 1) {
    const from = `${year}-${pad(month)}-01`;
    const to = `${year}-${pad(month)}-${pad(lastDay(year, month))}`;
    const json = await fetchJson(
      `https://api-gw.sports.naver.com/schedule/games?fromDate=${from}&toDate=${to}&upperCategoryId=kbaseball&size=400`,
      revalidate,
    );
    for (const game of json?.result?.games ?? []) {
      if (game.categoryId === 'kbo' && game.statusCode === 'RESULT') games.push(game);
    }
  }

  return games.sort((a, b) => a.gameDate.localeCompare(b.gameDate) || a.gameId.localeCompare(b.gameId));
}

const add = (t: Map<string, Record3>, code: string, i: 0 | 1 | 2) => {
  const row = t.get(code) ?? [0, 0, 0];
  row[i] += 1;
  t.set(code, row);
};

/**
 * 정규시즌 구간을 찾아낸다.
 *
 * 일정 API 는 시범경기(3월)와 포스트시즌(10~11월)을 정규시즌과 구분해 주지 않고,
 * 걸러낼 수 있는 필드도 없다. 대신 순위표의 공식 승·패·무가 정답이므로,
 * 경기를 날짜순으로 늘어놓고 "이 구간의 팀별 전적이 공식 기록과 정확히 일치하는"
 * 연속 구간을 찾는다. 찾으면 그 구간이 정규시즌이고, 못 찾으면 집계를 포기한다
 * (틀린 숫자를 보여주는 것보다 낫다).
 */
function findRegularSeason(games: ScheduleGame[], official: Map<string, Record3>): ScheduleGame[] | null {
  const codes = [...official.keys()];
  const total = [...official.values()].reduce((sum, r) => sum + r[0] + r[1] + r[2], 0) / 2;
  if (!Number.isInteger(total) || total <= 0 || games.length < total) return null;

  // 누적 전적을 미리 만들어 구간 합을 O(팀 수)로 구한다.
  const cumulative: Array<Map<string, Record3>> = [new Map(codes.map((c) => [c, [0, 0, 0]]))];
  for (const game of games) {
    const next = new Map<string, Record3>([...cumulative[cumulative.length - 1]].map(([k, v]) => [k, [...v] as Record3]));
    const { homeTeamCode: h, awayTeamCode: a } = game;
    const hs = game.homeTeamScore ?? 0;
    const as = game.awayTeamScore ?? 0;
    if (hs > as) {
      add(next, h, 0);
      add(next, a, 1);
    } else if (as > hs) {
      add(next, a, 0);
      add(next, h, 1);
    } else {
      add(next, h, 2);
      add(next, a, 2);
    }
    cumulative.push(next);
  }

  for (let i = 0; i + total <= games.length; i += 1) {
    const j = i + total;
    const matches = codes.every((code) => {
      const end = cumulative[j].get(code) ?? [0, 0, 0];
      const start = cumulative[i].get(code) ?? [0, 0, 0];
      const want = official.get(code)!;
      return end[0] - start[0] === want[0] && end[1] - start[1] === want[1] && end[2] - start[2] === want[2];
    });
    if (matches) return games.slice(i, j);
  }

  return null;
}

export async function fetchHeadToHead(year: number): Promise<HeadToHead | null> {
  const isCurrent = year >= new Date().getFullYear();
  const revalidate = isCurrent ? 60 * 60 : 60 * 60 * 24 * 7;

  const standings = await fetchJson(
    `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/teams`,
    revalidate,
  );
  const teams: Array<Record<string, any>> = standings?.result?.seasonTeamStats ?? [];
  if (teams.length === 0) return null;

  const official = new Map<string, Record3>(
    teams.map((t) => [
      String(t.teamId),
      [Number(t.winGameCount) || 0, Number(t.loseGameCount) || 0, Number(t.drawnGameCount) || 0],
    ]),
  );

  const all = await fetchSeasonGames(year, revalidate);
  // 올스타전처럼 구단이 아닌 팀이 끼는 경기는 뺀다.
  const clubGames = all.filter((g) => official.has(g.homeTeamCode) && official.has(g.awayTeamCode));

  const regular = findRegularSeason(clubGames, official);
  if (!regular) return null;

  const pair = new Map<string, Record3>();
  const key = (a: string, b: string) => `${a}:${b}`;
  const bump = (winner: string, loser: string) => {
    const w = pair.get(key(winner, loser)) ?? [0, 0, 0];
    w[0] += 1;
    pair.set(key(winner, loser), w);
    const l = pair.get(key(loser, winner)) ?? [0, 0, 0];
    l[1] += 1;
    pair.set(key(loser, winner), l);
  };
  const draw = (a: string, b: string) => {
    for (const [x, y] of [
      [a, b],
      [b, a],
    ]) {
      const r = pair.get(key(x, y)) ?? [0, 0, 0];
      r[2] += 1;
      pair.set(key(x, y), r);
    }
  };

  for (const game of regular) {
    const { homeTeamCode: h, awayTeamCode: a } = game;
    const hs = game.homeTeamScore ?? 0;
    const as = game.awayTeamScore ?? 0;
    if (hs > as) bump(h, a);
    else if (as > hs) bump(a, h);
    else draw(h, a);
  }

  // 순위는 승률 순 (네이버 ranking 은 끝난 시즌이면 최종 순위라 쓰지 않는다)
  const ordered = [...teams].sort(
    (a, b) => Number(b.wra) - Number(a.wra) || Number(a.gameBehind) - Number(b.gameBehind),
  );
  const teamCodes = ordered.map((t) => String(t.teamId));

  const rows: HeadToHeadRow[] = ordered.map((team, index) => {
    const code = String(team.teamId);
    const vs: Record<string, HeadToHeadCell> = {};
    for (const opponent of teamCodes) {
      if (opponent === code) continue;
      const [wins, losses, draws] = pair.get(key(code, opponent)) ?? [0, 0, 0];
      vs[opponent] = { wins, losses, draws };
    }
    const [wins, losses, draws] = official.get(code)!;
    return {
      rank: index + 1,
      teamCode: code,
      teamName: String(team.teamName),
      shortName: String(team.teamShortName || team.teamName),
      vs,
      total: { wins, losses, draws },
    };
  });

  return {
    year,
    teamCodes,
    rows,
    from: regular[0].gameDate,
    to: regular[regular.length - 1].gameDate,
    games: regular.length,
  };
}
