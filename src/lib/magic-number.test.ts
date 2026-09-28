import { describe, it, expect } from 'vitest';
import { magicOver, calculateMagicNumbers } from './magic-number';
import { TeamRecord } from '@/types/magic-number';

const t = (code: string, wins: number, losses: number, draws = 0): TeamRecord => ({
  code,
  wins,
  losses,
  draws,
});

/** 2026-09-27 실제 순위. 손으로 검산한 값이 docs/MAGIC-NUMBER.md 에 있다. */
const STANDINGS_2026 = [
  t('KT', 80, 49, 4),
  t('삼성', 78, 52, 3),
  t('LG', 75, 57, 1),
  t('KIA', 72, 58, 2),
  t('두산', 67, 62, 5),
  t('NC', 62, 69, 2),
  t('롯데', 59, 71, 2),
  t('SSG', 58, 71, 5),
  t('한화', 54, 76, 4),
  t('키움', 46, 86, 4),
];

describe('한 팀 대 한 팀', () => {
  it('KT 가 삼성을 제치는 매직넘버는 9', () => {
    // 삼성 최대 89승/141 = .6312. a+b=9 의 최악(a=0,b=9)에서 KT .5714 > 삼성 .5674.
    // 8 이면 a=0,b=8 에서 KT .5714 < 삼성 .5745 로 뒤집힌다.
    expect(magicOver(t('KT', 80, 49, 4), t('삼성', 78, 52, 3))).toBe(9);
  });

  it('이미 제쳤으면 0', () => {
    // 상대가 남은 경기를 다 이겨도 못 따라오는 경우
    expect(magicOver(t('A', 100, 40, 0), t('B', 40, 100, 0))).toBe(0);
  });

  it('다 이겨도 못 넘으면 null', () => {
    expect(magicOver(t('B', 40, 100, 0), t('A', 100, 40, 0))).toBeNull();
  });

  it('동률은 확정으로 보지 않는다 — KBO 는 상대전적으로 가린다', () => {
    // 두 팀이 같은 성적이면 0 이 아니라 1 이상이 나와야 한다
    expect(magicOver(t('A', 70, 70, 0), t('B', 70, 70, 0))).not.toBe(0);
  });

  it('무승부 때문에 승수가 많아도 뒤질 수 있다 — 승률로 재야 한다', () => {
    // A 80승 64패 0무 = .556, B 79승 60패 5무 = .568
    // 시즌이 끝난 상태이므로 A 는 B 를 제치지 못한다
    expect(magicOver(t('A', 80, 64, 0), t('B', 79, 60, 5))).toBeNull();
    expect(magicOver(t('B', 79, 60, 5), t('A', 80, 64, 0))).toBe(0);
  });
});

describe('순위 전체', () => {
  const rows = calculateMagicNumbers(STANDINGS_2026);
  const by = (code: string) => rows.find((r) => r.teamCode === code)!;

  it('남은 경기는 144 - 치른 경기', () => {
    expect(by('KT').gamesLeft).toBe(144 - (80 + 49 + 4));
    expect(by('키움').gamesLeft).toBe(144 - (46 + 86 + 4));
  });

  it('KT·삼성·LG 는 포스트시즌 확정', () => {
    for (const code of ['KT', '삼성', 'LG']) expect(by(code).playoff).toBe(0);
  });

  it('한화·키움 은 포스트시즌 탈락', () => {
    for (const code of ['한화', '키움']) {
      expect(by(code).playoff).toBeNull();
      expect(by(code).playoffTragic).toBe(0);
    }
  });

  it('1위 매직넘버는 아홉 팀 중 가장 큰 값', () => {
    expect(by('KT').pennant).toBe(9);
  });

  it('두산 이하는 정규 1위가 불가능', () => {
    for (const code of ['두산', 'NC', '롯데', 'SSG', '한화', '키움']) {
      expect(by(code).pennant).toBeNull();
      expect(by(code).pennantTragic).toBe(0);
    }
  });

  it('순위가 낮을수록 포스트시즌 매직넘버가 크다', () => {
    const ordered = ['KIA', '두산', 'NC', '롯데'].map((c) => by(c).playoff!);
    for (let i = 1; i < ordered.length; i += 1) {
      expect(ordered[i]).toBeGreaterThanOrEqual(ordered[i - 1]);
    }
  });

  it('시즌 시작 전에는 아무도 확정도 탈락도 아니다', () => {
    const opening = STANDINGS_2026.map((x) => t(x.code, 0, 0, 0));
    for (const r of calculateMagicNumbers(opening)) {
      expect(r.gamesLeft).toBe(144);
      expect(r.playoff).not.toBe(0);
      expect(r.playoffTragic).not.toBe(0);
    }
  });
});
