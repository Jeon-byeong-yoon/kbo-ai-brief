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
  /**
   * 팀 WAR 합을 리그 평균 기준으로 환산한 승률. 평균 팀이 .500 이 되도록 중심을 맞춘다.
   * 뎁스를 쓸 수 없는 시즌에는 .500 고정이며 전력 계산에서 아예 빠진다.
   */
  depthWinRate: number;
  /** 소속 선수 WAR 합 */
  totalWar: number;
  /**
   * 네이버가 계산한 그 시즌 기준 승률. 무승부를 승률에 넣느냐는 KBO 규정이
   * 시대마다 달랐고(2009년은 넣었다) 이 값은 그 규정을 따른다. 정규시즌 순위는
   * 이 값으로 매긴다. 전력 추정에 쓰는 actualWinRate 는 무승부를 뺀 승/(승+패) 다.
   */
  officialWinRate: number;
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
  /**
   * 이 시즌에 뎁스(WAR)를 얼마나 쓸 수 있었는지.
   *  - full: 타자·투수 WAR 둘 다 있다 (2017년 이후)
   *  - pitcher-only: 투수 WAR 만 있다 (2014~2016)
   *  - none: 둘 다 없다 (2013년 이전). 뎁스 항을 빼고 나머지 가중치를 재정규화한다
   */
  depthCoverage: 'full' | 'pitcher-only' | 'none';
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
