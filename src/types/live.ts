/** 진행 중인 경기의 실시간 상태. 네이버 중계(relay) 응답에서 뽑는다. */

export interface BallCount {
  balls: number;
  strikes: number;
  outs: number;
}

export interface BaseRunners {
  first: boolean;
  second: boolean;
  third: boolean;
}

export interface LivePitcher {
  name: string;
  backNumber: string;
  /** 오늘 투구수 */
  pitchCount: number;
  innings: string;
  strikeouts: number;
  walks: number;
  hits: number;
  runs: number;
  earnedRuns: number;
  seasonEra: string;
}

export interface LiveBatter {
  name: string;
  backNumber: string;
  position: string;
  batOrder: number;
  /** 오늘 성적 */
  atBats: number;
  hits: number;
  rbi: number;
  seasonAvg: number;
  /** 이 투수 상대 통산 타율 */
  vsAvg: string;
}

export interface LiveGameState {
  /** '1회초' 같은 표기 */
  inning: string;
  count: BallCount;
  runners: BaseRunners;
  pitcher: LivePitcher | null;
  batter: LiveBatter | null;
  /** 대기 타석 (다음 두 타자) */
  onDeck: string[];
  /** 투수 vs 타자 통산 전적 문구 */
  matchup: string;
  /** 네이버가 계산한 실시간 승리 확률 (%) */
  winRate: { home: number; away: number } | null;
  /** 최근 중계 문구 */
  lastPlay: string;
}

export interface TeamRheb {
  runs: number;
  hits: number;
  errors: number;
  walks: number;
}

export interface LineupEntry {
  order: number;
  /** 같은 타순 안에서의 출장 순서. 1부터 시작한다는 보장은 없다. */
  seqno: number;
  /** 그 타순의 선발 출장 선수인지. 아니면 교체로 들어온 선수다. */
  isStarter: boolean;
  position: string;
  name: string;
  backNumber: string;
  atBats: number;
  hits: number;
  rbi: number;
  runs: number;
  walks: number;
  strikeouts: number;
  seasonAvg: number;
}

export interface PitcherLine {
  name: string;
  backNumber: string;
  innings: string;
  pitchCount: number;
  hits: number;
  strikeouts: number;
  walks: number;
  runs: number;
  earnedRuns: number;
  seasonEra: string;
}
