/**
 * 선수 커리어. 네이버에 선수 개인 상세 API 가 없어서(403), 연도별 선수 목록을
 * 전부 받아 `playerId` 로 묶어 만든다. 자세한 내용은 `docs/DATA-SOURCES.md` 참고.
 */

/** 고급 지표(WAR, wRC+, wOBA, WPA, BABIP)가 있는 첫 시즌. 그 전은 네이버가 주지 않는다. */
export const ADVANCED_FROM = 2017;

export interface CareerBattingSeason {
  year: number;
  teamName: string;
  teamShortName: string;
  games: number;
  atBats: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  runs: number;
  steals: number;
  walks: number;
  strikeouts: number;
  avg: number;
  obp: number;
  slg: number;
  ops: number;
  /** 2017년 이후만 있다. 없으면 null */
  wrcPlus: number | null;
  war: number | null;
}

export interface CareerPitchingSeason {
  year: number;
  teamName: string;
  teamShortName: string;
  games: number;
  wins: number;
  losses: number;
  saves: number;
  holds: number;
  /** "138 2/3" 처럼 표시용 문자열 */
  innings: string;
  /** 합산용. 이닝을 아웃 수로 바꾼 값 */
  outs: number;
  strikeouts: number;
  walks: number;
  earnedRuns: number;
  era: number;
  whip: number;
  /** 2017년 이후만 있다. 없으면 null */
  war: number | null;
}

export interface PlayerCareer {
  playerId: string;
  name: string;
  position: string;
  backNumber: string;
  /** 가장 최근 시즌의 소속 팀 */
  teamName: string;
  teamCode: string;
  height: number;
  weight: number;
  isRetired: boolean;
  batting: CareerBattingSeason[];
  pitching: CareerPitchingSeason[];
  /** 합계. 비율 지표는 다시 계산한 값이다 */
  battingTotal: CareerBattingSeason | null;
  pitchingTotal: CareerPitchingSeason | null;
  /** 고급 지표가 없는 시즌이 커리어에 포함돼 있는지 */
  hasPreAdvancedSeasons: boolean;
}
