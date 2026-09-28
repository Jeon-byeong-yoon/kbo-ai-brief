import {
  KBOTeam,
  KBOGame,
  KBOTeamStanding,
  PitcherLeader,
  BatterLeader,
  HistoricalSeason,
} from '../types/kbo';

export const TEAMS: Record<string, KBOTeam> = {
  LG: { id: 't1', name: 'LG 트윈스', shortName: 'LG', code: 'LG', logoBg: 'bg-rose-950 border-rose-600 text-rose-300' },
  DOOSAN: { id: 't2', name: '두산 베어스', shortName: '두산', code: 'DOOSAN', logoBg: 'bg-sky-950 border-sky-600 text-sky-300' },
  KT: { id: 't3', name: 'KT 위즈', shortName: 'KT', code: 'KT', logoBg: 'bg-zinc-900 border-zinc-500 text-amber-400' },
  SSG: { id: 't4', name: 'SSG 랜더스', shortName: 'SSG', code: 'SSG', logoBg: 'bg-red-950 border-red-600 text-red-300' },
  NC: { id: 't5', name: 'NC 다이노스', shortName: 'NC', code: 'NC', logoBg: 'bg-blue-950 border-cyan-500 text-cyan-300' },
  KIWOOM: { id: 't6', name: '키움 히어로즈', shortName: '키움', code: 'KIWOOM', logoBg: 'bg-fuchsia-950 border-fuchsia-600 text-fuchsia-300' },
  HANWHA: { id: 't7', name: '한화 이글스', shortName: '한화', code: 'HANWHA', logoBg: 'bg-orange-950 border-orange-500 text-orange-300' },
  LOTTE: { id: 't8', name: '롯데 자이언츠', shortName: '롯데', code: 'LOTTE', logoBg: 'bg-indigo-950 border-indigo-500 text-indigo-300' },
  SAMSUNG: { id: 't9', name: '삼성 라이온즈', shortName: '삼성', code: 'SAMSUNG', logoBg: 'bg-blue-950 border-blue-600 text-blue-300' },
  KIA: { id: 't10', name: 'KIA 타이거즈', shortName: 'KIA', code: 'KIA', logoBg: 'bg-red-950 border-rose-600 text-rose-400' },
};

export const MOCK_GAMES: KBOGame[] = [
  {
    id: 'game-20260723-1',
    date: '2026-07-23',
    time: '18:30',
    stadium: '잠실야구장',
    awayTeam: TEAMS.HANWHA,
    homeTeam: TEAMS.LG,
    awayScore: 3,
    homeScore: 4,
    status: 'IN_PROGRESS',
    currentInning: '7회말',
    awayPitcher: '류현진',
    homePitcher: '임찬규',
    broadcast: 'SPOTV',
  },
  {
    id: 'game-20260723-2',
    date: '2026-07-23',
    time: '18:30',
    stadium: '광주-기아 챔피언스 필드',
    awayTeam: TEAMS.SAMSUNG,
    homeTeam: TEAMS.KIA,
    awayScore: 2,
    homeScore: 7,
    status: 'FINISHED',
    awayPitcher: '원태인',
    homePitcher: '양현종',
    broadcast: 'KBS N SPORTS',
  },
  {
    id: 'game-20260723-3',
    date: '2026-07-23',
    time: '18:30',
    stadium: '수원 케이티위즈파크',
    awayTeam: TEAMS.SSG,
    homeTeam: TEAMS.KT,
    awayScore: 8,
    homeScore: 5,
    status: 'FINISHED',
    awayPitcher: '김광현',
    homePitcher: '고영표',
    broadcast: 'MBC SPORTS+',
  },
  {
    id: 'game-20260723-4',
    date: '2026-07-23',
    time: '18:30',
    stadium: '창원 NC파크',
    awayTeam: TEAMS.DOOSAN,
    homeTeam: TEAMS.NC,
    awayScore: 0,
    homeScore: 0,
    status: 'SCHEDULED',
    awayPitcher: '곽빈',
    homePitcher: '카스타노',
    broadcast: 'SBS SPORTS',
  },
];

export const MOCK_STANDINGS_TODAY: KBOTeamStanding[] = [
  { rank: 1, rankChange: 0, team: TEAMS.KIA, gamesPlayed: 90, wins: 55, losses: 33, draws: 2, winRate: 0.625, gameBehind: 0, recent10: '7승 3패', streak: '2연승' },
  { rank: 2, rankChange: 1, team: TEAMS.LG, gamesPlayed: 91, wins: 53, losses: 36, draws: 2, winRate: 0.596, gameBehind: 2.5, recent10: '6승 4패', streak: '1승' },
  { rank: 3, rankChange: -1, team: TEAMS.SAMSUNG, gamesPlayed: 92, wins: 52, losses: 38, draws: 2, winRate: 0.578, gameBehind: 4.0, recent10: '5승 5패', streak: '2연패' },
  { rank: 4, rankChange: 0, team: TEAMS.SSG, gamesPlayed: 89, wins: 48, losses: 40, draws: 1, winRate: 0.545, gameBehind: 7.0, recent10: '8승 2패', streak: '3연승' },
  { rank: 5, rankChange: 1, team: TEAMS.HANWHA, gamesPlayed: 90, wins: 45, losses: 43, draws: 2, winRate: 0.511, gameBehind: 10.0, recent10: '6승 4패', streak: '1패' },
  { rank: 6, rankChange: -1, team: TEAMS.DOOSAN, gamesPlayed: 91, wins: 44, losses: 45, draws: 2, winRate: 0.494, gameBehind: 11.5, recent10: '4승 6패', streak: '1패' },
  { rank: 7, rankChange: 0, team: TEAMS.KT, gamesPlayed: 92, wins: 43, losses: 47, draws: 2, winRate: 0.478, gameBehind: 13.0, recent10: '3승 7패', streak: '3연패' },
  { rank: 8, rankChange: 0, team: TEAMS.NC, gamesPlayed: 89, wins: 40, losses: 47, draws: 2, winRate: 0.460, gameBehind: 14.5, recent10: '5승 5패', streak: '1승' },
  { rank: 9, rankChange: 0, team: TEAMS.LOTTE, gamesPlayed: 88, wins: 38, losses: 48, draws: 2, winRate: 0.442, gameBehind: 16.0, recent10: '4승 6패', streak: '2연패' },
  { rank: 10, rankChange: 0, team: TEAMS.KIWOOM, gamesPlayed: 92, wins: 32, losses: 58, draws: 2, winRate: 0.356, gameBehind: 24.0, recent10: '2승 8패', streak: '5연패' },
];

