import { NAVER_HEADERS, REVALIDATE } from '@/lib/naver';
import { GamePitches, Pitch, PitchResult, PitcherPitches } from '@/types/pitch';

type Raw = Record<string, any>;

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** ft/s -> km/h */
const FT_PER_S_TO_KMH = 0.3048 * 3.6;

/** 홈플레이트 폭 17인치의 절반 + 공 반지름. 존 좌우 경계 (ft) */
export const PLATE_HALF_WIDTH = 0.83;

/**
 * 릴리스 시점 구속. 속도 벡터의 크기다.
 * ptsOptions 의 vx0/vy0/vz0 은 y0(보통 55ft) 지점에서의 ft/s 다.
 */
function releaseSpeed(p: Raw): number {
  const v = Math.sqrt(num(p.vx0) ** 2 + num(p.vy0) ** 2 + num(p.vz0) ** 2);
  return v * FT_PER_S_TO_KMH;
}

/**
 * 홈플레이트 통과 높이.
 *
 * ptsOptions 는 좌우(crossPlateX)는 주지만 높이는 주지 않는다. crossPlateY 는
 * 높이가 아니라 "측정 기준이 되는 y 위치"다(항상 0.7083). 그래서 등가속도
 * 운동으로 궤적을 풀어 그 y 에 도달하는 시각 t 를 구하고 z(t) 를 계산한다.
 *
 *   y(t) = y0 + vy0 t + ay t^2 / 2  =  crossPlateY   ->  t
 *   z(t) = z0 + vz0 t + az t^2 / 2
 *
 * 투수는 타자 쪽(y 감소 방향)으로 던지므로 vy0 은 음수다. 두 근 중 먼저
 * 도달하는 쪽을 쓴다.
 */
function plateHeight(p: Raw): number | null {
  const y0 = num(p.y0);
  const vy0 = num(p.vy0);
  const ay = num(p.ay);
  const target = num(p.crossPlateY);

  if (ay === 0 || vy0 === 0) return null;

  const c = y0 - target;
  const disc = vy0 ** 2 - 2 * ay * c;
  if (disc < 0) return null;

  const t = (-vy0 - Math.sqrt(disc)) / ay;
  if (!Number.isFinite(t) || t <= 0) return null;

  return num(p.z0) + num(p.vz0) * t + 0.5 * num(p.az) * t ** 2;
}

/** 중계 텍스트("볼", "헛스윙")를 분류한다. 실제로 나오는 어휘는 7가지뿐이다. */
function classify(text: string): PitchResult {
  if (text.includes('헛스윙')) return 'swinging-strike';
  if (text.includes('파울')) return 'foul';
  if (text.includes('타격')) return 'in-play';
  if (text.includes('스트라이크')) return 'called-strike';
  return 'ball';
}

async function fetchRelay(gameId: string, inning: number | null, live: boolean) {
  const q = inning === null ? '' : `?inning=${inning}`;
  const res = await fetch(`https://api-gw.sports.naver.com/schedule/games/${gameId}/relay${q}`, {
    headers: NAVER_HEADERS,
    ...(live ? { cache: 'no-store' as const } : { next: { revalidate: REVALIDATE.archived } }),
  });
  if (!res.ok) throw new Error(`naver ${res.status}`);
  const json = await res.json();
  return (json?.result?.textRelayData ?? {}) as Raw;
}

/**
 * 투수 이름은 등장 순서로 맞춘다.
 *
 * 블록의 `currentGameState.pitcher` 는 pcode 를 주지만, `homeEntry`/`awayEntry`
 * 의 pcode 목록과 겹치지 않는다(엔트리는 교체 가능한 선수 명단이다).
 * `homeLineup`/`awayLineup` 에는 실제로 던진 투수가 이름과 함께 있지만 pcode 가
 * 없다. 그래서 등판 순서로 짝을 맞춘다. 투수는 한 번 내려가면 다시 오르지
 * 못하므로 순서는 유일하다.
 *
 * 두 경기(20260924 롯데-LG, NC-KT)에서 양 팀 모두 인원수가 정확히 맞았다.
 * 혹시 수가 어긋나면 이름을 비워 두고 등판 순서로만 표시한다.
 */
function nameByOrder(lineup: Raw[] | undefined, codesInOrder: string[]): Map<string, string> {
  const box = [...(lineup ?? [])].sort((a, b) => num(a.seqno) - num(b.seqno));
  const out = new Map<string, string>();
  if (box.length !== codesInOrder.length) return out;
  codesInOrder.forEach((code, i) => out.set(code, String(box[i]?.name ?? '')));
  return out;
}

/**
 * 한 이닝 블록에서 투구를 뽑는다.
 *
 * 블록 하나가 타석 하나다. `ptsOptions` 의 `ballcount` 가 그 타석의 몇 번째
 * 공인지이고, `textOptions` 중 type 1 인 항목의 "N구 ..." 텍스트와 같은 번호로
 * 짝이 맞는다. 실제 경기 두 개(604구)에서 전부 결합됐다.
 */
