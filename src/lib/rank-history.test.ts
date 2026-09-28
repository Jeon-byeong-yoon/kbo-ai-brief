import { describe, it, expect } from 'vitest';
import { detectRule, rate } from './rank-history';

const team = (w: number, l: number, d: number, wra: number) => ({
  winGameCount: w,
  loseGameCount: l,
  drawnGameCount: d,
  wra,
});

/**
 * 무승부를 승률에 넣을지는 KBO 규정이 시대마다 달랐다. 현행 규정을 가정하면
 * 2009년 1위가 뒤집힌다. 그래서 최종 성적과 네이버의 wra 를 대조해 알아낸다.
 */
describe('승률 규정 판별', () => {
  it('2026 — 무승부를 뺀다', () => {
    const teams = [
      team(80, 49, 4, 0.62), // 80/129
      team(78, 52, 3, 0.6), // 78/130
      team(46, 86, 4, 0.348), // 46/132
    ];
    expect(detectRule(teams)).toBe('exclude-draws');
  });

  it('2009 — 무승부를 넣는다', () => {
    const teams = [
      team(81, 48, 4, 0.609), // 81/133
      team(80, 47, 6, 0.602), // 80/133
      team(46, 84, 3, 0.346), // 46/133
    ];
    expect(detectRule(teams)).toBe('include-draws');
  });

  it('2009 는 규정에 따라 1위가 바뀐다 — 이게 판별이 필요한 이유', () => {
    const kia = team(81, 48, 4, 0.609);
    const sk = team(80, 47, 6, 0.602);

    const inc = (t: typeof kia) => rate('include-draws', t.winGameCount, t.loseGameCount, t.drawnGameCount);
    const exc = (t: typeof kia) => rate('exclude-draws', t.winGameCount, t.loseGameCount, t.drawnGameCount);

    expect(inc(kia)).toBeGreaterThan(inc(sk)); // 실제 1위는 KIA
    expect(exc(kia)).toBeLessThan(exc(sk)); // 현행 규정으로 재면 SK 가 앞선다
  });

  it('무승부가 하나도 없으면 두 규정이 같다 — 그때는 현행 규정으로 둔다', () => {
    const teams = [team(88, 56, 0, 0.611), team(52, 92, 0, 0.361)];
    expect(detectRule(teams)).toBe('exclude-draws');
  });

  it('둘 다 안 맞으면 현행 규정으로 떨어진다', () => {
    expect(detectRule([team(80, 49, 4, 0.999)])).toBe('exclude-draws');
  });
});

describe('승률 계산', () => {
  it('무승부를 빼면 분모가 승+패', () => {
    expect(rate('exclude-draws', 81, 48, 4)).toBeCloseTo(81 / 129, 6);
  });

  it('무승부를 넣으면 분모가 승+패+무', () => {
    expect(rate('include-draws', 81, 48, 4)).toBeCloseTo(81 / 133, 6);
  });

  it('한 경기도 안 했으면 0', () => {
    expect(rate('exclude-draws', 0, 0, 0)).toBe(0);
  });
});
