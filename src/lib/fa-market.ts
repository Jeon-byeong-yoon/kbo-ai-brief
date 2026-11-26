import { TEAM_ASSETS, TEAM_CODES, type TeamCode } from './team-assets';

export const FA_AS_OF = '2026-11-25';
export const FA_SOURCES = {
  approved: 'https://koreabaseball.com/MediaNews/Notice/View.aspx?bdSe=12243',
  eligible: 'https://www.koreabaseball.com/MediaNews/Notice/View.aspx?bdSe=12242',
  doosan: 'https://www.koreabaseball.com/MediaNews/News/KboPhoto/View.aspx?bdSe=559551',
  ssg: 'https://www.ssglanders.com/media/news',
  next: 'https://mlbpark.donga.com/mp/b.php?b=kbotown&id=202611200120236316&p=1&pos=reply&query=&reply&select=&shop=&sig=h4aXGg-gh3DRKfX2hdaXGY-Akhlq&site=donga.com&source=&subquery=&subselect=&user=',
} as const;

export type FAGrade = 'A' | 'B' | 'C';
export type FAPositionRole = '포수' | '내야수' | '외야수' | '선발' | '불펜';

export type FAContract = {
  team: TeamCode;
  years: string;
  maxEok: number;
  announced: string;
  source: string;
};

export type FAPlayerSeasonStats = {
  playerId: string;
  seasonYear: number;
  role: FAPositionRole;
  games: number;
  war: number;
  /** 화면에 한 줄로 표시할 실제 시즌 기록 요약 */
  summaryLine: string;
  /** 핵심 지표 1 (타율 또는 ERA) */
  primaryMetricLabel: '타율' | 'ERA';
  primaryMetricValue: string;
  /** 핵심 지표 2 (OPS 또는 WHIP) */
  secondaryMetricLabel: 'OPS' | 'WHIP';
  secondaryMetricValue: string;
};

export type FAPlayer = {
  name: string;
  team: TeamCode;
  grade: FAGrade;
  contract?: FAContract;
  stats: FAPlayerSeasonStats;
};

export type FANextCandidate = {
  name: string;
  team: TeamCode;
  stats: FAPlayerSeasonStats;
};

export type TeamNeedsProfile = {
  rank: number;
  winRate: number;
  ops: number;
  era: number;
  positionWar: Record<FAPositionRole, number>;
};

export type FADestinationCandidate = {
  team: TeamCode;
  isRetention: boolean;
  probability: number;
  roleWar: number;
  roleWarRank: number;
  rationale: string;
};

export type FADestinationPrediction = {
  team: TeamCode;
  label: string;
  confidence: '보통' | '낮음';
  topCandidates: readonly [FADestinationCandidate, FADestinationCandidate, FADestinationCandidate];
  compensationRule: string;
  reasons: string[];
};

export type FASimulationRoleImpact = {
  role: FAPositionRole;
  beforeWar: number;
  afterWar: number;
  deltaWar: number;
  beforeRank: number;
  afterRank: number;
};

export type FASimulationResult = {
  team: TeamCode;
  retainedPlayers: FAPlayer[];
  externalSignings: FAPlayer[];
  lostOwnPlayers: FAPlayer[];
  externalCountLimitExceeded: boolean;
  addedExternalWar: number;
  lostOwnWar: number;
  netWarDelta: number;
  baseWins: number;
  projectedWins: number;
  roleImpacts: FASimulationRoleImpact[];
  compensationSummary: {
    gradeACount: number;
    gradeBCount: number;
    gradeCCount: number;
    protected20Count: number;
    protected25Count: number;
    items: Array<{ player: FAPlayer; rule: string }>;
  };
};

/**
 * 네이버 KBO 2026 시즌 10개 구단 정규시즌 성적 및 포지션별 로스터 WAR 합계.
 * (타자 359명·투수 293명 전원 집계, 80이닝 이상 투수는 선발, 미만은 불펜으로 분류)
 */