function parseBlock(block: Raw): Pitch[] {
  const pts = (block?.ptsOptions ?? []) as Raw[];
  if (pts.length === 0) return [];

  const texts = new Map<number, string>();
  for (const o of (block?.textOptions ?? []) as Raw[]) {
    if (num(o?.type) !== 1) continue;
    const m = /^(\d+)구\s+(.+)$/.exec(String(o?.text ?? '').trim());
    if (m) texts.set(Number(m[1]), m[2]);
  }

  const state = ((block?.textOptions ?? []) as Raw[])[0]?.currentGameState ?? {};
  const pitcherCode = String(state?.pitcher ?? '');
  const batterCode = String(state?.batter ?? '');
  const inning = num(block?.inn);
  const homeBatting = String(block?.homeOrAway) === '1';

  const out: Pitch[] = [];
  for (const p of pts) {
    const z = plateHeight(p);
    if (z === null) continue;

    const n = num(p.ballcount);
    const resultText = texts.get(n) ?? '';
    const x = num(p.crossPlateX);
    const zoneBottom = num(p.bottomSz);
    const zoneTop = num(p.topSz);

    out.push({
      id: String(p.pitchId ?? `${block?.no}-${n}`),
      inning,
      homeBatting,
      pitchNumber: n,
      result: classify(resultText),
      resultText,
      pitcherCode,
      pitcherName: '',
      batterCode,
      batterName: String(block?.title ?? '').replace(/^\d+번타자\s*/, ''),
      stance: String(p.stance ?? ''),
      speed: releaseSpeed(p),
      plateX: x,
      plateZ: z,
      zoneBottom,
      zoneTop,
      inZone: Math.abs(x) <= PLATE_HALF_WIDTH && z >= zoneBottom && z <= zoneTop,
    });
  }
  return out;
}

function groupByPitcher(
  pitches: Pitch[],
  teamCode: string,
  names: Map<string, string>,
  codesInOrder: string[],
): PitcherPitches[] {
  const by = new Map<string, Pitch[]>();
  for (const p of pitches) {
    const list = by.get(p.pitcherCode);
    if (list) list.push(p);
    else by.set(p.pitcherCode, [p]);
  }

  return codesInOrder
    .map((code, i) => {
      const list = (by.get(code) ?? []).map((p) => ({
        ...p,
        pitcherName: names.get(code) || `${i + 1}번째 투수`,
      }));
      if (list.length === 0) return null;
      const speeds = list.map((p) => p.speed);
      return {
        pitcherCode: code,
        pitcherName: list[0].pitcherName,
        teamCode,
        pitches: list,
        maxSpeed: Math.max(...speeds),
        avgSpeed: speeds.reduce((a, b) => a + b, 0) / speeds.length,
        zoneRate: list.filter((p) => p.inZone).length / list.length,
        whiffRate: list.filter((p) => p.result === 'swinging-strike').length / list.length,
      };
    })
    .filter((x): x is PitcherPitches => x !== null);
}

/**
 * 한 경기의 투구 추적 데이터를 전부 모은다.
 *
 * relay 는 기본 호출 시 최근 12블록만 준다. `?inning=N` 으로 이닝 단위로
 * 받아야 경기 전체가 모인다. 연장이면 `inn` 이 9보다 크므로 그만큼 돈다.
 */
export async function fetchGamePitches(
  gameId: string,
  homeCode: string,
  awayCode: string,
  live = false,
): Promise<GamePitches | null> {
  const head = await fetchRelay(gameId, null, live);
  const innings = num(head?.inn);
  if (innings <= 0) return null;

  const pages = await Promise.all(
    Array.from({ length: innings }, (_, i) => fetchRelay(gameId, i + 1, live).catch(() => null)),
  );

  // 홈이 공격 중이면 원정이 던진다. 팀 구분은 이 한 가지로 충분하다.
  const bySide: Record<'home' | 'away', Pitch[]> = { home: [], away: [] };
  const orderBySide: Record<'home' | 'away', string[]> = { home: [], away: [] };
  const seen = new Set<string>();

  for (const page of pages) {
    // 응답은 최신 블록이 앞에 온다. 등판 순서를 얻으려면 시간순으로 뒤집는다.
    const blocks = [...((page?.textRelays ?? []) as Raw[])].reverse();
    for (const block of blocks) {
      const parsed = parseBlock(block);
      if (parsed.length === 0) continue;
      const side: 'home' | 'away' = String(block?.homeOrAway) === '1' ? 'away' : 'home';
      const code = parsed[0].pitcherCode;
      if (code && !orderBySide[side].includes(code)) orderBySide[side].push(code);
      for (const pitch of parsed) {
        if (seen.has(pitch.id)) continue;
        seen.add(pitch.id);
        bySide[side].push(pitch);
      }
    }
  }

  const total = bySide.home.length + bySide.away.length;
  if (total === 0) return null;

  const homeNames = nameByOrder(head?.homeLineup?.pitcher, orderBySide.home);
  const awayNames = nameByOrder(head?.awayLineup?.pitcher, orderBySide.away);

  return {
    gameId,
    total,
    awayPitchers: groupByPitcher(bySide.away, awayCode, awayNames, orderBySide.away),
    homePitchers: groupByPitcher(bySide.home, homeCode, homeNames, orderBySide.home),
  };
}
