/**
 * 구단 식별 정보의 단일 출처.
 *
 * 이전에는 각 API 라우트와 mock-data 가 `logoBg: 'bg-rose-950 border-rose-600 ...'`
 * 처럼 다크 전용 Tailwind 클래스 문자열을 직접 들고 있었다. 그래서 라이트 모드가
 * 성립하지 않았고, 색을 바꾸려면 응답을 만드는 쪽을 전부 고쳐야 했다.
 * 지금은 화면 쪽에서 구단 코드만 보고 이 파일에서 색과 이미지를 찾아 쓴다.
 */

export type TeamCode =
  | 'LG'
  | 'DOOSAN'
  | 'KT'
  | 'SSG'
  | 'NC'
  | 'KIWOOM'
  | 'HANWHA'
  | 'LOTTE'
  | 'SAMSUNG'
  | 'KIA';

export interface TeamAsset {
  code: TeamCode;
  name: string;
  /** 표에서 쓰는 짧은 이름 */
  shortName: string;
  /** 로고 이미지가 없을 때 배지에 넣는 글자 */
  mono: string;
  /** 구단 상징색. 라이트/다크 각각 [글자색, 배경색] */
  light: readonly [string, string];
  dark: readonly [string, string];
  /**
   * public/teams/ 아래 파일 이름. null 이면 이미지 없이 색 배지로 표시한다.
   * 지금 들어 있는 건 각 구단이 현재 쓰는 공식 엠블럼이다(각 구단 등록상표).
   * 파일을 바꾸고 여기 이름만 고치면 경기 카드·순위표·경기 상세까지
   * 한 번에 반영된다. (public/teams/README.md 참고)
   */
  logo: string | null;
}

export const TEAM_ASSETS: Record<TeamCode, TeamAsset> = {
  LG: {
    code: 'LG',
    name: 'LG 트윈스',
    shortName: 'LG',
    mono: 'LG',
    light: ['#C30452', '#FBEBF1'],
    dark: ['#FF6D98', '#2A151E'],
    logo: 'lg.png',
  },
  DOOSAN: {
    code: 'DOOSAN',
    name: '두산 베어스',
    shortName: '두산',
    mono: '두산',
    light: ['#1A1B44', '#ECEDF3'],
    dark: ['#9AA6E0', '#191B2C'],
    logo: 'doosan.png',
  },
  KT: {
    code: 'KT',
    name: 'KT 위즈',
    shortName: 'KT',
    mono: 'KT',
    light: ['#26282B', '#EDEEEF'],
    dark: ['#C9CDD3', '#212326'],
    logo: 'kt.png',
  },
  SSG: {
    code: 'SSG',
    name: 'SSG 랜더스',
    shortName: 'SSG',
    mono: 'SSG',
    light: ['#CE0E2D', '#FBEBEE'],
    dark: ['#FF7182', '#2A1519'],
    logo: 'ssg.png',
  },
  NC: {
    code: 'NC',
    name: 'NC 다이노스',
    shortName: 'NC',
    mono: 'NC',
    light: ['#315288', '#EBF0F7'],
    dark: ['#87A9E2', '#171E2B'],
    logo: 'nc.png',
  },
  KIWOOM: {
    code: 'KIWOOM',
    name: '키움 히어로즈',
    shortName: '키움',
    mono: '키움',
    light: ['#6B0F22', '#F5EAED'],
    dark: ['#DE8E9C', '#261519'],
    logo: 'kiwoom.png',
  },
  HANWHA: {
    code: 'HANWHA',
    name: '한화 이글스',
    shortName: '한화',
    mono: '한화',
    light: ['#E15100', '#FDF0E7'],
    dark: ['#FF9448', '#2A1B10'],
    logo: 'hanwha.png',
  },
  LOTTE: {
    code: 'LOTTE',
    name: '롯데 자이언츠',
    shortName: '롯데',
    mono: '롯데',
    light: ['#0A2A5E', '#EAEEF5'],
    dark: ['#8BA8D2', '#161C28'],
    logo: 'lotte.png',
  },
  SAMSUNG: {
    code: 'SAMSUNG',
    name: '삼성 라이온즈',
    shortName: '삼성',
    mono: '삼성',
    light: ['#074CA1', '#EAF0F9'],
    dark: ['#75A6E8', '#141D2B'],
    logo: 'samsung.png',
  },
  KIA: {
    code: 'KIA',
    name: 'KIA 타이거즈',
    shortName: 'KIA',
    mono: 'KIA',
    light: ['#D9002B', '#FCEAEE'],
    dark: ['#FF6B80', '#2A1418'],
    logo: 'kia.png',
  },
};

