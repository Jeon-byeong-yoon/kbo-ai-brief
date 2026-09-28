import { describe, it, expect } from 'vitest';
import { MODEL, winProbability, depthRate, toStrength } from './prediction';

/** log5 + 홈 어드밴티지. 상수는 2008~2025 실제 경기에서 측정한 값이다. */
describe('경기 승리 확률', () => {
  it('같은 전력이면 홈이 측정된 홈 승률만큼 유리하다', () => {
    expect(winProbability(0.5, 0.5, true)).toBeCloseTo(MODEL.homeWinRate, 6);
    expect(winProbability(0.5, 0.5, false)).toBeCloseTo(1 - MODEL.homeWinRate, 6);
  });

  it('양쪽 확률을 더하면 1', () => {
    const a = winProbability(0.62, 0.41, false);
    const b = winProbability(0.41, 0.62, true);
    expect(a + b).toBeCloseTo(1, 6);
  });

  it('전력이 높을수록 이길 확률이 높다', () => {
    const weak = winProbability(0.45, 0.55, false);
    const strong = winProbability(0.65, 0.55, false);
    expect(strong).toBeGreaterThan(weak);
  });

  it('확률이 0 과 1 사이를 벗어나지 않는다', () => {
    for (const [a, b] of [[0.2, 0.8], [0.8, 0.2], [0.2, 0.2], [0.8, 0.8]]) {
      for (const home of [true, false]) {
        const p = winProbability(a, b, home);
        expect(p).toBeGreaterThan(0);
        expect(p).toBeLessThan(1);
      }
    }
  });
});

/** 리그 평균을 빼서 중심을 .500 에 맞춘다. 시즌마다 WAR 총량이 달라서다. */
describe('뎁스 환산', () => {
  it('리그 평균인 팀은 .500', () => {
    expect(depthRate(33.5, 33.5)).toBeCloseTo(0.5, 6);
  });

  it('WAR 이 144 만큼 높으면 승률이 1.000 만큼 높다', () => {
    expect(depthRate(33.5 + 144, 33.5)).toBeCloseTo(1.5, 6);
  });
});

const raw = (over: Record<string, unknown> = {}) => ({
  teamId: 'SS',
  teamName: '삼성',
  teamShortName: '삼성',
  winGameCount: 78,
  loseGameCount: 52,
  drawnGameCount: 3,
  offenseRun: 762,
  defenseR: 605,
  wra: 0.6,
  ...over,
});

/**
 * WAR 은 2017년부터만 있다. 그 전 시즌에 0 을 그대로 쓰면 전 팀 뎁스가 같아져
 * 가중치 30% 짜리 항이 팀을 구분하지 못한 채 전력 격차만 70% 로 눌러 버린다.
 */
describe('전력 추정', () => {
  it('뎁스를 못 쓰면 남은 가중치를 재정규화한다 — 상수를 섞지 않는다', () => {
    const none = toStrength(raw(), 0, 0, 'none');
    const { pythagorean, actual } = MODEL.weights;
    const blended =
      (none.pythagoreanWinRate * pythagorean + none.actualWinRate * actual) /
      (pythagorean + actual);
    expect(none.talent).toBeCloseTo(0.5 + (blended - 0.5) * (1 - MODEL.regression), 6);
    expect(none.depthWinRate).toBe(0.5);
  });

  it('뎁스를 못 쓰는 시즌에도 팀마다 전력이 달라야 한다', () => {
    const strong = toStrength(raw({ offenseRun: 800, defenseR: 550 }), 0, 0, 'none');
    const weak = toStrength(raw({ offenseRun: 550, defenseR: 800 }), 0, 0, 'none');
    expect(strong.talent).toBeGreaterThan(weak.talent + 0.05);
  });

  it('상수 .5 를 섞는 것보다 격차가 크다 — 그게 재정규화하는 이유다', () => {
    const { pythagorean, actual, depth } = MODEL.weights;
    const spread = (make: (r: ReturnType<typeof raw>) => number) =>
      make(raw({ offenseRun: 800, defenseR: 550 })) - make(raw({ offenseRun: 550, defenseR: 800 }));

    const renormalized = spread((r) => toStrength(r, 0, 0, 'none').talent);
    const withConstant = spread((r) => {
      const s = toStrength(r, 0, 0, 'none');
      const b = s.pythagoreanWinRate * pythagorean + s.actualWinRate * actual + 0.5 * depth;
      return 0.5 + (b - 0.5) * (1 - MODEL.regression);
    });
    expect(renormalized).toBeGreaterThan(withConstant);
  });

  it('피타고리안은 득실점에서 나온다', () => {
    const s = toStrength(raw({ offenseRun: 762, defenseR: 605 }), 0, 0, 'full');
    const e = MODEL.pythagoreanExponent;
    expect(s.pythagoreanWinRate).toBeCloseTo(762 ** e / (762 ** e + 605 ** e), 6);
  });

  it('실제 승률은 무승부를 뺀 승/(승+패)', () => {
    const s = toStrength(raw(), 20, 33.5, 'full');
    expect(s.actualWinRate).toBeCloseTo(78 / 130, 6);
  });

  it('정규시즌 순위용 승률은 네이버 wra 를 그대로 쓴다', () => {
    // 2009 KIA: 81승 48패 4무. 그해는 무승부를 승률에 넣어 .609 였다.
    const s = toStrength(
      raw({ winGameCount: 81, loseGameCount: 48, drawnGameCount: 4, wra: 0.609 }),
      0,
      0,
      'none',
    );
    expect(s.officialWinRate).toBeCloseTo(0.609, 6);
    expect(s.actualWinRate).toBeCloseTo(81 / 129, 6); // 직접 계산하면 .628 로 달라진다
  });

  it('전력은 .2~.8 을 벗어나지 않는다', () => {
    const absurd = toStrength(raw({ offenseRun: 2000, defenseR: 100, winGameCount: 144, loseGameCount: 0 }), 200, 0, 'full');
    expect(absurd.talent).toBeLessThanOrEqual(0.8);
  });
});
