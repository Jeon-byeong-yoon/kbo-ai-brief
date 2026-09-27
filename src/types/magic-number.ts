/**
 * 매직넘버 / 트래직넘버.
 *
 * 매직넘버는 "내 승리 + 경쟁팀 패배" 가 몇 번 더 쌓이면 순위가 확정되는지다.
 * 계산 근거는 `docs/MAGIC-NUMBER.md` 참고.
 */

/** 정규시즌 경기 수 */
export const SEASON_GAMES = 144;
/** 포스트시즌에 나가는 팀 수 */
export const PLAYOFF_SPOTS = 5;

export interface TeamRecord {
  code: string;
  wins: number;
  losses: number;
  draws: number;
}

export interface MagicNumber {
  teamCode: string;
  /** 아직 치르지 않은 경기 (144 - 치른 경기) */
  gamesLeft: number;
  /** 정규시즌 1위 매직넘버. 0 이면 확정, null 이면 산술적으로 불가능 */
  pennant: number | null;
  /** 포스트시즌 진출 매직넘버. 0 이면 확정, null 이면 탈락 */
  playoff: number | null;
  /** 1위 경쟁에서 밀려나기까지 남은 수. 0 이면 1위 불가 */
  pennantTragic: number | null;
  /** 포스트시즌에서 탈락하기까지 남은 수. 0 이면 탈락 확정 */
  playoffTragic: number | null;
}