export const TEAM_CODES = Object.keys(TEAM_ASSETS) as TeamCode[];

/**
 * 앱 안에 구단 식별자가 세 갈래로 돌아다닌다.
 *  - 내부 코드: 'LG', 'DOOSAN' ...
 *  - 네이버 스포츠 코드: 'OB', 'WO', 'HH', 'SS', 'HT', 'SK', 'LT' ...
 *  - 한글 이름: '두산', '두산 베어스' ...
 * 어느 쪽으로 들어와도 같은 구단으로 찾히게 한다.
 */
const ALIASES: Record<string, TeamCode> = {};
const register = (key: string | undefined | null, code: TeamCode) => {
  if (key) ALIASES[key.toUpperCase()] = code;
};

TEAM_CODES.forEach((code) => {
  const team = TEAM_ASSETS[code];
  register(code, code);
  register(team.name, code);
  register(team.shortName, code);
  register(team.name.replace(/\s/g, ''), code);
});

// 네이버 스포츠 구단 코드
(
  [
    ['OB', 'DOOSAN'],
    ['WO', 'KIWOOM'],
    ['HH', 'HANWHA'],
    ['SS', 'SAMSUNG'],
    ['HT', 'KIA'],
    ['SK', 'SSG'],
    ['LT', 'LOTTE'],
    ['NC', 'NC'],
    ['KT', 'KT'],
    ['LG', 'LG'],
  ] as const
).forEach(([alias, code]) => register(alias, code));

export function findTeam(...hints: Array<string | undefined | null>): TeamAsset | null {
  for (const hint of hints) {
    if (!hint) continue;
    const direct = ALIASES[hint.toUpperCase()];
    if (direct) return TEAM_ASSETS[direct];
  }
  // 코드로도 이름으로도 못 찾으면 부분 일치까지 시도한다 ('두산 베어스(원정)' 같은 값)
  for (const hint of hints) {
    if (!hint) continue;
    const match = TEAM_CODES.find(
      (code) => hint.includes(TEAM_ASSETS[code].shortName) || TEAM_ASSETS[code].name.includes(hint),
    );
    if (match) return TEAM_ASSETS[match];
  }
  return null;
}

/** 현재 테마에서 쓸 [글자색, 배경색] */
export function teamColors(team: TeamAsset | null, theme: 'light' | 'dark'): readonly [string, string] {
  if (!team) return theme === 'dark' ? ['#C9CDD3', '#212326'] : ['#5A6069', '#F1F3F5'];
  return theme === 'dark' ? team.dark : team.light;
}

/**
 * 엠블럼 파일을 교체할 때 올린다.
 *
 * 파일 이름을 그대로 두고 내용만 바꾸면 브라우저가 예전 이미지를 캐시에서 그대로
 * 내준다. 실제로 커먼즈 엠블럼에서 구단 공식 엠블럼으로 갈아끼울 때 확장자가 바뀐
 * 7개 구단만 갱신되고, 이름이 같았던 ssg/hanwha/kiwoom 세 개가 옛 이미지로 남았다.
 */
export const TEAM_LOGO_VERSION = 2;

export function teamLogoSrc(team: TeamAsset | null): string | null {
  return team?.logo ? `/teams/${team.logo}?v=${TEAM_LOGO_VERSION}` : null;
}
