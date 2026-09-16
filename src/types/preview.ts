/** 경기 프리뷰 — 양 팀 키플레이어 비교에 쓰는 타입. */

/**
 * 핫/콜드 존 한 칸.
 *
 * zone 1~9 는 스트라이크 존 3×3 을 왼쪽 위부터 읽는 순서, 10~13 은 존 바깥 네 구석이다.
 * (두 선수 모두 한가운데인 zone 5 의 타율이 가장 높게 나오는 것으로 확인했다.)
 */
export interface HotColdCell {
  zone: number;
  avg: number;
  /** 1(차가움) ~ 5(뜨거움). 네이버가 계산해 준 단계 값. */
  step: number;
  /** 해당 존에서의 삼진 비율(%) */
  strikeoutRate: number;
}

export interface KeyPlayerStatLine {
  games: number;
  atBats: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  avg: number;
  obp: number;
}

export interface KeyPlayerVsLine {
  hits: number;
  homeRuns: number;
  avg: number;
}

export interface KeyPlayer {
  code: string;
  name: string;
  backNumber: string;
  /** '우투좌타' 같은 표기 */
  hitType: string;
  imageUrl: string;
  season: KeyPlayerStatLine;
  recentFive: KeyPlayerStatLine;
  vsOpponent: KeyPlayerVsLine;
  hotColdZone: HotColdCell[];
}

export interface PreviewSide {
  teamCode: string;
  teamName: string;
  player: KeyPlayer | null;
}

export interface GamePreview {
  gameId: string;
  away: PreviewSide;
  home: PreviewSide;
  /** 당해 시즌 두 팀 상대전적. 원정팀 기준 승/패/무. */
  seasonVs: { wins: number; losses: number; draws: number } | null;
  /** 프리뷰 산출 기준일 'YYYYMMDD' */
  generatedAt: string;
}
