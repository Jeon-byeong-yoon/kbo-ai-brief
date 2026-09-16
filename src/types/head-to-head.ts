export interface HeadToHeadCell {
  wins: number;
  losses: number;
  draws: number;
}

export interface HeadToHeadRow {
  rank: number;
  teamCode: string;
  teamName: string;
  shortName: string;
  /** 상대 구단 코드 → 전적 */
  vs: Record<string, HeadToHeadCell>;
  total: HeadToHeadCell;
}

export interface HeadToHead {
  year: number;
  /** 열 순서 (행과 동일) */
  teamCodes: string[];
  rows: HeadToHeadRow[];
  /** 집계에 쓴 정규시즌 구간 */
  from: string;
  to: string;
  games: number;
}
