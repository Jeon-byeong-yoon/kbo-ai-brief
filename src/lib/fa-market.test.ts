import { describe, expect, it } from 'vitest';
import {
  FA_2027,
  FA_2028_CANDIDATES,
  TEAM_NEEDS_2026,
  positionWarRank,
  predictDestination,
  simulateFASignings,
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
    expect(positionWarRank('HANWHA', '포수')).toBe(1);
    expect(positionWarRank('LG', '포수')).toBe(10);
    expect(positionWarRank('SAMSUNG', '불펜')).toBe(1);
    expect(positionWarRank('KIWOOM', '불펜')).toBe(10);
  });

  it('simulates GM FA signings, positional WAR rank upgrades, and compensation rules accurately', () => {
    // LG retaining 박동원·홍창기 and signing external A-grade starter 원태인 (+2.71 WAR) and C-grade outfielder 김호령 (+2.98 WAR)
    const sim = simulateFASignings('LG', ['박동원', '홍창기', '원태인', '김호령']);
    expect(sim.retainedPlayers.map((p) => p.name).sort()).toEqual(['박동원', '홍창기']);
    expect(sim.lostOwnPlayers).toHaveLength(0);
    expect(sim.externalSignings.map((p) => p.name).sort()).toEqual(['김호령', '원태인']);
    expect(sim.addedExternalWar).toBeCloseTo(5.69, 2);
    expect(sim.netWarDelta).toBeCloseTo(5.69, 2);

    const starterImpact = sim.roleImpacts.find((r) => r.role === '선발')!;
    expect(starterImpact.beforeWar).toBeCloseTo(6.57, 2);
    expect(starterImpact.afterWar).toBeCloseTo(9.28, 2);
    expect(starterImpact.afterRank).toBeLessThan(starterImpact.beforeRank);

    expect(sim.compensationSummary.gradeACount).toBe(1);
    expect(sim.compensationSummary.gradeCCount).toBe(1);
    expect(sim.compensationSummary.protected20Count).toBe(1);
  });
});
