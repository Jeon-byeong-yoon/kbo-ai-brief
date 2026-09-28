import { describe, it, expect } from 'vitest';
import { formatDate, addDays, formatDateLabel } from './date';

/** 날짜를 UTC 로 다루면 한국 시간 기준으로 하루가 밀린다. 로컬 기준으로 만든다. */
describe('날짜', () => {
  it('YYYY-MM-DD 로 만든다', () => {
    expect(formatDate(new Date(2026, 8, 1))).toBe('2026-09-01');
    expect(formatDate(new Date(2026, 11, 25))).toBe('2026-12-25');
  });

  it('하루씩 더하고 뺀다', () => {
    expect(addDays('2026-09-27', 1)).toBe('2026-09-28');
    expect(addDays('2026-09-27', -1)).toBe('2026-09-26');
  });

  it('달과 해를 넘어간다', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('윤년을 안다', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
  });

  it('요일 표기', () => {
    expect(formatDateLabel('2026-09-27')).toBe('2026.09.27 (일)');
    expect(formatDateLabel('2026-09-28')).toBe('2026.09.28 (월)');
  });

  it('이상한 값은 그대로 돌려준다', () => {
    expect(formatDateLabel('없는날짜')).toBe('없는날짜');
  });
});
