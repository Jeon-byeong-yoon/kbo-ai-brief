/** 우승 확률 예측. 시뮬레이션 결과이며 학습 모델이 아니다. */

export interface TeamStrength {
  teamCode: string;
  teamName: string;
  shortName: string;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  gamesLeft: number;
  /** 실제 승률 */
  actualWinRate: number;
  /** 득실점 기반 피타고리안 기대 승률 */
  pythagoreanWinRate: number;
  /** 팀 WAR 합에서 환산한 승률 */
  depthWinRate: number;
  /** 소속 선수 WAR 합 */
  totalWar: number;
  /** 위 셋을 섞고 평균으로 수축시킨 최종 전력 추정치 */
  talent: number;
}

export interface TeamOutcome {
  teamCode: string;
  teamName: string;
  shortName: string;
  /** 현재 순위 */
  rank: number;
  strength: TeamStrength;
  /** 예상 최종 승수 (시뮬레이션 평균) */
  projectedWins: number;
  /** 포스트시즌 진출 확률 (%) */
  playoffOdds: number;
  /** 정규시즌 1위 확률 (%) */
  pennantOdds: number;
  /** 한국시리즈 진출 확률 (%) */
  finalsOdds: number;
  /** 한국시리즈 우승 확률 (%) */
  championshipOdds: number;
}

export interface ChampionshipPrediction {
  year: number;
  /** 시뮬레이션 횟수 */
  iterations: number;
  /** 남은 정규시즌 경기 수 */
  gamesRemaining: number;
  /** 정규시즌이 이미 끝났는지 */
  regularSeasonOver: boolean;
  teams: TeamOutcome[];
  model: {
    homeWinRate: number;
    pythagoreanExponent: number;
    weights: { pythagorean: number; actual: number; depth: number };
    regression: number;
    calibratedOn: string;
  };
  /**
   * 네이버 응답이 말하는 "아직 안 치른 가장 이른 경기" 날짜 (YYYY-MM-DD).
   * 캐시가 낡으면 이 값도 같이 과거로 남으므로 데이터의 신선도를 그대로 드러낸다.
   */
  dataAsOf: string | null;
  /** dataAsOf 가 오늘보다 며칠 뒤처졌는지. 0 이면 최신. */
  staleDays: number;
  /** 시뮬레이션을 돌린 시각. 데이터의 나이와는 다르다. */
  generatedAt: string;
}
