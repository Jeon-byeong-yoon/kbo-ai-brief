import { describe, expect, it } from 'vitest';
import { FA_2027, FA_2028_CANDIDATES, predictDestination } from './fa-market';

describe('FA market snapshot', () => {
  it('matches the 22 KBO approved players and four confirmed contracts', () => {
    expect(FA_2027).toHaveLength(22);
    expect(new Set(FA_2027.map((player) => player.name)).size).toBe(22);
    const signed = FA_2027.filter((player) => player.contract);
    expect(signed.map((player) => player.name).sort()).toEqual(['문승원', '양의지', '오태곤', '최지훈']);
    expect(signed.every((player) => player.contract?.team === player.team)).toBe(true);
  });

  it('keeps unconfirmed outcomes separate from contracts and candidate lists', () => {
    expect(FA_2028_CANDIDATES).toHaveLength(34);
    expect(new Set(FA_2028_CANDIDATES.map((player) => player.name)).size).toBe(34);
    expect(FA_2027.filter((player) => !player.contract).every((player) => predictDestination(player)?.confidence === '낮음')).toBe(true);
    expect(FA_2027.filter((player) => player.contract).every((player) => predictDestination(player) === null)).toBe(true);
  });
});
