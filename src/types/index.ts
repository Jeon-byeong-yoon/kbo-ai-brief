export type GameStatus = "SCHEDULED" | "LIVE" | "FINAL" | "CANCELLED" | "POSTPONED";

export interface TeamSummary {
  id: number;
  name: string;
  shortName: string;
  logoUrl: string | null;
}

export interface StandingSummary {
  rank: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  gamesBehind: number;
  last10: string | null;
}

export interface GameListItem {
  id: number;
  gameDate: string;
  startTime: string;
  stadium: string;
  homeTeam: TeamSummary;
  awayTeam: TeamSummary;
  status: GameStatus;
  currentInning: string | null;
  homeScore: number;
  awayScore: number;
  lastUpdatedAt: string | null;
  hasAiPreview: boolean;
  hasAiReview: boolean;
}

export interface GameDetail extends GameListItem {
  homeHits: number;
  awayHits: number;
  homeErrors: number;
  awayErrors: number;
  homeWalks: number;
  awayWalks: number;
  inningScores: InningScores | null;
  homeStanding: StandingSummary | null;
  awayStanding: StandingSummary | null;
  aiPreview: AiContent | null;
  aiReview: AiContent | null;
}

export interface InningScores {
  home: number[];
  away: number[];
}

export interface AiContent {
  id: number;
  content: string;
  modelName: string;
  generatedAt: string;
}

export interface AiPreviewContent {
  summary: string;
  watchPoints: string[];
  variables: string[];
  watchPlayer: string;
}

export interface AiReviewContent {
  summary: string;
  keyMoment: string;
  impressivePlayer: string;
  gameFlow: {
    winner: string;
    loser: string;
  };
  nextWatch: string;
}

export interface StandingItem {
  rank: number;
  team: TeamSummary;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  gamesBehind: number;
  last10: string | null;
}
