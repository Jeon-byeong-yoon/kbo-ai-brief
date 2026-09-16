import { BatterLeader, PitcherLeader, PlayerSearchResult } from '@/types/kbo';

const NAVER_PLAYER_STATS_URL =
  'https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/2026/players';

const TEAM_NAMES: Record<string, string> = {
  OB: '두산 베어스',
  HT: 'KIA 타이거즈',
  HH: '한화 이글스',
  LT: '롯데 자이언츠',
  SS: '삼성 라이온즈',
  SK: 'SSG 랜더스',
  LG: 'LG 트윈스',
  KT: 'KT 위즈',
  WO: '키움 히어로즈',
  NC: 'NC 다이노스',
};

const TEAM_CODES: Record<string, string> = {
  OB: 'DOOSAN',
  HT: 'KIA',
  HH: 'HANWHA',
  LT: 'LOTTE',
  SS: 'SAMSUNG',
  SK: 'SSG',
  LG: 'LG',
  KT: 'KT',
  WO: 'KIWOOM',
  NC: 'NC',
};

interface NaverSeasonPlayerStat {
  ranking: number | null;
  playerId: string;
  playerName: string;
  profile?: string;
  teamId: string;
  teamName: string;
  teamShortName: string;
  year: number;
  pitcherEra?: number;
  pitcherWin?: number;
  pitcherLose?: number;
  pitcherSave?: number;
  pitcherHold?: number;
  pitcherGameCount?: number;
  pitcherInning?: string;
  pitcherKk?: number;
  pitcherWhip?: number;
  pitcherWar?: number;
  hitterHra?: number;
  hitterRbi?: number;
  hitterRun?: number;
  hitterHr?: number;
  hitterHit?: number;
  hitterGameCount?: number;
  hitterAb?: number;
  hitterSb?: number;
  hitterObp?: number;
  hitterSlg?: number;
  hitterOps?: number;
  hitterWar?: number;
}

interface NaverPlayersResponse {
  success: boolean;
  result?: {
    page: number;
    pageSize: number;
    seasonPlayerStats: NaverSeasonPlayerStat[];
  };
}

export interface LivePlayerData {
  pitchers: PitcherLeader[];
  batters: BatterLeader[];
  searchPlayers: PlayerSearchResult[];
  sourceUpdatedAt: string;
}

const formatAverage = (value = 0) => value.toFixed(3).replace(/^0/, '');
const formatDecimal = (value = 0, digits = 2) => value.toFixed(digits);

const parsePosition = (profile?: string, fallback = '선수') => {
  if (!profile) return fallback;
  try {
    const parsed = JSON.parse(profile) as { position?: string };
    return parsed.position || fallback;
  } catch {
    return fallback;
  }
};

const fullTeamName = (player: NaverSeasonPlayerStat) =>
  TEAM_NAMES[player.teamId] ?? player.teamName ?? player.teamShortName;

async function fetchPlayerType(playerType: 'PITCHER' | 'HITTER') {
  const response = await fetch(`${NAVER_PLAYER_STATS_URL}?playerType=${playerType}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Naver player stats request failed: ${playerType} ${response.status}`);
  }

  const json = (await response.json()) as NaverPlayersResponse;
  const players = json.result?.seasonPlayerStats;
  if (!json.success || !Array.isArray(players) || players.length === 0) {
    throw new Error(`Naver player stats response is empty: ${playerType}`);
  }
  return players;
}

export async function fetchLivePlayerData(): Promise<LivePlayerData> {
  const [rawPitchers, rawBatters] = await Promise.all([
    fetchPlayerType('PITCHER'),
    fetchPlayerType('HITTER'),
  ]);

  const pitchers: PitcherLeader[] = rawPitchers.map((player, index) => ({
    rank: player.ranking ?? index + 1,
    name: player.playerName,
    team: fullTeamName(player),
    era: player.pitcherEra ?? 0,
    wins: player.pitcherWin ?? 0,
    losses: player.pitcherLose ?? 0,
    saves: player.pitcherSave ?? 0,
    strikeouts: player.pitcherKk ?? 0,
    whip: player.pitcherWhip ?? 0,
    war: player.pitcherWar ?? 0,
  }));

  const batters: BatterLeader[] = rawBatters.map((player, index) => ({
    rank: player.ranking ?? index + 1,
    name: player.playerName,
    team: fullTeamName(player),
    avg: player.hitterHra ?? 0,
    homeRuns: player.hitterHr ?? 0,
    rbi: player.hitterRbi ?? 0,
    ops: player.hitterOps ?? 0,
    war: player.hitterWar ?? 0,
  }));

  const searchPlayers: PlayerSearchResult[] = [
    ...rawBatters.map((player) => ({
      id: `batter-${player.playerId}`,
      name: player.playerName,
      team: fullTeamName(player),
      teamCode: TEAM_CODES[player.teamId] ?? player.teamId,
      position: parsePosition(player.profile, '야수'),
      playerType: 'BATTER' as const,
      seasonYear: player.year,
      stats: [
        { label: '경기', value: String(player.hitterGameCount ?? 0) },
        { label: '타율', value: formatAverage(player.hitterHra) },
        { label: '안타', value: String(player.hitterHit ?? 0) },
        { label: '홈런', value: String(player.hitterHr ?? 0) },
        { label: '타점', value: String(player.hitterRbi ?? 0) },
        { label: '도루', value: String(player.hitterSb ?? 0) },
        { label: '출루율', value: formatAverage(player.hitterObp) },
        { label: '장타율', value: formatAverage(player.hitterSlg) },
        { label: 'OPS', value: formatDecimal(player.hitterOps, 3) },
        { label: 'WAR', value: formatDecimal(player.hitterWar, 2) },
      ],
    })),
    ...rawPitchers.map((player) => ({
      id: `pitcher-${player.playerId}`,
      name: player.playerName,
      team: fullTeamName(player),
      teamCode: TEAM_CODES[player.teamId] ?? player.teamId,
      position: parsePosition(player.profile, '투수'),
      playerType: 'PITCHER' as const,
      seasonYear: player.year,
      stats: [
        { label: '경기', value: String(player.pitcherGameCount ?? 0) },
        { label: '이닝', value: player.pitcherInning ?? '0' },
        { label: 'ERA', value: formatDecimal(player.pitcherEra) },
        { label: '승', value: String(player.pitcherWin ?? 0) },
        { label: '패', value: String(player.pitcherLose ?? 0) },
        { label: '세이브', value: String(player.pitcherSave ?? 0) },
        { label: '홀드', value: String(player.pitcherHold ?? 0) },
        { label: '탈삼진', value: String(player.pitcherKk ?? 0) },
        { label: 'WHIP', value: formatDecimal(player.pitcherWhip) },
        { label: 'WAR', value: formatDecimal(player.pitcherWar, 2) },
      ],
    })),
  ];

  return {
    pitchers,
    batters,
    searchPlayers,
    sourceUpdatedAt: new Date().toISOString(),
  };
}