export const TEAM_NEEDS_2026: Record<TeamCode, TeamNeedsProfile> = {
  KT: {
    rank: 1,
    winRate: 0.62,
    ops: 0.766,
    era: 4.28,
    positionWar: { 포수: 0.85, 내야수: 10.35, 외야수: 13.86, 선발: 10.6, 불펜: 8.87 },
  },
  SAMSUNG: {
    rank: 2,
    winRate: 0.6,
    ops: 0.783,
    era: 4.22,
    positionWar: { 포수: 1.56, 내야수: 10.86, 외야수: 13.12, 선발: 9.54, 불펜: 10.24 },
  },
  LG: {
    rank: 3,
    winRate: 0.568,
    ops: 0.758,
    era: 4.83,
    positionWar: { 포수: 0.6, 내야수: 15.03, 외야수: 7.42, 선발: 6.57, 불펜: 6.94 },
  },
  KIA: {
    rank: 4,
    winRate: 0.554,
    ops: 0.784,
    era: 4.26,
    positionWar: { 포수: 3.2, 내야수: 8.16, 외야수: 13.7, 선발: 10.45, 불펜: 5.51 },
  },
  DOOSAN: {
    rank: 5,
    winRate: 0.519,
    ops: 0.728,
    era: 3.77,
    positionWar: { 포수: 2.91, 내야수: 7.75, 외야수: 6.3, 선발: 15.22, 불펜: 5.32 },
  },
  NC: {
    rank: 6,
    winRate: 0.473,
    ops: 0.75,
    era: 4.67,
    positionWar: { 포수: 2.23, 내야수: 11.48, 외야수: 5.49, 선발: 7.59, 불펜: 0.37 },
  },
  LOTTE: {
    rank: 7,
    winRate: 0.454,
    ops: 0.735,
    era: 4.79,
    positionWar: { 포수: 1.22, 내야수: 9.26, 외야수: 6.35, 선발: 10.03, 불펜: 3.15 },
  },
  SSG: {
    rank: 8,
    winRate: 0.45,
    ops: 0.735,
    era: 5.2,
    positionWar: { 포수: 0.91, 내야수: 12.38, 외야수: 4.8, 선발: -0.72, 불펜: 7.83 },
  },
  HANWHA: {
    rank: 9,
    winRate: 0.415,
    ops: 0.78,
    era: 5.26,
    positionWar: { 포수: 4.25, 내야수: 12.88, 외야수: 9.56, 선발: 7.05, 불펜: -0.55 },
  },
  KIWOOM: {
    rank: 10,
    winRate: 0.348,
    ops: 0.679,
    era: 5.29,
    positionWar: { 포수: 1.23, 내야수: 5.59, 외야수: 2.8, 선발: 7.95, 불펜: -1.46 },
  },
};

export const GRADE_COMPENSATION_RULES: Record<FAGrade, string> = {
  A: 'A등급 · 타 구단 영입 시 보호선수 20인 외 1명 + 전년도 연봉 200%(또는 연봉 300%) 보상',
  B: 'B등급 · 타 구단 영입 시 보호선수 25인 외 1명 + 전년도 연봉 100%(또는 연봉 200%) 보상',
  C: 'C등급 · 보상선수 없이 전년도 연봉 150% 금전 보상만 적용 (이적 장벽 가장 낮음)',
};

