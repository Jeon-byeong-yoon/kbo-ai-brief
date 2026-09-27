/** 구단 페이지. 흩어져 있는 데이터를 팀 기준으로 모은 것이다. */

export interface TeamMonthRecord {
  /** 3~11 */
  month: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
}

export interface TeamGameLine {
  gameId: string;
  date: string;
  /** 상대 구단 내부 코드 */
  opponent: string;
  opponentShortName: string;
  home: boolean;
  /** 아직 치르지 않은 경기면 null */
  result: 'W' | 'L' | 'D' | null;
  score: string;
}

export interface TeamRosterEntry {
  playerId: string;
  name: string;
  backNumber: string;
  position: string;
  /** 타자는 타율, 투수는 평균자책 */
  primary: string;
  primaryLabel: string;
  games: number;
  war: number | null;
}

export interface TeamVsRecord {
  opponent: string;
  opponentShortName: string;
  wins: number;
  losses: number;
  draws: number;
}

export interface TeamPage {
  year: number;
  teamCode: string;
  teamName: string;
  shortName: string;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  gameBehind: number;
  /** 팀 타율 */
  battingAvg: number;
  /** 팀 평균자책 */
  era: number;
  runs: number;
  runsAllowed: number;
  monthly: TeamMonthRecord[];
  recent: TeamGameLine[];
  upcoming: TeamGameLine[];
  vs: TeamVsRecord[];
  hitters: TeamRosterEntry[];
  pitchers: TeamRosterEntry[];
}
