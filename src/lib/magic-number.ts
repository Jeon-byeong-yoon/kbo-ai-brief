import { MagicNumber, PLAYOFF_SPOTS, SEASON_GAMES, TeamRecord } from '@/types/magic-number';

/**
 * 한 팀이 다른 한 팀보다 확실히 앞서는 데 필요한 매직넘버.
 *
 * KBO 는 승수가 아니라 **승률**로 순위를 매기고, 승률은 무승부를 뺀
 * 승 / (승 + 패) 다. 그래서 흔히 쓰는 "상대 최대 승수 - 내 승수 + 1" 공식은
 * 무승부 수가 다르면 어긋난다. 여기서는 가능한 결과를 직접 따져 구한다.
 *
 * 최악의 경우를 기준으로 한다.
 *  - 나: 남은 경기에서 a 승, 나머지는 전부 패. 무승부는 분모를 줄여 승률을
 *    올려 주므로 전패가 나에게 가장 불리하다
 *  - 상대: b 패, 나머지는 전부 승. 무승부는 상대 승률을 낮추므로 전승이 가장 불리하다
 *
 * `a + b` 가 M 이상이면 항상 내가 앞서는, 그런 가장 작은 M 을 찾는다.
 * a 나 b 가 늘면 결과는 나에게 유리해지기만 하므로 `a + b === M` 인 경우만 보면 된다.
 *
 * @returns 0 이면 이미 확정, null 이면 다 이겨도 앞설 수 없다
 */
export function magicOver(me: TeamRecord, rival: TeamRecord): number | null {
  const myLeft = SEASON_GAMES - (me.wins + me.losses + me.draws);
  const rivalLeft = SEASON_GAMES - (rival.wins + rival.losses + rival.draws);

  const myDecisions = me.wins + me.losses + myLeft;
  const rivalDecisions = rival.wins + rival.losses + rivalLeft;

  const myRate = (a: number) => (myDecisions > 0 ? (me.wins + a) / myDecisions : 0);
  const rivalRate = (b: number) =>
    rivalDecisions > 0 ? (rival.wins + rivalLeft - b) / rivalDecisions : 0;

  // 동률은 확정으로 보지 않는다. KBO 는 상대전적으로 가리므로 보장이 아니다.
  const clinches = (a: number, b: number) => myRate(a) > rivalRate(b);

  const allClinch = (sum: number) => {
    const lo = Math.max(0, sum - rivalLeft);
    const hi = Math.min(myLeft, sum);
    if (lo > hi) return false;
    for (let a = lo; a <= hi; a += 1) {
      if (!clinches(a, sum - a)) return false;
    }
    return true;
  };

  for (let m = 0; m <= myLeft + rivalLeft; m += 1) {
    if (allClinch(m)) return m;
  }
  return null;
}

/** 오름차순으로 정렬했을 때 n 번째 값. 유한한 값이 n 개보다 적으면 null */
function nthSmallest(values: Array<number | null>, n: number): number | null {
  const finite = values.filter((v): v is number => v !== null).sort((a, b) => a - b);
  return finite.length >= n ? finite[n - 1] : null;
}

/**
 * 10개 구단의 매직넘버를 한 번에 구한다.
 *
 * - **정규 1위** 는 아홉 팀 전부를 제쳐야 하므로 가장 큰 매직넘버를 쓴다
 * - **포스트시즌 진출** 은 다섯 자리 안에 들면 되므로, 확실히 이길 수 있는 팀이
 *   다섯 팀이면 된다. 아홉 팀에 대한 매직넘버 중 다섯 번째로 작은 값이다
 * - **트래직넘버** 는 방향을 뒤집은 것이다. 상대가 나를 제치는 데 필요한 수를
 *   같은 방식으로 구한다. 0 이 되면 탈락이다
 */
export function calculateMagicNumbers(teams: TeamRecord[]): MagicNumber[] {
  return teams.map((me) => {
    const rivals = teams.filter((t) => t.code !== me.code);
    const over = rivals.map((r) => magicOver(me, r));
    const under = rivals.map((r) => magicOver(r, me));

    // 한 팀이라도 제칠 수 없으면 1위는 불가능하다.
    const pennant = over.some((v) => v === null)
      ? null
      : Math.max(...(over as number[]));

    return {
      teamCode: me.code,
      gamesLeft: SEASON_GAMES - (me.wins + me.losses + me.draws),
      pennant,
      playoff: nthSmallest(over, PLAYOFF_SPOTS),
      // 상대 한 팀이라도 나를 확실히 제치면 1위에서 밀린다.
      pennantTragic: nthSmallest(under, 1),
      // 다섯 팀이 나를 확실히 제치면 포스트시즌에서 탈락한다.
      playoffTragic: nthSmallest(under, PLAYOFF_SPOTS),
    };
  });
}