const PLAYER_STATS_2026: Record<string, FAPlayerSeasonStats> = {
  // 2027 FA 승인 선수 22명 (2026 시즌 네이버 공식 기록)
  원태인: {
    playerId: '69446',
    seasonYear: 2026,
    role: '선발',
    games: 24,
    war: 2.71,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '4.66',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.39',
    summaryLine: '24경기 135 1/3이닝 · 7승 8패 · ERA 4.66 · WHIP 1.39 · WAR 2.71',
  },
  전병우: {
    playerId: '65586',
    seasonYear: 2026,
    role: '내야수',
    games: 111,
    war: 1.22,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.238',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.760',
    summaryLine: '111경기 타율 .238 · 11홈런 52타점 · OPS 0.760 · WAR 1.22',
  },
  구자욱: {
    playerId: '62404',
    seasonYear: 2026,
    role: '외야수',
    games: 112,
    war: 5.83,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.369',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '1.032',
    summaryLine: '112경기 타율 .369(1위) · 15홈런 102타점 · OPS 1.032 · WAR 5.83',
  },
  김민수: {
    playerId: '65048',
    seasonYear: 2026,
    role: '불펜',
    games: 39,
    war: 0.05,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '5.70',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.55',
    summaryLine: '39경기 42 2/3이닝 · 2승 3패 1세이브 3홀드 · ERA 5.70 · WHIP 1.55 · WAR 0.05',
  },
  한승혁: {
    playerId: '61666',
    seasonYear: 2026,
    role: '불펜',
    games: 35,
    war: -0.17,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '6.68',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.89',
    summaryLine: '35경기 32 1/3이닝 · 3승 2패 10홀드 · ERA 6.68 · WHIP 1.89 · WAR -0.17',
  },
  김상수: {
    playerId: '79402',
    seasonYear: 2026,
    role: '내야수',
    games: 123,
    war: 1.58,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.278',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.697',
    summaryLine: '123경기 타율 .278 · 1홈런 38타점 · OPS 0.697 · WAR 1.58',
  },
  오윤석: {
    playerId: '64504',
    seasonYear: 2026,
    role: '내야수',
    games: 103,
    war: 0.34,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.287',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.712',
    summaryLine: '103경기 타율 .287 · 1홈런 26타점 · OPS 0.712 · WAR 0.34',
  },
  김민혁: {
    playerId: '64004',
    seasonYear: 2026,
    role: '외야수',
    games: 107,
    war: 0.51,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.296',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.700',
    summaryLine: '107경기 타율 .296 · 1홈런 40타점 · OPS 0.700 · WAR 0.51',
  },
  배정대: {
    playerId: '64166',
    seasonYear: 2026,
    role: '외야수',
    games: 91,
    war: -0.34,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.194',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.534',
    summaryLine: '91경기 타율 .194 · 0홈런 11타점 · OPS 0.534 · WAR -0.34',
  },
  김태군: {
    playerId: '78122',
    seasonYear: 2026,
    role: '포수',
    games: 78,
    war: 1.04,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.273',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.753',
    summaryLine: '78경기 타율 .273 · 5홈런 23타점 · OPS 0.753 · WAR 1.04',
  },
  김호령: {
    playerId: '65653',
    seasonYear: 2026,
    role: '외야수',
    games: 130,
    war: 2.98,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.273',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.732',
    summaryLine: '130경기 타율 .273 · 13홈런 63타점 · OPS 0.732 · WAR 2.98',
  },
  박동원: {
    playerId: '79365',
    seasonYear: 2026,
    role: '포수',
    games: 119,
    war: 0.93,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.223',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.712',
    summaryLine: '119경기 타율 .223 · 12홈런 53타점 · OPS 0.712 · WAR 0.93',
  },
  홍창기: {
    playerId: '66108',
    seasonYear: 2026,
    role: '외야수',
    games: 120,
    war: 1.49,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.248',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.679',
    summaryLine: '120경기 타율 .248 · 출루율 .383 · 33타점 · OPS 0.679 · WAR 1.49',
  },
  박치국: {
    playerId: '67266',
    seasonYear: 2026,
    role: '불펜',
    games: 53,
    war: 0.17,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '4.89',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.63',
    summaryLine: '53경기 46이닝 · 0승 1패 8홀드 · ERA 4.89 · WHIP 1.63 · WAR 0.17',
  },
  양의지: {
    playerId: '76232',
    seasonYear: 2026,
    role: '포수',
    games: 127,
    war: 3.33,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.253',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.791',
    summaryLine: '127경기 타율 .253 · 20홈런 73타점 · OPS 0.791 · WAR 3.33',
  },
  정수빈: {
    playerId: '79231',
    seasonYear: 2026,
    role: '외야수',
    games: 132,
    war: 1.16,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.252',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.683',
    summaryLine: '132경기 타율 .252 · 7홈런 46타점 17도루 · OPS 0.683 · WAR 1.16',
  },
  문승원: {
    playerId: '62869',
    seasonYear: 2026,
    role: '불펜',
    games: 58,
    war: 0.61,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '3.51',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.39',
    summaryLine: '58경기 59이닝 · 2승 2패 2세이브 13홀드 · ERA 3.51 · WHIP 1.39 · WAR 0.61',
  },
  오태곤: {
    playerId: '60558',
    seasonYear: 2026,
    role: '외야수',
    games: 99,
    war: 0.22,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.252',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.718',
    summaryLine: '99경기 타율 .252 · 9홈런 34타점 · OPS 0.718 · WAR 0.22',
  },
  최지훈: {
    playerId: '50854',
    seasonYear: 2026,
    role: '외야수',
    games: 131,
    war: 1.66,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.242',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.699',
    summaryLine: '131경기 타율 .242 · 13홈런 57타점 · OPS 0.699 · WAR 1.66',
  },
  권희동: {
    playerId: '63963',
    seasonYear: 2026,
    role: '외야수',
    games: 92,
    war: 0.62,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.241',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.699',
    summaryLine: '92경기 타율 .241 · 5홈런 33타점 · OPS 0.699 · WAR 0.62',
  },
  박상원: {
    playerId: '67703',
    seasonYear: 2026,
    role: '불펜',
    games: 56,
    war: 0.67,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '4.80',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.40',
    summaryLine: '56경기 50 2/3이닝 · 3승 4패 2세이브 11홀드 · ERA 4.80 · WHIP 1.40 · WAR 0.67',
  },
  최재훈: {
    playerId: '78288',
    seasonYear: 2026,
    role: '포수',
    games: 51,
    war: -0.06,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.175',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.474',
    summaryLine: '51경기 타율 .175 · 0홈런 13타점 · OPS 0.474 · WAR -0.06',
  },

  // 2028 FA 예상 후보 34명 (네이버 2026·2025 시즌 공식 기록)
  김진성: {
    playerId: '75867',
    seasonYear: 2026,
    role: '불펜',
    games: 53,
    war: 0.45,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '4.94',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.58',
    summaryLine: '53경기 47 1/3이닝 · 6승 2패 1세이브 18홀드 · ERA 4.94 · WAR 0.45',
  },
  임찬규: {
    playerId: '61101',
    seasonYear: 2026,
    role: '선발',
    games: 28,
    war: 2.69,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '4.15',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.33',
    summaryLine: '28경기 158 1/3이닝 · 14승 6패 · ERA 4.15 · WHIP 1.33 · WAR 2.69',
  },
  이지영: {
    playerId: '79456',
    seasonYear: 2026,
    role: '포수',
    games: 60,
    war: 0.22,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.270',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.654',
    summaryLine: '60경기 타율 .270 · 1홈런 8타점 · OPS 0.654 · WAR 0.22',
  },
  김광현: {
    playerId: '77829',
    seasonYear: 2025,
    role: '선발',
    games: 28,
    war: 1.5,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '5.00',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.49',
    summaryLine: '2025 시즌 28경기 144이닝 · 10승 10패 · ERA 5.00 · WHIP 1.49 · WAR 1.50',
  },
  김재환: {
    playerId: '78224',
    seasonYear: 2026,
    role: '외야수',
    games: 122,
    war: 1.48,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.225',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.755',
    summaryLine: '122경기 타율 .225 · 23홈런 69타점 · OPS 0.755 · WAR 1.48',
  },
  한유섬: {
    playerId: '62895',
    seasonYear: 2026,
    role: '외야수',
    games: 66,
    war: -0.2,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.204',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.571',
    summaryLine: '66경기 타율 .204 · 2홈런 14타점 · OPS 0.571 · WAR -0.20',
  },
  서진용: {
    playerId: '61895',
    seasonYear: 2026,
    role: '불펜',
    games: 16,
    war: 0.0,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '4.76',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.53',
    summaryLine: '16경기 17이닝 · ERA 4.76 · WHIP 1.53 · WAR 0.00',
  },
  박성한: {
    playerId: '67893',
    seasonYear: 2026,
    role: '내야수',
    games: 134,
    war: 5.98,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.329',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.844',
    summaryLine: '134경기 타율 .329 · 4홈런 65타점 · OPS 0.844 · WAR 5.98',
  },
  백정현: {
    playerId: '77446',
    seasonYear: 2026,
    role: '불펜',
    games: 25,
    war: -0.25,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '6.75',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.36',
    summaryLine: '25경기 21 1/3이닝 · 2승 2패 3홀드 · ERA 6.75 · WAR -0.25',
  },
  박세혁: {
    playerId: '62244',
    seasonYear: 2026,
    role: '포수',
    games: 39,
    war: -0.45,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.151',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.381',
    summaryLine: '39경기 타율 .151 · 0홈런 1타점 · OPS 0.381 · WAR -0.45',
  },
  김재윤: {
    playerId: '65062',
    seasonYear: 2026,
    role: '불펜',
    games: 62,
    war: 2.47,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '3.19',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.05',
    summaryLine: '62경기 62이닝 · 7승 5패 34세이브 · ERA 3.19 · WHIP 1.05 · WAR 2.47',
  },
  김지찬: {
    playerId: '50458',
    seasonYear: 2026,
    role: '내야수',
    games: 123,
    war: 3.61,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.320',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.778',
    summaryLine: '123경기 타율 .320 · 37타점 22도루 · OPS 0.778 · WAR 3.61',
  },
  박건우: {
    playerId: '79215',
    seasonYear: 2026,
    role: '외야수',
    games: 126,
    war: 3.06,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.302',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.863',
    summaryLine: '126경기 타율 .302 · 20홈런 78타점 · OPS 0.863 · WAR 3.06',
  },
  박민우: {
    playerId: '62907',
    seasonYear: 2026,
    role: '내야수',
    games: 128,
    war: 4.86,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.319',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.845',
    summaryLine: '128경기 타율 .319 · 7홈런 69타점 48도루 · OPS 0.845 · WAR 4.86',
  },
  도태훈: {
    playerId: '66965',
    seasonYear: 2026,
    role: '내야수',
    games: 73,
    war: -0.03,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.164',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.534',
    summaryLine: '73경기 타율 .164 · 10타점 · OPS 0.534 · WAR -0.03',
  },
  이우성: {
    playerId: '63260',
    seasonYear: 2026,
    role: '외야수',
    games: 116,
    war: 1.42,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.292',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.724',
    summaryLine: '116경기 타율 .292 · 6홈런 48타점 · OPS 0.724 · WAR 1.42',
  },
  주권: {
    playerId: '65060',
    seasonYear: 2026,
    role: '불펜',
    games: 49,
    war: 0.41,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '4.33',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.44',
    summaryLine: '49경기 52이닝 · 3승 1패 2홀드 · ERA 4.33 · WHIP 1.44 · WAR 0.41',
  },
  배제성: {
    playerId: '65516',
    seasonYear: 2026,
    role: '불펜',
    games: 19,
    war: 1.71,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '2.84',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.44',
    summaryLine: '19경기 69 2/3이닝 · 3승 2패 1홀드 · ERA 2.84 · WHIP 1.44 · WAR 1.71',
  },
  전준우: {
    playerId: '78513',
    seasonYear: 2026,
    role: '외야수',
    games: 64,
    war: -0.76,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.226',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.570',
    summaryLine: '64경기 타율 .226 · 3홈런 16타점 · OPS 0.570 · WAR -0.76',
  },
  노진혁: {
    playerId: '62931',
    seasonYear: 2026,
    role: '내야수',
    games: 85,
    war: -0.24,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.218',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.646',
    summaryLine: '85경기 타율 .218 · 5홈런 27타점 · OPS 0.646 · WAR -0.24',
  },
  유강남: {
    playerId: '61102',
    seasonYear: 2026,
    role: '포수',
    games: 56,
    war: -0.27,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.225',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.596',
    summaryLine: '56경기 타율 .225 · 3홈런 9타점 · OPS 0.596 · WAR -0.27',
  },
  박승욱: {
    playerId: '62802',
    seasonYear: 2026,
    role: '내야수',
    games: 97,
    war: -0.28,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.235',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.597',
    summaryLine: '97경기 타율 .235 · 1홈런 20타점 · OPS 0.597 · WAR -0.28',
  },
  박세웅: {
    playerId: '64021',
    seasonYear: 2026,
    role: '선발',
    games: 24,
    war: 1.4,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '4.99',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.55',
    summaryLine: '24경기 131 2/3이닝 · 3승 9패 · ERA 4.99 · WHIP 1.55 · WAR 1.40',
  },
  나균안: {
    playerId: '67539',
    seasonYear: 2026,
    role: '선발',
    games: 24,
    war: 2.06,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '4.31',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '1.44',
    summaryLine: '24경기 137 2/3이닝 · 6승 11패 · ERA 4.31 · WHIP 1.44 · WAR 2.06',
  },
  나성범: {
    playerId: '62947',
    seasonYear: 2026,
    role: '외야수',
    games: 128,
    war: 4.46,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.298',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.918',
    summaryLine: '128경기 타율 .298 · 29홈런 90타점 · OPS 0.918 · WAR 4.46',
  },
  김선빈: {
    playerId: '78603',
    seasonYear: 2026,
    role: '내야수',
    games: 125,
    war: 2.1,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.276',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.719',
    summaryLine: '125경기 타율 .276 · 1홈런 46타점 · OPS 0.719 · WAR 2.10',
  },
  전상현: {
    playerId: '66609',
    seasonYear: 2026,
    role: '불펜',
    games: 38,
    war: 1.27,
    primaryMetricLabel: 'ERA',
    primaryMetricValue: '2.75',
    secondaryMetricLabel: 'WHIP',
    secondaryMetricValue: '0.92',
    summaryLine: '38경기 36이닝 · 2승 1패 1세이브 14홀드 · ERA 2.75 · WHIP 0.92 · WAR 1.27',
  },
  양석환: {
    playerId: '64153',
    seasonYear: 2026,
    role: '내야수',
    games: 44,
    war: -0.57,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.199',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.596',
    summaryLine: '44경기 타율 .199 · 5홈런 15타점 · OPS 0.596 · WAR -0.57',
  },
  강승호: {
    playerId: '63123',
    seasonYear: 2026,
    role: '내야수',
    games: 97,
    war: 0.86,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.260',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.742',
    summaryLine: '97경기 타율 .260 · 8홈런 34타점 · OPS 0.742 · WAR 0.86',
  },
  김인태: {
    playerId: '63257',
    seasonYear: 2026,
    role: '외야수',
    games: 45,
    war: 0.07,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.213',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.667',
    summaryLine: '45경기 타율 .213 · 1홈런 4타점 · OPS 0.667 · WAR 0.07',
  },
  최주환: {
    playerId: '76267',
    seasonYear: 2026,
    role: '내야수',
    games: 93,
    war: 0.0,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.229',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.640',
    summaryLine: '93경기 타율 .229 · 3홈런 30타점 · OPS 0.640 · WAR 0.00',
  },
  안치홍: {
    playerId: '79608',
    seasonYear: 2026,
    role: '내야수',
    games: 113,
    war: 1.34,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.261',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.711',
    summaryLine: '113경기 타율 .261 · 9홈런 53타점 · OPS 0.711 · WAR 1.34',
  },
  김태진: {
    playerId: '64984',
    seasonYear: 2026,
    role: '내야수',
    games: 11,
    war: -0.14,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.133',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.368',
    summaryLine: '11경기 타율 .133 · OPS 0.368 · WAR -0.14',
  },
  임병욱: {
    playerId: '64346',
    seasonYear: 2026,
    role: '외야수',
    games: 77,
    war: 0.74,
    primaryMetricLabel: '타율',
    primaryMetricValue: '.258',
    secondaryMetricLabel: 'OPS',
    secondaryMetricValue: '0.748',
    summaryLine: '77경기 타율 .258 · 10홈런 31타점 · OPS 0.748 · WAR 0.74',
  },
};

