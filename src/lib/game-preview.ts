import {
  GamePreview,
  HotColdCell,
  KeyPlayer,
  KeyPlayerStatLine,
  KeyPlayerVsLine,
  PreviewSide,
} from '@/types/preview';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://sports.naver.com/',
};

type Raw = Record<string, any>;

const num = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const str = (v: unknown): string => (v == null ? '' : String(v));

const statLine = (raw: Raw | undefined): KeyPlayerStatLine => ({
  games: num(raw?.gameCount),
  atBats: num(raw?.ab),
  hits: num(raw?.hit),
  homeRuns: num(raw?.hr),
  rbi: num(raw?.rbi),
  avg: num(raw?.hra),
  obp: num(raw?.obp),
});

const vsLine = (raw: Raw | undefined): KeyPlayerVsLine => ({
  hits: num(raw?.hit),
  homeRuns: num(raw?.hr),
  avg: num(raw?.hra),
});

function toKeyPlayer(raw: Raw | undefined): KeyPlayer | null {
  if (!raw?.playerInfo) return null;
  const info = raw.playerInfo as Raw;
  const code = str(info.pCode || raw.playerCode);

  const zones: HotColdCell[] = ((raw.hotColdZone as Raw[]) ?? [])
    .map((cell) => ({
      zone: num(cell.zone),
      avg: num(cell.hra),
      step: num(cell.hraStep),
      strikeoutRate: num(cell.kk),
    }))
    .sort((a, b) => a.zone - b.zone);

  return {
    code,
    name: str(info.name),
    backNumber: str(info.backnum),
    hitType: str(info.hitType),
    season: statLine(raw.currentSeasonStats),
    recentFive: statLine(raw.recentFiveGamesStats),
    vsOpponent: vsLine(raw.currentSeasonStatsOnOpponents),
    hotColdZone: zones,
  };
}

/**
 * 네이버 경기 프리뷰에서 양 팀 키플레이어(최근 흐름이 좋은 타자)와 시즌 상대전적을 뽑는다.
 * 예정 경기뿐 아니라 이미 끝난 경기에도 데이터가 있다.
 */
export async function fetchGamePreview(gameId: string): Promise<GamePreview | null> {
  const res = await fetch(`https://api-gw.sports.naver.com/schedule/games/${gameId}/preview`, {
    headers: HEADERS,
    next: { revalidate: 600 },
  });
  if (!res.ok) return null;

  const json = await res.json();
  const preview: Raw | undefined = json?.result?.previewData;
  if (!preview) return null;

  const info: Raw = preview.gameInfo ?? {};
  const vs: Raw | undefined = preview.seasonVsResult;

  const side = (team: 'a' | 'h', player: Raw | undefined): PreviewSide => ({
    teamCode: str(info[`${team}Code`]),
    teamName: str(info[`${team}FullName`]) || str(info[`${team}Name`]),
    player: toKeyPlayer(player),
  });

  return {
    gameId,
    away: side('a', preview.awayTopPlayer),
    home: side('h', preview.homeTopPlayer),
    seasonVs: vs ? { wins: num(vs.aw), losses: num(vs.al), draws: num(vs.ad) } : null,
    generatedAt: str(preview.generateDate),
  };
}
