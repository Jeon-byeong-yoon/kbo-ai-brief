import { describe, it, expect } from 'vitest';
import {
  inningsToOuts,
  outsToInnings,
  eraPlus,
  opsPlus,
  battingTotal,
  pitchingTotal,
} from './player-career';
import { LeagueYear } from './league-context';
import { CareerBattingSeason, CareerPitchingSeason } from '@/types/player-career';

/**
 * 네이버는 이닝을 숫자로 줄 때도 있고 "138 2/3" 문자열로 줄 때도 있다.
 * Number() 를 그냥 쓰면 NaN 이 되어 통산 이닝이 조용히 0 으로 깎였다.
 */
describe('이닝 변환', () => {
  it('숫자로 올 때', () => {
    expect(inningsToOuts(155)).toBe(465);
    expect(inningsToOuts(0)).toBe(0);
  });

  it('문자열로 올 때', () => {
    expect(inningsToOuts('138 2/3')).toBe(416);
    expect(inningsToOuts('184 1/3')).toBe(553);
    expect(inningsToOuts('171')).toBe(513);
  });

  it('값이 없어도 죽지 않는다', () => {
    expect(inningsToOuts(null)).toBe(0);
    expect(inningsToOuts(undefined)).toBe(0);
    expect(inningsToOuts('')).toBe(0);
  });

  it('되돌리면 같은 표기가 된다', () => {
    for (const s of ['138 2/3', '184 1/3', '171', '2768']) {
      expect(outsToInnings(inningsToOuts(s))).toBe(s);
    }
  });
});

const league = (rows: Array<[number, number, number, number]>) =>
  new Map<number, LeagueYear>(
    rows.map(([year, era, obp, slg]) => [year, { year, era, obp, slg }]),
  );

/**
 * ERA+ 는 그 선수가 던진 각 시즌의 리그 평균으로 기대 자책점을 만들어 실제와 견준다.
 * 100 이 평균이고 높을수록 좋다.
 */
describe('ERA+', () => {
  const lg = league([
    [2009, 4.81, 0, 0],
    [2008, 4.13, 0, 0],
  ]);

  it('리그와 똑같이 던지면 100', () => {
    // 100이닝(300아웃) 동안 리그 평균(4.81)만큼 내주면 자책 53.44
    const rows = [{ year: 2009, outs: 300, earnedRuns: (4.81 * 100) / 9 }];
    expect(eraPlus(rows, lg)).toBeCloseTo(100, 6);
  });

  it('양현종 2009 — 리그 4.81 에 ERA 3.15 면 150 을 넘는다', () => {
    const rows = [{ year: 2009, outs: inningsToOuts('148 2/3'), earnedRuns: 52 }];
    const v = eraPlus(rows, lg)!;
    expect(v).toBeGreaterThan(145);
    expect(v).toBeLessThan(160);
  });

  it('양현종 2008 — 리그 4.13 에 ERA 5.83 이면 100 아래', () => {
    const rows = [{ year: 2008, outs: inningsToOuts('75 2/3'), earnedRuns: 49 }];
    expect(eraPlus(rows, lg)!).toBeLessThan(80);
  });

  it('리그 기준선이 없는 시즌은 null', () => {
    expect(eraPlus([{ year: 1995, outs: 300, earnedRuns: 30 }], lg)).toBeNull();
  });

  it('여러 시즌은 이닝으로 가중된다 — 한 시즌만 잘 던진 것과 구분된다', () => {
    const short = eraPlus([{ year: 2009, outs: 30, earnedRuns: 1 }], lg)!;
    const long = eraPlus(
      [
        { year: 2009, outs: 30, earnedRuns: 1 },
        { year: 2008, outs: 600, earnedRuns: 100 },
      ],
      lg,
    )!;
    expect(long).toBeLessThan(short);
  });
});

describe('OPS+', () => {
  const lg = league([[2026, 0, 0.35, 0.4]]);

  it('리그와 똑같으면 100', () => {
    expect(opsPlus(0.35, 0.4, [{ year: 2026, atBats: 400 }], lg)).toBeCloseTo(100, 6);
  });

  it('둘 다 리그보다 높으면 100 을 넘는다', () => {
    expect(opsPlus(0.456, 0.576, [{ year: 2026, atBats: 415 }], lg)!).toBeGreaterThan(100);
  });

  it('기준선이 없으면 null', () => {
    expect(opsPlus(0.4, 0.5, [{ year: 1995, atBats: 400 }], lg)).toBeNull();
  });
});

const batting = (over: Partial<CareerBattingSeason>): CareerBattingSeason => ({
  year: 2026,
  teamName: '',
  teamShortName: '',
  games: 0,
  atBats: 0,
  hits: 0,
  doubles: 0,
  triples: 0,
  homeRuns: 0,
  rbi: 0,
  runs: 0,
  steals: 0,
  walks: 0,
  strikeouts: 0,
  avg: 0,
  obp: 0,
  slg: 0,
  ops: 0,
  wrcPlus: null,
  war: null,
  opsPlus: null,
  ...over,
});

const pitching = (over: Partial<CareerPitchingSeason>): CareerPitchingSeason => ({
  year: 2026,
  teamName: '',
  teamShortName: '',
  games: 0,
  wins: 0,
  losses: 0,
  saves: 0,
  holds: 0,
  innings: '0',
  outs: 0,
  strikeouts: 0,
  walks: 0,
  earnedRuns: 0,
  era: 0,
  whip: 0,
  war: null,
  eraPlus: null,
  ...over,
});

/** 비율 지표를 그냥 더하면 안 된다. 누적값에서 다시 계산해야 한다. */
describe('통산 합계', () => {
  it('타율은 시즌 타율의 평균이 아니라 총안타/총타수', () => {
    const total = battingTotal([
      batting({ atBats: 100, hits: 40, avg: 0.4 }),
      batting({ atBats: 400, hits: 100, avg: 0.25 }),
    ])!;
    expect(total.atBats).toBe(500);
    expect(total.hits).toBe(140);
    expect(total.avg).toBeCloseTo(140 / 500, 6); // .280 — 단순 평균 .325 가 아니다
  });

  it('ERA 는 총자책 x 9 / 총이닝', () => {
    const total = pitchingTotal([
      pitching({ outs: 300, earnedRuns: 20, era: 1.8 }),
      pitching({ outs: 300, earnedRuns: 60, era: 5.4 }),
    ])!;
    expect(total.outs).toBe(600);
    expect(total.era).toBeCloseTo((80 * 9) / 200, 6); // 3.60
  });

  it('이닝 표기가 합쳐진다', () => {
    const total = pitchingTotal([
      pitching({ outs: inningsToOuts('138 2/3') }),
      pitching({ outs: inningsToOuts('184 1/3') }),
    ])!;
    expect(total.innings).toBe('323');
  });

  it('WAR 은 값이 있는 시즌만 더하고, 하나도 없으면 null', () => {
    expect(pitchingTotal([pitching({ war: null }), pitching({ war: null })])!.war).toBeNull();
    expect(pitchingTotal([pitching({ war: null }), pitching({ war: 5.2 })])!.war).toBeCloseTo(5.2);
  });

  it('기록이 없으면 null', () => {
    expect(battingTotal([])).toBeNull();
    expect(pitchingTotal([])).toBeNull();
  });
});
