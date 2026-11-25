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

/** 선발 투수가 실제로 던지는 구종. 네이버가 비율과 평균 구속을 준다. */
export interface PitchKind {
  /** FAST, SLID, CHUP 같은 코드 */
  type: string;
  /** 한글 이름 */
  label: string;
  /** 구사 비율 (%) */
  rate: number;
  /** 평균 구속 (km/h) */
  speed: number;
}

export interface StarterLine {
  name: string;
  backNumber: string;
  /** '우투우타' 같은 표기 */
  hitType: string;
  games: number;
  wins: number;
  losses: number;
  saves: number;
  /** "47.1" 같은 표기 */
  innings: string;
  era: string;
  whip: string;
  strikeouts: number;
  walks: number;
  /** 이 상대 팀에게 올 시즌 어땠는지. 맞붙은 적이 없으면 null */
  vsOpponent: { games: number; innings: string; era: string } | null;
  /** 구사 비율이 높은 순 */
  pitchKinds: PitchKind[];
}

export interface TeamForm {
  /** 그 시점 순위 */
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: string;
  /** 팀 타율 */
  battingAvg: string;
  /** 팀 평균자책 */
  era: string;
  homeRuns: number;
  /** 최근 경기, 최신순. '승'·'패'·'무' */
  recent: Array<{ result: string; opponent: string; score: string; date: string }>;
}

export interface GamePreview {
  gameId: string;
  away: PreviewSide;
  home: PreviewSide;
  /** 당해 시즌 두 팀 상대전적. 원정팀 기준 승/패/무. */
  seasonVs: { wins: number; losses: number; draws: number } | null;
  /** 선발 투수. 아직 예고되지 않았으면 null */
  awayStarter: StarterLine | null;
  homeStarter: StarterLine | null;
  /** 팀 순위와 최근 흐름 */
  awayForm: TeamForm | null;
  homeForm: TeamForm | null;
  /** 경기장. 없으면 빈 문자열 */
  stadium: string;
  /** 프리뷰 산출 기준일 'YYYYMMDD' */
  generatedAt: string;
}
