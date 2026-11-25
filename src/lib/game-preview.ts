import { NAVER_HEADERS, REVALIDATE } from '@/lib/naver';
import {
  GamePreview,
  HotColdCell,
  KeyPlayer,
  KeyPlayerStatLine,
  KeyPlayerVsLine,
  PitchKind,
  PreviewSide,
  StarterLine,
  TeamForm,
} from '@/types/preview';

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
/**
 * 구종 코드를 한글로. 네이버가 코드만 주고 이름은 주지 않는다.
 * 모르는 코드는 코드 그대로 둔다. 지어내지 않는다.
 */
const PITCH_LABEL: Record<string, string> = {
  FAST: '직구',
  TWOS: '투심',
  CUTT: '커터',
  SLID: '슬라이더',
  CURV: '커브',
  CHUP: '체인지업',
  FORK: '포크',
  SINK: '싱커',
  KNUC: '너클볼',
  SPLI: '스플리터',
};

function toStarter(raw: Raw | undefined): StarterLine | null {
  const info: Raw = raw?.playerInfo ?? {};
  const season: Raw = raw?.currentSeasonStats ?? {};
  if (!info.name) return null;

  const vs: Raw | undefined = raw?.currentSeasonStatsOnOpponents;
  const kinds: PitchKind[] = ((raw?.currentPitKindStats ?? []) as Raw[])
    .map((k) => ({
      type: str(k.type),
      label: PITCH_LABEL[str(k.type)] ?? str(k.type),
      rate: num(k.pit_rt),
      speed: num(k.speed),
    }))
    .filter((k) => k.rate > 0)
    .sort((a, b) => b.rate - a.rate);

  return {
    name: str(info.name),
    backNumber: str(info.backnum),
    hitType: str(info.hitType),
    games: num(season.gameCount),
    wins: num(season.w),
    losses: num(season.l),
    saves: num(season.s),
    innings: str(season.inn),
    era: str(season.era),
    whip: str(season.whip),
    strikeouts: num(season.kk),
    walks: num(season.bb),
    // 맞붙은 적이 없으면 경기 수가 0 이다. 그때는 칸을 비운다.
    vsOpponent:
      vs && num(vs.gameCount) > 0
        ? { games: num(vs.gameCount), innings: str(vs.inn), era: str(vs.era) }
        : null,
    pitchKinds: kinds,
  };
}

function toForm(standings: Raw | undefined, previous: Raw[] | undefined, code: string): TeamForm | null {
  if (!standings) return null;
  return {
    rank: num(standings.rank),
    wins: num(standings.w),
    losses: num(standings.l),
    draws: num(standings.d),
    winRate: str(standings.wra),
    battingAvg: str(standings.hra),
    era: str(standings.era),
    homeRuns: num(standings.hr),
    recent: (previous ?? []).map((g) => {
      const home = str(g.hCode) === code;
      const mine = home ? num(g.hScore) : num(g.aScore);
      const theirs = home ? num(g.aScore) : num(g.hScore);
      return {
        result: str(g.result),
        opponent: home ? str(g.aName) : str(g.hName),
        score: `${mine}:${theirs}`,
        date: str(g.gdate),
      };
    }),
  };
}

export async function fetchGamePreview(gameId: string): Promise<GamePreview | null> {
  const res = await fetch(`https://api-gw.sports.naver.com/schedule/games/${gameId}/preview`, {
    headers: NAVER_HEADERS,
    next: { revalidate: REVALIDATE.preview },
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
    awayStarter: toStarter(preview.awayStarter),
    homeStarter: toStarter(preview.homeStarter),
    awayForm: toForm(preview.awayStandings, preview.awayTeamPreviousGames, str(info.aCode)),
    homeForm: toForm(preview.homeStandings, preview.homeTeamPreviousGames, str(info.hCode)),
    stadium: str(info.stadium),
    generatedAt: str(preview.generateDate),
  };
}
