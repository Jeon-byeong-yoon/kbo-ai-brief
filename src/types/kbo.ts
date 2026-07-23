// KBO AI Brief Core Types
export type GameStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'POSTPONED';

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
  streak: string; // e.g. '3연승'
}

export interface PitcherLeader {
  rank: number;
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
