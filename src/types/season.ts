/** 연도별 기록 화면에서 쓰는 타입. 네이버 응답을 이 모양으로 정규화한다. */

export interface SeasonTeamRecord {
  /** 정규시즌 순위. 승률로 직접 매긴다 (아래 finalRank 설명 참고). */
  rank: number;
  /**
   * 네이버가 주는 ranking. 끝난 시즌에는 포스트시즌까지 반영한 최종 순위라
   * 정규시즌 순위와 다르다 (2015: 정규시즌 1위 삼성, 최종 1위 두산).
   */
  finalRank: number;
  teamCode: string;
  teamName: string;
  shortName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  gameBehind: number;
  streak: string;
  lastFive: string;
  /** 공격 */
  avg: number;
  ops: number;
  homeRuns: number;
  runs: number;
  steals: number;
  /** 수비 */
  era: number;
  whip: number;
  strikeouts: number;
  saves: number;
  errors: number;
}

export interface SeasonHitterRecord {
  rank: number;
  /** 규정 타석 충족 여부. 미충족 선수는 네이버가 순위를 매기지 않는다. */
  qualified: boolean;
  name: string;
  team: string;
  imageUrl: string | null;
  games: number;
  avg: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  steals: number;
  obp: number;
  slg: number;
  ops: number;
  war: number;
}

export interface SeasonPitcherRecord {
  rank: number;
  /** 규정 이닝 충족 여부. 미충족 선수는 네이버가 순위를 매기지 않는다. */
  qualified: boolean;
  name: string;
  team: string;
  imageUrl: string | null;
  games: number;
  era: number;
  wins: number;
  losses: number;
  saves: number;
  holds: number;
  /** '138 2/3' 처럼 분수 표기 문자열로 온다. 숫자로 바꾸지 않고 그대로 쓴다. */
  innings: string;
  strikeouts: number;
  whip: number;
  war: number;
}

export interface SeasonRecords {
  year: number;
  teams: SeasonTeamRecord[];
  hitters: SeasonHitterRecord[];
  pitchers: SeasonPitcherRecord[];
}

/** 네이버가 팀 기록을 주는 첫 시즌. 2007 이하는 빈 배열이거나 400 이다. */
export const FIRST_SEASON = 2008;