// KBO 2027 FA 승인 명단(2026-11-16). 계약은 구단 발표가 확인된 것만 기록한다.
const APPROVED: [TeamCode, string, FAGrade][] = [
  ['SAMSUNG', '원태인', 'A'], ['SAMSUNG', '전병우', 'C'], ['SAMSUNG', '구자욱', 'A'],
  ['KT', '김민수', 'B'], ['KT', '한승혁', 'B'], ['KT', '김상수', 'C'],
  ['KT', '오윤석', 'B'], ['KT', '김민혁', 'A'], ['KT', '배정대', 'A'],
  ['KIA', '김태군', 'B'], ['KIA', '김호령', 'C'],
  ['LG', '박동원', 'B'], ['LG', '홍창기', 'A'],
  ['DOOSAN', '박치국', 'B'], ['DOOSAN', '양의지', 'C'], ['DOOSAN', '정수빈', 'B'],
  ['SSG', '문승원', 'C'], ['SSG', '오태곤', 'C'], ['SSG', '최지훈', 'B'],
  ['NC', '권희동', 'B'],
  ['HANWHA', '박상원', 'A'], ['HANWHA', '최재훈', 'B'],
];

const CONTRACTS: Record<string, FAContract> = {
  양의지: { team: 'DOOSAN', years: '2년', maxEok: 55, announced: '2026-11-17', source: FA_SOURCES.doosan },
  오태곤: { team: 'SSG', years: '3년', maxEok: 11, announced: '2026-11-17', source: FA_SOURCES.ssg },
  최지훈: { team: 'SSG', years: '4년', maxEok: 67, announced: '2026-11-18', source: FA_SOURCES.ssg },
  문승원: { team: 'SSG', years: '2+1년', maxEok: 15, announced: '2026-11-22', source: FA_SOURCES.ssg },
};

