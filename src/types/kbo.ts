import { MagicNumber } from '@/types/magic-number';

// KBO AI Brief Core Types
export type GameStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export interface KBOTeam {
  id: string;
  name: string;
  shortName: string;
  code: string; // e.g. 'LG', 'DOOSAN', 'KT', 'SSG', 'NC', 'KIWOOM', 'HANWHA', 'LOTTE', 'SAMSUNG', 'KIA'
  logoBg: string;
}

export interface AIBriefing {
  id: string;
  gameId: string;
  headline: string;
  summary: string;
  keyFactors: string[];
  pitcherAnalysis: string;
  updatedAt: string;
}

export interface InningScores {
  away: (number | string)[]; // 1~9회 점수 (예: [0, 1, 0, 2, 0, 0, 0, 0, 0])
  home: (number | string)[]; // 1~9회 점수 (예: [1, 0, 0, 0, 0, 0, 2, 2, 'X'])
}

export interface TeamGameStats {
  runs: number;
  hits: number;
  errors: number;
  walks: number;
}

export interface PlayerLineupItem {
  order: number;
  position: string;
  name: string;
  avg: number;
  hits: number;
  rbi: number;
}

export interface GamePlayerHighlight {
  id: string;
  name: string;
  team: string;
  teamShortName: string;
  teamCode: string;
  position: string;
  playerType: 'BATTER' | 'PITCHER';
  summary: string;
  stats: Array<{
    label: string;
    value: string;
  }>;
  reason: string;
}

export interface KBOGame {
  id: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // '18:30'
  stadium: string;
  awayTeam: KBOTeam;
  homeTeam: KBOTeam;
  awayScore: number;
  homeScore: number;
  status: GameStatus;
  currentInning?: string; // e.g. '7회말', '9회초'
  awayPitcher: string;
  homePitcher: string;
  broadcast?: string;
  aiPreview?: AIBriefing;
  aiReview?: AIBriefing;
  // 옵션 2 확장 필드
  inningScores?: InningScores;
  awayStats?: TeamGameStats;
  homeStats?: TeamGameStats;
  headToHeadRecord?: string; // e.g. '7승 4패 (한화 우세)'
  awayLineup?: PlayerLineupItem[];
  homeLineup?: PlayerLineupItem[];
  bestPlayer?: GamePlayerHighlight;
  worstPlayer?: GamePlayerHighlight;
}

export interface PlayerSearchResult {
  /** 타자/투수 구분이 섞인 목록이라 접두어를 붙인 값. 목록 key 로만 쓴다 */
  id: string;
  /** 네이버 선수 번호. 선수 상세로 이동할 때 쓴다 */
  playerId: string;
  name: string;
  team: string;
  teamCode: string;
  position: string;
  playerType: 'BATTER' | 'PITCHER';
  seasonYear: number;
  stats: Array<{
    label: string;
    value: string;
  }>;
}

export interface KBOTeamStanding {
  rank: number;
  rankChange?: number; // +1, -1, 0
  team: KBOTeam;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  gameBehind: number; // 승차
  recent10: string; // e.g. '7승3패'
  /** 매직넘버 / 트래직넘버. 시즌 중에만 의미가 있다 */
  magic?: MagicNumber;
  streak: string; // e.g. '3연승'
}

export interface PitcherLeader {
  rank: number;
  playerId: string;
  name: string;
  team: string;
  era: number;
  wins: number;
  losses: number;
  saves: number;
  strikeouts: number;
  whip: number;
  war: number;
}

export interface BatterLeader {
  rank: number;
  playerId: string;
  name: string;
  team: string;
  avg: number;
  homeRuns: number;
  rbi: number;
  ops: number;
  war: number;
}

export interface HistoricalTeamStanding {
  rank: number;
  name: string;
  code: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  postseasonResult: string;
}

export interface HistoricalSeason {
  year: number;
  champion: string;
  teams: HistoricalTeamStanding[];
}
