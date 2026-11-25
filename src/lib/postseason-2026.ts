import type { TeamCode } from './team-assets';

export type PostseasonSeries = {
  id: 'wc' | 'semi' | 'playoff' | 'korean';
  title: string;
  dates: string;
  teams: readonly [
    { team: TeamCode; seed: number; wins: number },
    { team: TeamCode; seed: number; wins: number },
  ];
  winner: TeamCode;
  source: string;
};

/** 2026년 포스트시즌 종료 결과. 승수는 실제 치른 경기만 센다. */
export const POSTSEASON_2026: readonly PostseasonSeries[] = [
  {
    id: 'wc',
    title: '와일드카드',
    dates: '10.14',
    teams: [{ team: 'LG', seed: 4, wins: 1 }, { team: 'DOOSAN', seed: 5, wins: 0 }],
    winner: 'LG',
    source: 'https://koreabaseball.com/MediaNews/News/BreakingNews/View.aspx?bdSe=62569',
  },
  {
    id: 'semi',
    title: '준플레이오프',
    dates: '10.17–10.20',
    teams: [{ team: 'KIA', seed: 3, wins: 3 }, { team: 'LG', seed: 4, wins: 0 }],
    winner: 'KIA',
    source: 'https://www.koreabaseball.com/MediaNews/News/BreakingNews/View.aspx?bdSe=62579',
  },
  {
    id: 'playoff',
    title: '플레이오프',
    dates: '10.26–11.01',
    teams: [{ team: 'SAMSUNG', seed: 2, wins: 3 }, { team: 'KIA', seed: 3, wins: 2 }],
    winner: 'SAMSUNG',
    source: 'https://www.koreabaseball.com/MediaNews/News/BreakingNews/View.aspx?bdSe=62597',
  },
  {
    id: 'korean',
    title: '한국시리즈',
    dates: '11.03–11.08',
    teams: [{ team: 'KT', seed: 1, wins: 1 }, { team: 'SAMSUNG', seed: 2, wins: 4 }],
    winner: 'SAMSUNG',
    source: 'https://www.koreabaseball.com/MediaNews/News/BreakingNews/View.aspx?bdSe=62619',
  },
];
