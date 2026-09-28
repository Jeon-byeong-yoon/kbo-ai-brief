import { describe, it, expect } from 'vitest';
import { releaseSpeed, plateHeight, classify, PLATE_HALF_WIDTH } from './pitch-data';
import fixture from './__fixtures__/relay-inning1.json';

type Raw = Record<string, any>;
const pitches: Raw[] = fixture.blocks.flatMap((b: Raw) => b.ptsOptions as Raw[]);

/**
 * 네이버를 실제로 부르지 않는다. 저장해 둔 실제 응답으로 계산만 검증한다.
 * 저쪽 응답이 바뀌어도 우리 코드가 멀쩡하면 빨간불이 뜨지 않게 하려는 것이다.
 */
describe('투구 추적 — 저장해 둔 실제 응답', () => {
  it('고정 자료가 비어 있지 않다', () => {
    expect(pitches.length).toBe(25);
  });

  it('구속이 KBO 실제 범위 안에 들어온다', () => {
    const speeds = pitches.map(releaseSpeed);
    for (const v of speeds) {
      expect(v).toBeGreaterThan(100);
      expect(v).toBeLessThan(170);
    }
    expect(Math.max(...speeds)).toBeGreaterThan(140); // 한 이닝에 빠른 공이 하나는 있다
  });

  it('플레이트 통과 높이가 원바운드에서 높은 공 사이', () => {
    for (const p of pitches) {
      const z = plateHeight(p);
      expect(z).not.toBeNull();
      expect(z!).toBeGreaterThan(-0.5);
      expect(z!).toBeLessThan(6);
    }
  });

  it('존 통과율이 터무니없지 않다', () => {
    const inZone = pitches.filter((p) => {
      const z = plateHeight(p)!;
      return Math.abs(p.crossPlateX) <= PLATE_HALF_WIDTH && z >= p.bottomSz && z <= p.topSz;
    });
    const rate = inZone.length / pitches.length;
    expect(rate).toBeGreaterThan(0.2);
    expect(rate).toBeLessThan(0.85);
  });

  it('타자마다 존 상하한이 다르다 — 고정값이 아니다', () => {
    const tops = new Set(pitches.map((p) => p.topSz));
    expect(tops.size).toBeGreaterThan(1);
  });

  it('투구와 중계 텍스트가 ballcount 로 짝이 맞는다', () => {
    let joined = 0;
    let total = 0;
    for (const b of fixture.blocks as Raw[]) {
      const texts = new Map<number, string>();
      for (const o of b.textOptions ?? []) {
        if (o.type !== 1) continue;
        const m = /^(\d+)구\s+(.+)$/.exec(String(o.text ?? '').trim());
        if (m) texts.set(Number(m[1]), m[2]);
      }
      for (const p of b.ptsOptions as Raw[]) {
        total += 1;
        if (texts.has(p.ballcount)) joined += 1;
      }
    }
    expect(total).toBe(25);
    expect(joined).toBe(total); // 하나도 빠지지 않아야 한다
  });
});

describe('궤적 계산', () => {
  it('속도 벡터 크기를 km/h 로 바꾼다', () => {
    // 100 ft/s = 109.728 km/h
    expect(releaseSpeed({ vx0: 0, vy0: -100, vz0: 0 })).toBeCloseTo(109.728, 3);
  });

  it('가속도가 없으면 직선으로 날아간 높이가 나온다', () => {
    // y0=55 에서 crossPlateY=0.7083 까지, vy0=-100, 가속도 0 이면 t=0.542917s
    // z = 6 + 0 * t = 6
    const z = plateHeight({ y0: 55, vy0: -100, ay: 1e-9, z0: 6, vz0: 0, az: 0, crossPlateY: 0.7083 });
    expect(z).toBeCloseTo(6, 3);
  });

  it('데이터가 망가지면 null 을 준다', () => {
    expect(plateHeight({ y0: 55, vy0: 0, ay: 0, z0: 6, vz0: 0, az: 0, crossPlateY: 0.7083 })).toBeNull();
  });
});

describe('투구 결과 분류', () => {
  it('중계 어휘 일곱 가지를 모두 가른다', () => {
    expect(classify('볼')).toBe('ball');
    expect(classify('스트라이크')).toBe('called-strike');
    expect(classify('헛스윙')).toBe('swinging-strike');
    expect(classify('번트헛스윙')).toBe('swinging-strike');
    expect(classify('파울')).toBe('foul');
    expect(classify('번트파울')).toBe('foul');
    expect(classify('타격')).toBe('in-play');
  });

  it('모르는 말은 볼로 둔다', () => {
    expect(classify('')).toBe('ball');
  });
});
