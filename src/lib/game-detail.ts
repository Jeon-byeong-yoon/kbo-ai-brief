import { GameStatus, InningScores, KBOGame, KBOTeam } from '@/types/kbo';
import {
  LineupEntry,
  LiveBatter,
  LiveGameState,
  LivePitcher,
  PitcherLine,
  TeamRheb,
} from '@/types/live';
import { findTeam } from '@/lib/team-assets';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://sports.naver.com/',
};

type Raw = Record<string, any>;

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const str = (v: unknown): string => (v == null ? '' : String(v));

export interface GameDetail extends KBOGame {
  awayRheb: TeamRheb;
  homeRheb: TeamRheb;
  awayBatters: LineupEntry[];
  homeBatters: LineupEntry[];
  awayPitchers: PitcherLine[];
  homePitchers: PitcherLine[];
  live: LiveGameState | null;
  winPitcher: string;
  losePitcher: string;
  weather: string;
  /** 진행 중이면 화면에서 폴링해야 한다 */
  isLive: boolean;
}

function mapStatus(code: string, info: string): GameStatus {
  if (code === 'BEFORE' || code === 'READY') return 'SCHEDULED';
  if (code === 'STARTED' || code === 'RUNNING') return 'IN_PROGRESS';
  if (code === 'RESULT' || code === 'AFTER') return 'FINISHED';
  if (code === 'CANCEL' || info === '취소' || info === '우천취소') return 'CANCELLED';
  if (code === 'POSTPONED') return 'POSTPONED';
  return 'SCHEDULED';
}

function toTeam(code: string, name: string, fullName: string): KBOTeam {
  const asset = findTeam(code, fullName, name);
  return {
    id: `t_${asset?.code ?? code}`,
    name: asset?.name ?? fullName ?? name,
    shortName: asset?.shortName ?? name,
    code: asset?.code ?? code,
    logoBg: '',
  };
}

const rheb = (arr: unknown): TeamRheb => {
  const a = Array.isArray(arr) ? arr : [];
  return { runs: num(a[0]), hits: num(a[1]), errors: num(a[2]), walks: num(a[3]) };
};

/**
 * 타순을 만든다. 교체 선수까지 함께 오므로 같은 타순 번호가 여러 번 나온다.
 *
 * seqno 가 1부터 시작한다는 보장은 없어서(어떤 팀은 2부터 시작한다) 절대값으로
 * 선발을 가리면 안 된다. 타순별로 seqno 가 가장 작은 선수를 선발로 본다.
 */
const toLineup = (rows: Raw[] = []): LineupEntry[] => {
  const mapped = rows
    .map((b) => ({
      order: num(b.batOrder),
      seqno: num(b.seqno),
      isStarter: false,
      position: str(b.posName),
      name: str(b.name),
      backNumber: str(b.backnum),
      atBats: num(b.ab),
      hits: num(b.hit),
      rbi: num(b.rbi),
      runs: num(b.run),
      walks: num(b.bb),
      strikeouts: num(b.so),
      seasonAvg: num(b.seasonHra),
    }))
    .sort((a, b) => a.order - b.order || a.seqno - b.seqno);

  const seen = new Set<number>();
  for (const row of mapped) {
    if (!seen.has(row.order)) {
      row.isStarter = true;
      seen.add(row.order);
    }
  }
  return mapped;
};

const toPitchers = (rows: Raw[] = []): PitcherLine[] =>
  rows.map((p) => ({
    name: str(p.name),
    backNumber: str(p.backnum),
    innings: str(p.inn),
    pitchCount: num(p.ballCount),
    hits: num(p.hit),
    strikeouts: num(p.kk),
    walks: num(p.bb),
    runs: num(p.run),
    earnedRuns: num(p.er),
    seasonEra: str(p.seasonEra),
  }));

/**
 * 진행 중인 경기의 볼카운트·주자·현재 대결을 뽑는다.
 *
 * relay 의 currentGameState 는 공을 던질 때마다 갱신된다. 공격 팀이 어느 쪽인지는
 * homeOrAway(0=원정 공격, 1=홈 공격)로 알 수 있고, 타순은 공격 팀 라인업에서 찾는다.
 */