export const FA_2027: FAPlayer[] = APPROVED.map(([team, name, grade]) => ({
  team,
  name,
  grade,
  contract: CONTRACTS[name],
  stats: PLAYER_STATS_2026[name],
}));

// 2028년 대상은 KBO가 아직 공시하지 않았다. 아래는 비공식 예상 목록이며
// 2027년 출전일수, 계약 옵션, 은퇴·이적 등에 따라 달라질 수 있다.
const NEXT_CANDIDATES: [TeamCode, string][] = [
  ['LG', '김진성'], ['LG', '임찬규'],
  ['SSG', '이지영'], ['SSG', '김광현'], ['SSG', '김재환'], ['SSG', '한유섬'], ['SSG', '서진용'], ['SSG', '박성한'],
  ['SAMSUNG', '백정현'], ['SAMSUNG', '박세혁'], ['SAMSUNG', '김재윤'], ['SAMSUNG', '김지찬'],
  ['NC', '박건우'], ['NC', '박민우'], ['NC', '도태훈'], ['NC', '이우성'],
  ['KT', '주권'], ['KT', '배제성'],
  ['LOTTE', '전준우'], ['LOTTE', '노진혁'], ['LOTTE', '유강남'], ['LOTTE', '박승욱'], ['LOTTE', '박세웅'], ['LOTTE', '나균안'],
  ['KIA', '나성범'], ['KIA', '김선빈'], ['KIA', '전상현'],
  ['DOOSAN', '양석환'], ['DOOSAN', '강승호'], ['DOOSAN', '김인태'],
  ['KIWOOM', '최주환'], ['KIWOOM', '안치홍'], ['KIWOOM', '김태진'], ['KIWOOM', '임병욱'],
];

