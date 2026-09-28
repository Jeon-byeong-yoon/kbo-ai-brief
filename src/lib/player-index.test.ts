import { describe, it, expect } from 'vitest';
import { searchIndex, PlayerIndexEntry } from './player-index';

const p = (
  name: string,
  playerId: string,
  firstYear: number,
  lastYear: number,
): PlayerIndexEntry => ({
  playerId,
  name,
  teamName: '',
  teamCode: '',
  playerType: 'PITCHER',
  firstYear,
  lastYear,
});

const INDEX = [
  p('양현종', '77637', 2007, 2026),
  p('양현종', '55370', 2025, 2026),
  p('김광현', '77829', 2007, 2025),
  p('김광', '90001', 2015, 2018),
  p('곽빈', '68220', 2018, 2026),
];

/**
 * 대시보드 검색은 이번 시즌 목록만 봐서 김광현(2025년까지)이 안 나왔다.
 * 선수 비교는 은퇴 선수를 골라야 하므로 커리어 색인을 따로 만든다.
 */
describe('커리어 검색', () => {
  it('은퇴한 선수도 찾힌다', () => {
    expect(searchIndex(INDEX, '김광현').map((x) => x.playerId)).toEqual(['77829']);
  });

  it('부분 일치도 된다', () => {
    expect(searchIndex(INDEX, '김광').map((x) => x.playerId)).toEqual(['90001', '77829']);
  });

  it('이름이 정확히 같은 쪽이 먼저 온다', () => {
    expect(searchIndex(INDEX, '김광')[0].name).toBe('김광');
  });

  it('동명이인은 최근에 뛴 순으로 — 활동 기간으로 구분한다', () => {
    const found = searchIndex(INDEX, '양현종');
    expect(found).toHaveLength(2);
    expect(found[0].lastYear).toBeGreaterThanOrEqual(found[1].lastYear);
  });

  it('빈 검색어는 빈 결과', () => {
    expect(searchIndex(INDEX, '')).toEqual([]);
    expect(searchIndex(INDEX, '   ')).toEqual([]);
  });

  it('없는 이름은 빈 결과', () => {
    expect(searchIndex(INDEX, '선동열')).toEqual([]);
  });

  it('개수를 제한한다', () => {
    expect(searchIndex(INDEX, '김', 1)).toHaveLength(1);
  });
});
