/**
 * 투구 추적 데이터. 네이버 중계(relay)의 `ptsOptions` 에서 뽑는다.
 * 추정값이 아니라 구장에서 측정한 값이다. 좌표계와 계산식은
 * `docs/DATA-SOURCES.md` 참고.
 */

/** 투구 결과. 중계 텍스트("3구 볼")를 분류한 것이다. */
export type PitchResult =
  | 'ball'
  | 'called-strike'
  | 'swinging-strike'
  | 'foul'
  | 'in-play';

export interface Pitch {
  /** 네이버가 준 투구 식별자 */
  id: string;
  inning: number;
  /** true 면 말(홈 팀 공격) */
  homeBatting: boolean;
  /** 이 타석에서 몇 번째 공인지 */
  pitchNumber: number;
  result: PitchResult;
  /** 중계 텍스트 원문 ("볼", "헛스윙" 등) */
  resultText: string;

  pitcherCode: string;
  pitcherName: string;
  batterCode: string;
  batterName: string;
  /** 타석 방향. L 이면 좌타 */
  stance: string;

  /** km/h. 릴리스 시점 속도 */
  speed: number;
  /** 홈플레이트 통과 지점. 좌우 (ft). 포수 시점에서 양수가 오른쪽 */
  plateX: number;
  /** 홈플레이트 통과 지점. 높이 (ft) */
  plateZ: number;
  /** 이 타자의 스트라이크존 아래끝 (ft) */
  zoneBottom: number;
  /** 이 타자의 스트라이크존 위끝 (ft) */
  zoneTop: number;
  /** 존을 통과했는지. 좌우는 플레이트 폭, 상하는 타자별 존으로 판정한다 */
  inZone: boolean;
}

export interface PitcherPitches {
  pitcherCode: string;
  pitcherName: string;
  /** 이 투수가 속한 팀 코드 */
  teamCode: string;
  pitches: Pitch[];
  /** km/h */
  maxSpeed: number;
  avgSpeed: number;
  /** 존 통과 비율 (0~1) */
  zoneRate: number;
  /** 헛스윙 / 전체 투구 */
  whiffRate: number;
}

export interface GamePitches {
  gameId: string;
  /** 추적 데이터가 있는 투구 수 */
  total: number;
  awayPitchers: PitcherPitches[];
  homePitchers: PitcherPitches[];
}
