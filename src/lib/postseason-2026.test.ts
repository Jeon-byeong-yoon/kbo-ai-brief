import { describe, expect, it } from 'vitest';
import { POSTSEASON_2026 } from './postseason-2026';

describe('2026 postseason bracket', () => {
  it('carries each winner into the following series', () => {
    expect(POSTSEASON_2026.map((series) => series.winner)).toEqual(['LG', 'KIA', 'SAMSUNG', 'SAMSUNG']);
    for (let index = 0; index < POSTSEASON_2026.length - 1; index += 1) {
      expect(POSTSEASON_2026[index + 1].teams.map(({ team }) => team)).toContain(POSTSEASON_2026[index].winner);
    }
  });

  it('records actual wins, excluding the wild-card seed advantage', () => {
    expect(POSTSEASON_2026.map((series) => series.teams.map(({ wins }) => wins))).toEqual([
      [1, 0], [3, 0], [3, 2], [1, 4],
    ]);
  });
});