function toLiveState(relay: Raw, inning: string): LiveGameState | null {
  const state: Raw | undefined = relay?.currentGameState;
  if (!state) return null;

  const homeBatting = str(relay.homeOrAway) === '1';
  const battingLineup: Raw[] = (homeBatting ? relay.homeLineup : relay.awayLineup)?.batter ?? [];
  const pitchingLineup: Raw[] = (homeBatting ? relay.awayLineup : relay.homeLineup)?.pitcher ?? [];

  const batterRaw = battingLineup.find((b) => str(b.pcode) === str(state.batter));
  const pitcherRaw = pitchingLineup.find((p) => str(p.pcode) === str(state.pitcher));

  const batter: LiveBatter | null = batterRaw
    ? {
        name: str(batterRaw.name),
        backNumber: str(batterRaw.backnum),
        position: str(batterRaw.posName),
        batOrder: num(batterRaw.batOrder),
        atBats: num(batterRaw.ab),
        hits: num(batterRaw.hit),
        rbi: num(batterRaw.rbi),
        seasonAvg: num(batterRaw.seasonHra),
        vsAvg: str(batterRaw.vsHra),
      }
    : null;

  const pitcher: LivePitcher | null = pitcherRaw
    ? {
        name: str(pitcherRaw.name),
        backNumber: str(pitcherRaw.backnum),
        pitchCount: num(pitcherRaw.ballCount),
        innings: str(pitcherRaw.inn),
        strikeouts: num(pitcherRaw.kk),
        walks: num(pitcherRaw.bb),
        hits: num(pitcherRaw.hit),
        runs: num(pitcherRaw.run),
        earnedRuns: num(pitcherRaw.er),
        seasonEra: str(pitcherRaw.seasonEra),
      }
    : null;

  // 대기 타석: 현재 타자 다음 두 명 (타순은 9번 다음 1번으로 돈다)
  const onDeck: string[] = [];
  if (batter) {
    for (let i = 1; i <= 2; i += 1) {
      const order = ((batter.batOrder - 1 + i) % 9) + 1;
      const next = battingLineup.find((b) => num(b.batOrder) === order);
      if (next) onDeck.push(`${order}. ${str(next.name)}`);
    }
  }

  const relays: Raw[] = relay.textRelays ?? [];
  const lastPlay = str(relays[0]?.textOptions?.[0]?.text ?? relays[0]?.title ?? '');

  const metric: Raw | undefined = relay.lastValidMetricOption;
  const winRate =
    metric && num(metric.homeTeamWinRate) + num(metric.awayTeamWinRate) > 0
      ? { home: num(metric.homeTeamWinRate), away: num(metric.awayTeamWinRate) }
      : null;

  return {
    inning,
    count: { balls: num(state.ball), strikes: num(state.strike), outs: num(state.out) },
    runners: {
      first: num(state.base1) > 0,
      second: num(state.base2) > 0,
      third: num(state.base3) > 0,
    },
    pitcher,
    batter,
    onDeck,
    matchup: str(relay.pitcherVsBatterCareerStats),
    winRate,
    lastPlay,
  };
}

async function fetchJson(url: string, live: boolean) {
  const res = await fetch(url, {
    headers: HEADERS,
    // 진행 중인 경기는 캐시하면 안 된다. 끝난 경기는 더 이상 바뀌지 않는다.
    ...(live ? { cache: 'no-store' as const } : { next: { revalidate: 300 } }),
  });
  if (!res.ok) throw new Error(`naver ${res.status}`);
  return res.json();
}

/** 네이버 경기 ID 형식인지 확인한다 (예: 20260926LGHT02026). */
export const isNaverGameId = (id: string) => /^\d{8}[A-Z]{2,4}\d?\w*$/.test(id);

export async function fetchGameDetail(gameId: string): Promise<GameDetail | null> {
  const headerJson = await fetchJson(
    `https://api-gw.sports.naver.com/schedule/games/${gameId}`,
    true,
  ).catch(() => null);

  const g: Raw | undefined = headerJson?.result?.game;
  if (!g) return null;

  const status = mapStatus(str(g.statusCode), str(g.statusInfo));
  const isLive = status === 'IN_PROGRESS';

  const relayJson = await fetchJson(
    `https://api-gw.sports.naver.com/schedule/games/${gameId}/relay`,
    isLive,
  ).catch(() => null);
  const relay: Raw = relayJson?.result?.textRelayData ?? {};

  const awayTeam = toTeam(str(g.awayTeamCode), str(g.awayTeamName), str(g.awayTeamFullName));
  const homeTeam = toTeam(str(g.homeTeamCode), str(g.homeTeamName), str(g.homeTeamFullName));

  const toScores = (arr: unknown): (number | string)[] =>
    (Array.isArray(arr) ? arr : []).map((v) => (v === '-' || v == null ? '-' : num(v)));

  const inningScores: InningScores = {
    away: toScores(g.awayTeamScoreByInning),
    home: toScores(g.homeTeamScoreByInning),
  };

  const awayRheb = rheb(g.awayTeamRheb);
  const homeRheb = rheb(g.homeTeamRheb);
  const timeMatch = str(g.gameDateTime).match(/T(\d{2}:\d{2})/);

  return {
    id: gameId,
    date: str(g.gameDate),
    time: timeMatch ? timeMatch[1] : '18:30',
    stadium: str(g.stadium),
    awayTeam,
    homeTeam,
    awayScore: num(g.awayTeamScore),
    homeScore: num(g.homeTeamScore),
    status,
    currentInning: str(g.currentInning) || undefined,
    awayPitcher: str(g.awayStarterName) || str(g.awayCurrentPitcherName) || '미정',
    homePitcher: str(g.homeStarterName) || str(g.homeCurrentPitcherName) || '미정',
    broadcast: str(g.broadChannel)
      .split('^')
      .filter(Boolean)
      .join(' · '),
    inningScores,
    awayStats: {
      runs: awayRheb.runs,
      hits: awayRheb.hits,
      errors: awayRheb.errors,
      walks: awayRheb.walks,
    },
    homeStats: {
      runs: homeRheb.runs,
      hits: homeRheb.hits,
      errors: homeRheb.errors,
      walks: homeRheb.walks,
    },
    awayRheb,
    homeRheb,
    awayBatters: toLineup(relay.awayLineup?.batter),
    homeBatters: toLineup(relay.homeLineup?.batter),
    awayPitchers: toPitchers(relay.awayLineup?.pitcher),
    homePitchers: toPitchers(relay.homeLineup?.pitcher),
    live: isLive ? toLiveState(relay, str(g.currentInning)) : null,
    winPitcher: str(g.winPitcherName),
    losePitcher: str(g.losePitcherName),
    weather: str(g.weatherInfo?.weather),
    isLive,
  };
}