export const MOCK_PITCHER_LEADERS: PitcherLeader[] = [
  { playerId: '', rank: 1, name: '양현종', team: 'KIA', era: 2.34, wins: 10, losses: 3, saves: 0, strikeouts: 112, whip: 1.05, war: 4.85 },
  { playerId: '', rank: 2, name: '류현진', team: '한화', era: 2.58, wins: 9, losses: 4, saves: 0, strikeouts: 105, whip: 1.10, war: 4.32 },
  { playerId: '', rank: 3, name: '원태인', team: '삼성', era: 2.85, wins: 10, losses: 5, saves: 0, strikeouts: 98, whip: 1.15, war: 3.95 },
  { playerId: '', rank: 4, name: '김광현', team: 'SSG', era: 2.92, wins: 8, losses: 5, saves: 0, strikeouts: 92, whip: 1.18, war: 3.65 },
  { playerId: '', rank: 5, name: '곽빈', team: '두산', era: 3.12, wins: 8, losses: 6, saves: 0, strikeouts: 101, whip: 1.22, war: 3.40 },
];

export const MOCK_BATTER_LEADERS: BatterLeader[] = [
  { playerId: '', rank: 1, name: '김도영', team: 'KIA', avg: 0.348, homeRuns: 28, rbi: 78, ops: 1.042, war: 5.62 },
  { playerId: '', rank: 2, name: '구자욱', team: '삼성', avg: 0.332, homeRuns: 22, rbi: 71, ops: 0.965, war: 4.88 },
  { playerId: '', rank: 3, name: '노시환', team: '한화', avg: 0.315, homeRuns: 25, rbi: 75, ops: 0.942, war: 4.52 },
  { playerId: '', rank: 4, name: '최정', team: 'SSG', avg: 0.298, homeRuns: 24, rbi: 69, ops: 0.925, war: 4.15 },
  { playerId: '', rank: 5, name: '박해민', team: 'LG', avg: 0.312, homeRuns: 8, rbi: 45, ops: 0.845, war: 3.82 },
];

export const MOCK_HISTORICAL_2025: HistoricalSeason = {
  year: 2025,
  champion: 'KIA 타이거즈',
  teams: [
    { rank: 1, name: 'KIA 타이거즈', code: 'KIA', gamesPlayed: 144, wins: 87, losses: 55, draws: 2, winRate: 0.613, postseasonResult: '한국시리즈 우승' },
    { rank: 2, name: '삼성 라이온즈', code: 'SAMSUNG', gamesPlayed: 144, wins: 78, losses: 64, draws: 2, winRate: 0.549, postseasonResult: '한국시리즈 준우승' },
    { rank: 3, name: 'LG 트윈스', code: 'LG', gamesPlayed: 144, wins: 76, losses: 66, draws: 2, winRate: 0.535, postseasonResult: '플레이오프 탈락' },
    { rank: 4, name: '두산 베어스', code: 'DOOSAN', gamesPlayed: 144, wins: 74, losses: 68, draws: 2, winRate: 0.521, postseasonResult: '준플레이오프 탈락' },
    { rank: 5, name: 'KT 위즈', code: 'KT', gamesPlayed: 144, wins: 72, losses: 70, draws: 2, winRate: 0.507, postseasonResult: '와일드카드 탈락' },
    { rank: 6, name: 'SSG 랜더스', code: 'SSG', gamesPlayed: 144, wins: 72, losses: 70, draws: 2, winRate: 0.507, postseasonResult: '정규 6위' },
    { rank: 7, name: '롯데 자이언츠', code: 'LOTTE', gamesPlayed: 144, wins: 66, losses: 74, draws: 4, winRate: 0.471, postseasonResult: '정규 7위' },
    { rank: 8, name: '한화 이글스', code: 'HANWHA', gamesPlayed: 144, wins: 66, losses: 76, draws: 2, winRate: 0.465, postseasonResult: '정규 8위' },
    { rank: 9, name: 'NC 다이노스', code: 'NC', gamesPlayed: 144, wins: 61, losses: 81, draws: 2, winRate: 0.430, postseasonResult: '정규 9위' },
    { rank: 10, name: '키움 히어로즈', code: 'KIWOOM', gamesPlayed: 144, wins: 58, losses: 86, draws: 0, winRate: 0.403, postseasonResult: '정규 10위' },
  ],
};
