import { describe, expect, it } from 'vitest';
import {
  FA_2027,
  FA_2028_CANDIDATES,
  TEAM_NEEDS_2026,
  positionWarRank,
  predictDestination,
} from './fa-market';

describe('FA market snapshot & multi-factor destination model', () => {
  it('matches the 22 KBO approved players, four confirmed contracts, and 2026 stats', () => {
    expect(FA_2027).toHaveLength(22);
    expect(new Set(FA_2027.map((player) => player.name)).size).toBe(22);
    expect(FA_2027.every((player) => Boolean(player.stats?.playerId && player.stats?.summaryLine))).toBe(true);

    const signed = FA_2027.filter((player) => player.contract);
    expect(signed.map((player) => player.name).sort()).toEqual(['문승원', '양의지', '오태곤', '최지훈']);
    expect(signed.every((player) => player.contract?.team === player.team)).toBe(true);
  });

  it('keeps unconfirmed outcomes separate and produces normalized Top 3 destination probabilities', () => {
    expect(FA_2028_CANDIDATES).toHaveLength(34);
    expect(new Set(FA_2028_CANDIDATES.map((player) => player.name)).size).toBe(34);
    expect(FA_2028_CANDIDATES.every((player) => Boolean(player.stats?.playerId))).toBe(true);

    const pending = FA_2027.filter((player) => !player.contract);
    for (const player of pending) {
      const pred = predictDestination(player);
      expect(pred).not.toBeNull();
      expect(pred?.confidence).toBe('낮음');
      expect(pred?.topCandidates).toHaveLength(3);

      const probSum = pred!.topCandidates.reduce((acc, c) => acc + c.probability, 0);
      expect(probSum).toBe(100);
      expect(pred!.topCandidates[0].probability).toBeGreaterThanOrEqual(pred!.topCandidates[1].probability);
      expect(pred!.topCandidates[1].probability).toBeGreaterThanOrEqual(pred!.topCandidates[2].probability);
      expect(new Set(pred!.topCandidates.map((c) => c.team)).size).toBe(3);
    }

    expect(FA_2027.filter((player) => player.contract).every((player) => predictDestination(player) === null)).toBe(true);
  });

  it('ranks team positional WAR deficits accurately for demand scoring', () => {
    expect(Object.keys(TEAM_NEEDS_2026)).toHaveLength(10);
    // LG catcher WAR (0.60) is the lowest (10th) in 2026, HANWHA catcher WAR (4.25) is 1st
    expect(positionWarRank('HANWHA', '포수')).toBe(1);
    expect(positionWarRank('LG', '포수')).toBe(10);
    // KIWOOM bullpen WAR (-1.46) is 10th, SAMSUNG bullpen WAR (10.24) is 1st
    expect(positionWarRank('SAMSUNG', '불펜')).toBe(1);
    expect(positionWarRank('KIWOOM', '불펜')).toBe(10);
  });
});
