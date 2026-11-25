import { describe, expect, it } from 'vitest';
import { POSTSEASON_2026 } from './postseason-2026';

describe('2026 postseason bracket', () => {
  it('carries each winner into the following series', () => {
    expect(POSTSEASON_2026.map((series) => series.winner)).toEqual(['LG', 'KIA', 'SAMSUNG', 'SAMSUNG']);
    for (let index = 0; index < POSTSEASON_2026.length - 1; index += 1) {
      expect(POSTSEASON_2026[index + 1].teams.map(({ team }) => team)).toContain(POSTSEASON_2026[index].winner);
    }
  });

  it('records actual wins and game-by-game scores matching series totals', () => {
    expect(POSTSEASON_2026.map((series) => series.teams.map(({ wins }) => wins))).toEqual([
      [1, 0], [3, 0], [3, 2], [1, 4],
    ]);

    for (const series of POSTSEASON_2026) {
      const totalWins = series.teams[0].wins + series.teams[1].wins;
      expect(series.games).toHaveLength(totalWins);
      const winnerGameWins = series.games.filter((g) => {
        const gameWinner = g.awayScore > g.homeScore ? g.away : g.home;
        return gameWinner === series.winner;
      }).length;
      const expectedWinnerWins = series.teams.find((t) => t.team === series.winner)?.wins ?? 0;
      expect(winnerGameWins).toBe(expectedWinnerWins);
    }
  });
});