export const FA_2028_CANDIDATES: FANextCandidate[] = NEXT_CANDIDATES.map(([team, name]) => ({
  team,
  name,
  stats: PLAYER_STATS_2026[name],
}));

/** 특정 포지션에서 해당 구단의 2026 WAR 순위(1위=가장 높음, 10위=가장 취약)를 구한다. */
export function positionWarRank(team: TeamCode, role: FAPositionRole): number {
  const target = TEAM_NEEDS_2026[team].positionWar[role];
  const sorted = [...TEAM_CODES].sort(
    (a, b) => TEAM_NEEDS_2026[b].positionWar[role] - TEAM_NEEDS_2026[a].positionWar[role],
  );
  return sorted.indexOf(team) + 1;
}

/**
 * 유료 LLM API 호출 없이 네이버 2026 실제 성적·10개 구단 포지션별 WAR 결손도·FA 보상 등급을
 * 결합해 상위 3개 예상 행선지 구단과 적합도 확률(%)을 계산하는 다요인 통계 모델.
 */
export function predictDestination(player: FAPlayer): FADestinationPrediction | null {
  if (player.contract) return null;

  const { role, war, summaryLine } = player.stats;
  const roleWars = TEAM_CODES.map((code) => TEAM_NEEDS_2026[code].positionWar[role]);
  const meanRoleWar = roleWars.reduce((a, b) => a + b, 0) / roleWars.length;
  const maxRoleWar = Math.max(...roleWars);
  const minRoleWar = Math.min(...roleWars);
  const span = Math.max(1, maxRoleWar - minRoleWar);

  // 등급별 타 구단 이적 장벽 (A등급이 가장 높고 C등급은 보호선수 보상이 없어 장벽이 낮다)
  const transferPenalty = player.grade === 'A' ? 1.05 : player.grade === 'B' ? 0.65 : 0.25;

  const rawScores = TEAM_CODES.map((code) => {
    const profile = TEAM_NEEDS_2026[code];
    const teamRoleWar = profile.positionWar[role];
    const isOrig = code === player.team;

    // 1. 포지션 결손도(수요): 리그 최강 대비 해당 구단의 포지션 WAR가 낮을수록 0~1.4점 상승
    const deficitScore = ((maxRoleWar - teamRoleWar) / span) * 1.35;

    // 2. 투·타 팀 보조 지표: 투수면 팀 ERA가 높을수록, 타자면 팀 OPS가 낮을수록 보강 유인 추가
    const teamStatNeed =
      role === '선발' || role === '불펜'
        ? Math.max(0, (profile.era - 4.2) * 0.35)
        : Math.max(0, (0.775 - profile.ops) * 4.5);

    if (isOrig) {
      // 원소속팀 잔류 유인: 기본 프랜차이즈 가산점 + 선수 WAR 기여도 + 원소속팀 포지션 의존도
      const franchiseBonus = 1.45 + Math.max(0, war) * 0.22;
      const retentionNeed = deficitScore * 0.55;
      return { code, logit: franchiseBonus + retentionNeed };
    }

    // 타 구단 영입 유인: 포지션 결손도 + 팀 보조 지표 + 선수 가치 - FA 등급 보상 장벽
    const playerAppeal = Math.max(-0.2, war * 0.14);
    const contenderBoost = war >= 2.0 && profile.rank <= 5 ? 0.22 : 0;
    const logit = deficitScore + teamStatNeed + playerAppeal + contenderBoost - transferPenalty;
    return { code, logit };
  });

  // 상위 3개 구단을 추려 Softmax 로 3자 간 상대 적합도 확률(%)을 산출한다 (합계 100%)
  const top3Raw = [...rawScores].sort((a, b) => b.logit - a.logit).slice(0, 3);
  const weights = top3Raw.map((item) => Math.exp(item.logit));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const probs = weights.map((w) => Math.round((w / weightSum) * 100));
  const diff = 100 - (probs[0] + probs[1] + probs[2]);
  probs[0] += diff;

  const buildCandidate = (code: TeamCode, probability: number): FADestinationCandidate => {
    const isRetention = code === player.team;
    const roleWar = TEAM_NEEDS_2026[code].positionWar[role];
    const rank = positionWarRank(code, role);
    const teamShort = TEAM_ASSETS[code].shortName;

    const rationale = isRetention
      ? `원소속팀 ${teamShort} 내 ${role} WAR 합계는 ${roleWar.toFixed(2)}(리그 ${rank}위)이며, 보상 부담 없이 전력을 유지할 수 있는 최우선 선택지입니다.`
      : `${teamShort}의 2026 시즌 ${role} 합산 WAR는 ${roleWar.toFixed(2)}(10개 구단 중 ${rank}위, 리그 평균 ${meanRoleWar.toFixed(2)})로 외부 ${role} 보강 수요가 높습니다.`;

    return {
      team: code,
      isRetention,
      probability,
      roleWar,
      roleWarRank: rank,
      rationale,
    };
  };

  const topCandidates = [
    buildCandidate(top3Raw[0].code, probs[0]),
    buildCandidate(top3Raw[1].code, probs[1]),
    buildCandidate(top3Raw[2].code, probs[2]),
  ] as const;

  const first = topCandidates[0];
  const second = topCandidates[1];

  return {
    team: first.team,
    label: first.isRetention
      ? `${TEAM_ASSETS[first.team].shortName} 잔류 우세 (${first.probability}%)`
      : `${TEAM_ASSETS[first.team].shortName} 이적 유력 (${first.probability}%)`,
    confidence: '낮음',
    topCandidates,
    compensationRule: GRADE_COMPENSATION_RULES[player.grade],
    reasons: [
      `2026 시즌 실적: ${summaryLine}`,
      `1순위 ${TEAM_ASSETS[first.team].name}(${first.probability}%): ${first.rationale}`,
      `2순위 경쟁 후보 ${TEAM_ASSETS[second.team].name}(${second.probability}%): ${second.rationale}`,
      GRADE_COMPENSATION_RULES[player.grade],
    ],
  };
}

