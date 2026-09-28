import { NAVER_HEADERS, REVALIDATE } from '@/lib/naver';
import { RankHistory, RankHistoryTeam } from '@/types/rank-history';
import { fetchRegularSeasonGames } from '@/lib/head-to-head';
import { findTeam } from '@/lib/team-assets';

type Raw = Record<string, any>;
type Rule = 'exclude-draws' | 'include-draws';

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function rate(rule: Rule, w: number, l: number, d: number): number {
  const denominator = rule === 'exclude-draws' ? w + l : w + l + d;
  return denominator > 0 ? w / denominator : 0;
}

/**
 * 그 시즌의 승률 규정을 알아낸다.
 *
 * 무승부를 승률에 넣을지는 KBO 규정이 시대마다 달랐다. 최종 성적으로 두 규정을
 * 모두 계산해서 네이버가 준 `wra` 와 맞는 쪽을 고른다. 추측하지 않고 대조한다.
 */
export function detectRule(teams: Raw[]): Rule {
  const fits = (rule: Rule) =>
    teams.every((t) => {
      const mine = rate(rule, num(t.winGameCount), num(t.loseGameCount), num(t.drawnGameCount));
      return Math.abs(mine - num(t.wra)) < 0.0015;
    });

  if (fits('exclude-draws')) return 'exclude-draws';
  if (fits('include-draws')) return 'include-draws';
  // 둘 다 안 맞으면 현행 규정을 쓴다. 그래프의 마지막 날 순위로 검산된다.
  return 'exclude-draws';
}

export async function fetchRankHistory(year: number): Promise<RankHistory | null> {
  const isCurrent = year >= new Date().getFullYear();
  const revalidate = isCurrent ? REVALIDATE.daily : REVALIDATE.archived;

  const [standingsJson, games] = await Promise.all([
    fetch(`https://api-gw.sports.naver.com/statistics/categories/kbo/seasons/${year}/teams`, {
      headers: NAVER_HEADERS,
      next: { revalidate },
    }).then((r) => (r.ok ? r.json() : null)),
    fetchRegularSeasonGames(year),
  ]);

  const teams: Raw[] = standingsJson?.result?.seasonTeamStats ?? [];
  if (teams.length === 0 || !games || games.length === 0) return null;

  const rule = detectRule(teams);
  const codes = teams.map((t) => String(t.teamId));
  const shortNames = new Map(codes.map((c, i) => [c, String(teams[i].teamShortName || teams[i].teamName)]));

  const record = new Map(codes.map((c) => [c, { w: 0, l: 0, d: 0 }]));
  const ranksByTeam = new Map<string, number[]>(codes.map((c) => [c, []]));
  const dates: string[] = [];

  // 경기는 이미 날짜순이다. 하루치를 모두 반영한 뒤 그날의 순위를 기록한다.
  let index = 0;
  while (index < games.length) {
    const day = games[index].gameDate;
    while (index < games.length && games[index].gameDate === day) {
      const g = games[index];
      const home = record.get(g.homeTeamCode);
      const away = record.get(g.awayTeamCode);
      if (home && away) {
        const hs = num(g.homeTeamScore);
        const as = num(g.awayTeamScore);
        if (hs > as) {
          home.w += 1;
          away.l += 1;
        } else if (as > hs) {
          away.w += 1;
          home.l += 1;
        } else {
          home.d += 1;
          away.d += 1;
        }
      }
      index += 1;
    }

    // 승률 순. 동률은 KBO 가 상대전적으로 가리지만 그래프에서는 선을 겹칠 수 없으므로
    // 승수, 패수, 팀 코드 순으로 정해진 대로 가른다.
    const ordered = [...codes].sort((a, b) => {
      const x = record.get(a)!;
      const y = record.get(b)!;
      return (
        rate(rule, y.w, y.l, y.d) - rate(rule, x.w, x.l, x.d) ||
        y.w - x.w ||
        x.l - y.l ||
        a.localeCompare(b)
      );
    });

    dates.push(day);
    ordered.forEach((code, i) => ranksByTeam.get(code)!.push(i + 1));
  }

  const rows: RankHistoryTeam[] = codes.map((code) => {
    const ranks = ranksByTeam.get(code)!;
    const r = record.get(code)!;
    const asset = findTeam(code);
    return {
      teamCode: asset?.code ?? code,
      shortName: asset?.shortName ?? shortNames.get(code) ?? code,
      ranks,
      finalRank: ranks[ranks.length - 1] ?? 0,
      wins: r.w,
      losses: r.l,
      draws: r.d,
    };
  });

  return {
    year,
    dates,
    rule,
    teams: rows.sort((a, b) => a.finalRank - b.finalRank),
  };
}
