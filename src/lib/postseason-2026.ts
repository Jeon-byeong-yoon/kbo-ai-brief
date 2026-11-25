import type { TeamCode } from './team-assets';

export type PostseasonGameSummary = {
  game: string;
  date: string;
  away: TeamCode;
  awayScore: number;
  home: TeamCode;
  homeScore: number;
  stadium: string;
  note?: string;
};

export type PostseasonSeries = {
  id: 'wc' | 'semi' | 'playoff' | 'korean';
  title: string;
  dates: string;
  format: string;
  teams: readonly [
    { team: TeamCode; seed: number; wins: number },
    { team: TeamCode; seed: number; wins: number },
  ];
  winner: TeamCode;
  summary: string;
  games: readonly PostseasonGameSummary[];
  source: string;
};

/** 2026년 포스트시즌 종료 결과. 승수는 실제 치른 경기만 센다. */
export const POSTSEASON_2026: readonly PostseasonSeries[] = [
  {
    id: 'wc',
    title: '와일드카드',
    dates: '10.14',
    format: '4위 1승 어드밴티지 · 최대 2차전',
    teams: [{ team: 'LG', seed: 4, wins: 1 }, { team: 'DOOSAN', seed: 5, wins: 0 }],
    winner: 'LG',
    summary: '1차전 LG 4:1 승리로 시리즈 종료 (4위 어드밴티지 합산 준PO 진출)',
    games: [
      { game: '1차전', date: '10.14', away: 'DOOSAN', awayScore: 1, home: 'LG', homeScore: 4, stadium: '잠실', note: '오스틴 결승 홈런' },
    ],
    source: 'https://koreabaseball.com/MediaNews/News/BreakingNews/View.aspx?bdSe=62569',
  },
  {
    id: 'semi',
    title: '준플레이오프',
    dates: '10.17–10.20',
    format: '5전 3선승제',
    teams: [{ team: 'KIA', seed: 3, wins: 3 }, { team: 'LG', seed: 4, wins: 0 }],
    winner: 'KIA',
    summary: '3위 KIA가 1~3차전을 모두 잡고 3전 전승으로 플레이오프 진출',
    games: [
      { game: '1차전', date: '10.17', away: 'LG', awayScore: 1, home: 'KIA', homeScore: 5, stadium: '광주' },
      { game: '2차전', date: '10.18', away: 'LG', awayScore: 3, home: 'KIA', homeScore: 6, stadium: '광주' },
      { game: '3차전', date: '10.20', away: 'KIA', awayScore: 13, home: 'LG', homeScore: 1, stadium: '잠실' },
    ],
    source: 'https://www.koreabaseball.com/MediaNews/News/BreakingNews/View.aspx?bdSe=62579',
  },
  {
    id: 'playoff',
    title: '플레이오프',
    dates: '10.26–11.01',
    format: '5전 3선승제',
    teams: [{ team: 'SAMSUNG', seed: 2, wins: 3 }, { team: 'KIA', seed: 3, wins: 2 }],
    winner: 'SAMSUNG',
    summary: '5차전 후라도 7이닝 1실점·김지찬 3타점 활약으로 삼성 한국시리즈 진출',
    games: [
      { game: '1차전', date: '10.26', away: 'KIA', awayScore: 5, home: 'SAMSUNG', homeScore: 1, stadium: '대구' },
      { game: '2차전', date: '10.27', away: 'KIA', awayScore: 3, home: 'SAMSUNG', homeScore: 8, stadium: '대구' },
      { game: '3차전', date: '10.29', away: 'SAMSUNG', awayScore: 6, home: 'KIA', homeScore: 4, stadium: '광주' },
      { game: '4차전', date: '10.30', away: 'SAMSUNG', awayScore: 2, home: 'KIA', homeScore: 4, stadium: '광주' },
      { game: '5차전', date: '11.01', away: 'KIA', awayScore: 1, home: 'SAMSUNG', homeScore: 6, stadium: '대구', note: '후라도 7이닝 1실점' },
    ],
    source: 'https://www.koreabaseball.com/MediaNews/News/BreakingNews/View.aspx?bdSe=62597',
  },
  {
    id: 'korean',
    title: '한국시리즈',
    dates: '11.03–11.08',
    format: '7전 4선승제',
    teams: [{ team: 'KT', seed: 1, wins: 1 }, { team: 'SAMSUNG', seed: 2, wins: 4 }],
    winner: 'SAMSUNG',
    summary: '1차전 패배 후 2차전 연장 12회 역전승부터 4연승으로 삼성 통산 9번째 우승',
    games: [
      { game: '1차전', date: '11.03', away: 'SAMSUNG', awayScore: 7, home: 'KT', homeScore: 8, stadium: '수원' },
      { game: '2차전', date: '11.04', away: 'SAMSUNG', awayScore: 3, home: 'KT', homeScore: 2, stadium: '수원', note: '연장 12회' },
      { game: '3차전', date: '11.06', away: 'KT', awayScore: 1, home: 'SAMSUNG', homeScore: 5, stadium: '대구' },
      { game: '4차전', date: '11.07', away: 'KT', awayScore: 5, home: 'SAMSUNG', homeScore: 10, stadium: '대구' },
      { game: '5차전', date: '11.08', away: 'KT', awayScore: 1, home: 'SAMSUNG', homeScore: 12, stadium: '대구', note: '삼성 우승 확정' },
    ],
    source: 'https://www.koreabaseball.com/MediaNews/News/BreakingNews/View.aspx?bdSe=62619',
  },
];
