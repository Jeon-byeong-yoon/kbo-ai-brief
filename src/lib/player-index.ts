import { NAVER_HEADERS, REVALIDATE } from '@/lib/naver';
import { CAREER_FROM } from '@/types/player-career';
import { findTeam } from '@/lib/team-assets';

type Raw = Record<string, any>;

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** 커리어 검색 결과. 은퇴한 선수도 들어간다. */
export interface PlayerIndexEntry {
  playerId: string;
  name: string;
  /** 마지막으로 뛴 팀 */
  teamName: string;
  teamCode: string;
  playerType: 'BATTER' | 'PITCHER';
  firstYear: number;
  lastYear: number;
}

async function fetchSeason(year: number, type: 'HITTER' | 'PITCHER', isCurrent: boolean) {
  const url = `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/players?playerType=${type}&pageSize=500`;
  const res = await fetch(url, {
    headers: NAVER_HEADERS,
    next: { revalidate: isCurrent ? REVALIDATE.daily : REVALIDATE.archived },
  });
  if (!res.ok) return [] as Raw[];
  const json = await res.json();
  return (json?.result?.seasonPlayerStats ?? []) as Raw[];
}

/** 2007년 기록은 teamName 이 비어 있어 profile JSON 에서 꺼낸다. */
function teamOf(r: Raw): { name: string; code: string } {
  const direct = String(r.teamShortName || r.teamName || '');
  let profile: Raw = {};
  try {
    profile = JSON.parse(String(r.profile ?? '{}'));
  } catch {
    profile = {};
  }
  const asset = findTeam(direct, String(profile.teamCode ?? ''), String(profile.teamName ?? ''));
  const fallback = direct || String(profile.teamName ?? '');
  return { name: asset?.name ?? fallback, code: asset?.code ?? '' };
}

/**
 * 2007년부터 지금까지 뛴 모든 선수의 색인.
 *
 * 선수 비교는 은퇴 선수도 찾을 수 있어야 한다. 대시보드 검색처럼 이번 시즌 목록만
 * 보면 김광현(2025년까지) 같은 선수가 아예 안 나온다. 그래서 전 시즌을 훑어
 * `playerId` 로 묶고, 가장 최근 시즌의 이름·팀을 대표값으로 쓴다.
 *
 * 호출이 40회 남짓이지만 끝난 시즌은 일주일 캐시라 한 번만 무겁다.
 */
export async function fetchPlayerIndex(): Promise<PlayerIndexEntry[]> {
  const thisYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = CAREER_FROM; y <= thisYear; y += 1) years.push(y);

  const pages = await Promise.all(
    years.flatMap((y) =>
      (['HITTER', 'PITCHER'] as const).map((t) =>
        fetchSeason(y, t, y >= thisYear)
          .then((rows) => ({ type: t, rows }))
          .catch(() => ({ type: t, rows: [] as Raw[] })),
      ),
    ),
  );

  const byId = new Map<string, PlayerIndexEntry>();
  // 시즌별 출전 수로 주 포지션을 가른다. 투수가 타석에 서기도 하므로 많은 쪽을 쓴다.
  const seasons = new Map<string, { hitter: number; pitcher: number }>();

  for (const { type, rows } of pages) {
    for (const r of rows) {
      const id = String(r.playerId ?? '');
      if (!id) continue;
      const year = num(r.year);

      const count = seasons.get(id) ?? { hitter: 0, pitcher: 0 };
      if (type === 'HITTER') count.hitter += 1;
      else count.pitcher += 1;
      seasons.set(id, count);

      const prev = byId.get(id);
      if (!prev) {
        const team = teamOf(r);
        byId.set(id, {
          playerId: id,
          name: String(r.playerName ?? ''),
          teamName: team.name,
          teamCode: team.code,
          playerType: type === 'HITTER' ? 'BATTER' : 'PITCHER',
          firstYear: year,
          lastYear: year,
        });
        continue;
      }
      if (year < prev.firstYear) prev.firstYear = year;
      if (year >= prev.lastYear) {
        // 가장 최근 시즌의 이름과 팀을 대표값으로 둔다.
        const team = teamOf(r);
        prev.lastYear = year;
        prev.name = String(r.playerName ?? prev.name);
        if (team.name) {
          prev.teamName = team.name;
          prev.teamCode = team.code;
        }
      }
    }
  }

  for (const [id, entry] of byId) {
    const count = seasons.get(id);
    if (count) entry.playerType = count.pitcher > count.hitter ? 'PITCHER' : 'BATTER';
  }

  return [...byId.values()];
}

/** 이름으로 찾는다. 정확히 같은 이름을 먼저, 그다음 최근에 뛴 순으로. */
export function searchIndex(index: PlayerIndexEntry[], query: string, limit = 10) {
  const q = query.trim();
  if (!q) return [];
  return index
    .filter((p) => p.name.includes(q))
    .sort(
      (a, b) =>
        Number(b.name === q) - Number(a.name === q) ||
        b.lastYear - a.lastYear ||
        a.name.localeCompare(b.name, 'ko'),
    )
    .slice(0, limit);
}
