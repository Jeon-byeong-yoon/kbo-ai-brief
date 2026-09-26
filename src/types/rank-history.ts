/**
 * 일자별 순위. 네이버에 일자별 순위 API 가 없어서
 * (`/seasons/{year}/teams/ranks` 는 빈 응답) 일정을 날짜순으로 쌓아 직접 만든다.
 */

export interface RankHistoryTeam {
  teamCode: string;
  shortName: string;
  /** `dates` 와 같은 길이. 그 날 경기가 끝난 시점의 순위 */
  ranks: number[];
  /** 마지막 날 순위 */
  finalRank: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface RankHistory {
  year: number;
  /** 경기가 있었던 날짜만 담는다 */
  dates: string[];
  /**
   * 그 시즌에 쓰인 승률 규정.
   *  - `exclude-draws`: 승 / (승 + 패). 지금 규정
   *  - `include-draws`: 승 / (승 + 패 + 무). 2009년 등
   * 순위표의 `wra` 와 대조해 알아낸 값이다.
   */
  rule: 'exclude-draws' | 'include-draws';
  teams: RankHistoryTeam[];
}
