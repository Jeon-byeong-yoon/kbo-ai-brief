import { describe, expect, it } from 'vitest';
import {
  POSTSEASON_2026,
  POSTSEASON_BY_YEAR,
  POSTSEASON_YEARS,
  getPostseasonYear,
} from './postseason-2026';

describe('Multi-year postseason bracket (2015~2026)', () => {
  it('covers 12 consecutive seasons since the wild-card format introduction (2015~2026)', () => {
    expect(POSTSEASON_YEARS).toHaveLength(12);
    expect(POSTSEASON_YEARS[0]).toBe(2026);
    expect(POSTSEASON_YEARS[POSTSEASON_YEARS.length - 1]).toBe(2015);

    for (const year of POSTSEASON_YEARS) {
      const data = getPostseasonYear(year);
      expect(data.year).toBe(year);
      expect(data.series).toHaveLength(4);

      // Each series winner advances to the next round
      for (let idx = 0; idx < data.series.length - 1; idx += 1) {
        const nextTeams = data.series[idx + 1].teams.map((t) => t.team);
        expect(nextTeams).toContain(data.series[idx].winner);
      }

      // Korean Series winner matches year champion
      const ks = data.series[3];
      expect(ks.winner).toBe(data.champion);
      expect(ks.teams.map((t) => t.team)).toContain(data.runnerUp);
    }
  });

  it('records actual game-by-game scores matching series win totals across all 12 years', () => {
    expect(POSTSEASON_2026.map((series) => series.teams.map(({ wins }) => wins))).toEqual([
      [1, 0],
      [3, 0],
      [3, 2],
      [1, 4],
    ]);

    for (const year of POSTSEASON_YEARS) {
      const data = POSTSEASON_BY_YEAR[year];
      for (const series of data.series) {
        const totalWins = series.teams[0].wins + series.teams[1].wins;
        expect(series.games).toHaveLength(totalWins);

        for (const teamEntry of series.teams) {
          const countedWins = series.games.filter((g) => {
            const gameWinner = g.awayScore > g.homeScore ? g.away : g.home;
            return gameWinner === teamEntry.team;
          }).length;
          expect(countedWins).toBe(teamEntry.wins);
        }
      }
    }
  });
});