const ALL_ROLES: readonly FAPositionRole[] = ['포수', '내야수', '외야수', '선발', '불펜'];

/**
 * "내가 단장이라면" FA 영입·잔류 시뮬레이터.
 *
 * 선택한 구단(targetTeam)과 영입·잔류 체크한 미계약 FA 선수 이름 목록(selectedNames)을 받아:
 *  - 타 구단에서 영입한 선수의 WAR는 해당 포지션에 더하고
 *  - 우리 구단 소속 미계약 FA 중 체크하지 않은(이탈 가정) 선수의 양수 WAR는 해당 포지션에서 차감하여
 * 5대 포지션별 WAR 및 10개 구단 내 순위 변화, 2027 시즌 예상 승수 증감, 발생 보상선수/보상금을 계산한다.
 */
export function simulateFASignings(
  targetTeam: TeamCode,
  selectedNames: readonly string[],
): FASimulationResult {
  const selectedSet = new Set(selectedNames);
  const pendingPlayers = FA_2027.filter((p) => !p.contract);

  const retainedPlayers = pendingPlayers.filter(
    (p) => p.team === targetTeam && selectedSet.has(p.name),
  );
  const lostOwnPlayers = pendingPlayers.filter(
    (p) => p.team === targetTeam && !selectedSet.has(p.name),
  );
  const externalSignings = pendingPlayers.filter(
    (p) => p.team !== targetTeam && selectedSet.has(p.name),
  );

  // KBO FA 외부 영입 상한(승인 선수 수 기준 최대 3명까지가 일반적인 상한선)
  const externalCountLimitExceeded = externalSignings.length > 3;

  const addedExternalWar = Number(
    externalSignings.reduce((sum, p) => sum + p.stats.war, 0).toFixed(2),
  );
  const lostOwnWar = Number(
    lostOwnPlayers.reduce((sum, p) => sum + Math.max(0, p.stats.war), 0).toFixed(2),
  );
  const netWarDelta = Number((addedExternalWar - lostOwnWar).toFixed(2));

  const roleImpacts: FASimulationRoleImpact[] = ALL_ROLES.map((role) => {
    const beforeWar = TEAM_NEEDS_2026[targetTeam].positionWar[role];
    const addedRoleWar = externalSignings
      .filter((p) => p.stats.role === role)
      .reduce((sum, p) => sum + p.stats.war, 0);
    const lostRoleWar = lostOwnPlayers
      .filter((p) => p.stats.role === role)
      .reduce((sum, p) => sum + Math.max(0, p.stats.war), 0);
    const deltaWar = Number((addedRoleWar - lostRoleWar).toFixed(2));
    const afterWar = Number((beforeWar + deltaWar).toFixed(2));

    const beforeRank = positionWarRank(targetTeam, role);
    const simulatedLeagueWars = TEAM_CODES.map((code) => ({
      code,
      war: code === targetTeam ? afterWar : TEAM_NEEDS_2026[code].positionWar[role],
    })).sort((a, b) => b.war - a.war);
    const afterRank = simulatedLeagueWars.findIndex((item) => item.code === targetTeam) + 1;

    return {
      role,
      beforeWar,
      afterWar,
      deltaWar,
      beforeRank,
      afterRank,
    };
  });

  const baseWins = Math.round(TEAM_NEEDS_2026[targetTeam].winRate * 144);
  const projectedWins = Number(Math.max(30, Math.min(115, baseWins + netWarDelta)).toFixed(1));

  const gradeACount = externalSignings.filter((p) => p.grade === 'A').length;
  const gradeBCount = externalSignings.filter((p) => p.grade === 'B').length;
  const gradeCCount = externalSignings.filter((p) => p.grade === 'C').length;

  return {
    team: targetTeam,
    retainedPlayers,
    externalSignings,
    lostOwnPlayers,
    externalCountLimitExceeded,
    addedExternalWar,
    lostOwnWar,
    netWarDelta,
    baseWins,
    projectedWins,
    roleImpacts,
    compensationSummary: {
      gradeACount,
      gradeBCount,
      gradeCCount,
      protected20Count: gradeACount,
      protected25Count: gradeBCount,
      items: externalSignings.map((player) => ({
        player,
        rule: GRADE_COMPENSATION_RULES[player.grade],
      })),
    },
  };
}

