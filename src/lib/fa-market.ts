import type { TeamCode } from './team-assets';

export const FA_AS_OF = '2026-11-25';
export const FA_SOURCES = {
  approved: 'https://koreabaseball.com/MediaNews/Notice/View.aspx?bdSe=12243',
  eligible: 'https://www.koreabaseball.com/MediaNews/Notice/View.aspx?bdSe=12242',
  doosan: 'https://www.koreabaseball.com/MediaNews/News/KboPhoto/View.aspx?bdSe=559551',
  ssg: 'https://www.ssglanders.com/media/news',
  next: 'https://mlbpark.donga.com/mp/b.php?b=kbotown&id=202611200120236316&p=1&pos=reply&query=&reply&select=&shop=&sig=h4aXGg-gh3DRKfX2hdaXGY-Akhlq&site=donga.com&source=&subquery=&subselect=&user=',
} as const;

export type FAGrade = 'A' | 'B' | 'C';
export type FAContract = {
  team: TeamCode;
  years: string;
  maxEok: number;
  announced: string;
  source: string;
};
export type FAPlayer = {
  name: string;
  team: TeamCode;
  grade: FAGrade;
  contract?: FAContract;
};
export type FANextCandidate = { name: string; team: TeamCode };

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

export const FA_2028_CANDIDATES: FANextCandidate[] = NEXT_CANDIDATES.map(([team, name]) => ({ team, name }));

/** 현재 공개된 네 건이 모두 잔류한 소표본만 사용한 보수적 기준선이다. */
export function predictDestination(player: FAPlayer) {
  if (player.contract) return null;
  return {
    team: player.team,
    label: '원소속팀 잔류 예상',
    confidence: '낮음' as const,
    reasons: [
      '11월 25일까지 확인된 계약 4건은 모두 원소속팀 잔류입니다.',
      player.grade === 'C'
        ? 'C등급은 보상선수 없이 금전 보상이 적용됩니다. 다른 팀 이적 가능성도 열려 있습니다.'
        : `${player.grade}등급은 타 구단 이적 시 보상 부담이 있어 잔류를 기본 시나리오로 둡니다.`,
    ],
  };
}
