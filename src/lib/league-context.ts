import { NAVER_HEADERS, REVALIDATE } from '@/lib/naver';
import { inningsToOuts } from '@/lib/player-career';

type Raw = Record<string, any>;

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** 그 시즌 리그 전체의 기준선. 시대 보정에 쓴다. */
export interface LeagueYear {
  year: number;
  era: number;
  obp: number;
  slg: number;
}

async function fetchPlayers(year: number, type: 'HITTER' | 'PITCHER', isCurrent: boolean) {
  const url = `https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/players?playerType=${type}&pageSize=500`;
  const res = await fetch(url, {
    headers: NAVER_HEADERS,
    next: { revalidate: isCurrent ? REVALIDATE.daily : REVALIDATE.archived },
  });
  if (!res.ok) throw new Error(`naver ${res.status}`);
  const json = await res.json();
  return (json?.result?.seasonPlayerStats ?? []) as Raw[];
}

/**
 * 연도별 리그 평균.
 *
 * 팀 기록 API 는 2007년에 빈 응답이라 쓸 수 없다. 선수 목록을 합치면 같은 값이
 * 나오고 2007년도 된다. 네이버가 주는 선수 목록이 전체 로스터를 다 담지는 않지만
 * (시즌별 상위권 위주) 리그 기준선으로는 충분하다.
 *
 * 출루율은 희생플라이가 없어 (안타 + 볼넷 + 사구) / (타수 + 볼넷 + 사구) 로 잡는다.
 */
export async function fetchLeagueContext(
  fromYear: number,
  toYear: number,
): Promise<Map<number, LeagueYear>> {
  const thisYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = fromYear; y <= toYear; y += 1) years.push(y);

  const rows = await Promise.all(
    years.map(async (year) => {
      const isCurrent = year >= thisYear;
      const [pitchers, hitters] = await Promise.all([
        fetchPlayers(year, 'PITCHER', isCurrent).catch(() => [] as Raw[]),
        fetchPlayers(year, 'HITTER', isCurrent).catch(() => [] as Raw[]),
      ]);

      let er = 0;
      let outs = 0;
      for (const p of pitchers) {
        er += num(p.pitcherEr);
        outs += inningsToOuts(p.pitcherInning);
      }

      let ab = 0;
      let hits = 0;
      let bb = 0;
      let hbp = 0;
      let doubles = 0;
      let triples = 0;
      let hr = 0;
      for (const h of hitters) {
        ab += num(h.hitterAb);
        hits += num(h.hitterHit);
        bb += num(h.hitterBb);
        hbp += num(h.hitterHp);
        doubles += num(h.hitterH2);
        triples += num(h.hitterH3);
        hr += num(h.hitterHr);
      }
      const onBase = ab + bb + hbp;
      const singles = hits - doubles - triples - hr;

      return {
        year,
        era: outs > 0 ? (er * 9) / (outs / 3) : 0,
        obp: onBase > 0 ? (hits + bb + hbp) / onBase : 0,
        slg: ab > 0 ? (singles + doubles * 2 + triples * 3 + hr * 4) / ab : 0,
      };
    }),
  );

  return new Map(rows.filter((r) => r.era > 0 || r.obp > 0).map((r) => [r.year, r]));
}
