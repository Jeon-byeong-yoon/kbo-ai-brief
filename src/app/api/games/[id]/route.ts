import { NextResponse } from 'next/server';
import { TEAMS } from '@/lib/mock-data';
import { AIBriefing, GamePlayerHighlight, KBOGame, PlayerLineupItem } from '@/types/kbo';

type LineupSource = Array<[string, string]>;

const makeLineup = (players: LineupSource): PlayerLineupItem[] =>
  players.map(([position, name], index) => ({
    order: index + 1,
    position,
    name,
    avg: 0,
    hits: 0,
    rbi: 0,
  }));

const review = (
  gameId: string,
  headline: string,
  summary: string,
  keyFactors: string[],
  pitcherAnalysis: string
): AIBriefing => ({
  id: `ai-review-${gameId}`,
  gameId,
  headline,
  summary,
  keyFactors,
  pitcherAnalysis,
  updatedAt: '2026-07-23 22:30',
});

const highlight = (
  id: string,
  name: string,
  team: string,
  teamShortName: string,
  teamCode: string,
  position: string,
  playerType: 'BATTER' | 'PITCHER',
  summary: string,
  stats: Array<[string, string]>,
  reason: string
): GamePlayerHighlight => ({
  id, name, team, teamShortName, teamCode, position, playerType, summary,
  stats: stats.map(([label, value]) => ({ label, value })),
  reason,
});

const gameDetailMap: Record<string, KBOGame> = {
  'game-20260723-1': {
    id: 'game-20260723-1',
    date: '2026-07-23',
    time: '18:30',
    stadium: '잠실 야구장',
    awayTeam: TEAMS.NC,
    homeTeam: TEAMS.LG,
    awayScore: 7,
    homeScore: 5,
    status: 'FINISHED',
    awayPitcher: '커티스 테일러',
    homePitcher: '라클란 웰스',
    broadcast: 'MBC SPORTS+',
    inningScores: { away: [0, 1, 0, 0, 5, 0, 1, 0, 0], home: [0, 2, 0, 0, 2, 0, 0, 1, 0] },
    awayStats: { runs: 7, hits: 11, errors: 1, walks: 4 },
    homeStats: { runs: 5, hits: 11, errors: 0, walks: 12 },
    headToHeadRecord: '2026 정규시즌 NC–LG 상대 전적',
    awayLineup: makeLineup([
      ['SS', '김주원'], ['RF', '권희동'], ['2B', '박민우'], ['1B', '블레인 크림'],
      ['DH', '박건우'], ['LF', '이우성'], ['3B', '김휘집'], ['C', '안중열'], ['CF', '천재환'],
    ]),
    homeLineup: makeLineup([
      ['RF', '홍창기'], ['CF', '박해민'], ['LF', '문성주'], ['1B', '오스틴 딘'],
      ['DH', '문정빈'], ['SS', '오지환'], ['3B', '구본혁'], ['C', '이주헌'], ['2B', '신민재'],
    ]),
    bestPlayer: highlight(
      'game1-best', '박건우', 'NC 다이노스', 'NC', 'NC', '지명타자', 'BATTER',
      '승부처에서 NC 공격을 이끈 중심타선',
      [['구분', '타자'], ['역할', '중심타선'], ['결과', '팀 승리']],
      'NC가 중반 이후 흐름을 뒤집는 과정에서 중심타선의 해결사 역할을 수행했습니다.'
    ),
    worstPlayer: highlight(
      'game1-worst', '라클란 웰스', 'LG 트윈스', 'LG', 'LG', '선발투수', 'PITCHER',
      'NC 타선에 리드를 내준 선발 등판',
      [['구분', '투수'], ['역할', '선발'], ['결과', '팀 패배']],
      '경기 중반 NC의 집중타를 막지 못해 LG가 주도권을 잃었습니다.'
    ),
    aiReview: review(
      'game-20260723-1', 'NC 7-5 LG, 중반 집중력으로 역전승',
      'NC가 경기 중반 타선의 집중력을 앞세워 LG를 꺾었습니다.',
      ['NC 중반 이후 5득점', '중심타선의 해결 능력', 'LG 추격을 막은 NC 불펜'],
      'NC 마운드는 리드를 잡은 뒤 남은 이닝을 관리하며 승리를 지켰습니다.'
    ),
  },
  'game-20260723-2': {
    id: 'game-20260723-2',
    date: '2026-07-23',
    time: '18:30',
    stadium: '고척 스카이돔',
    awayTeam: TEAMS.SAMSUNG,
    homeTeam: TEAMS.KIWOOM,
    awayScore: 3,
    homeScore: 1,
    status: 'FINISHED',
    awayPitcher: '김재윤',
    homePitcher: '김재웅',
    broadcast: 'KBS N SPORTS',
    inningScores: {
      away: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2],
      home: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    },
    awayStats: { runs: 3, hits: 8, errors: 0, walks: 4 },
    homeStats: { runs: 1, hits: 12, errors: 2, walks: 2 },
    headToHeadRecord: '2026 정규시즌 삼성–키움 상대 전적',
    awayLineup: makeLineup([
      ['CF', '김지찬'], ['RF', '김성윤'], ['LF', '구자욱'], ['DH', '최형우'],
      ['1B', '르윈 디아즈'], ['2B', '류지혁'], ['SS', '이재현'], ['3B', '김영웅'], ['C', '강민호'],
    ]),
    homeLineup: makeLineup([
      ['2B', '서건창'], ['RF', '추재현'], ['1B', '맷 데이비슨'], ['LF', '케스턴 히우라'],
      ['3B', '김웅빈'], ['DH', '안치홍'], ['CF', '임병욱'], ['C', '김동헌'], ['SS', '권혁빈'],
    ]),
    bestPlayer: highlight(
      'game2-best', '김재윤', '삼성 라이온즈', '삼성', 'SAMSUNG', '선발투수', 'PITCHER',
      '호투로 삼성 승리의 발판 마련',
      [['구분', '투수'], ['역할', '선발'], ['결과', '승리']],
      '김재윤이 키움 타선을 효과적으로 억제하며 삼성의 3-1 승리를 이끌었습니다.'
    ),
    worstPlayer: highlight(
      'game2-worst', '김재웅', '키움 히어로즈', '키움', 'KIWOOM', '선발투수', 'PITCHER',
      '삼성 타선에 결정적 실점 허용',
      [['구분', '투수'], ['역할', '선발'], ['팀 득점', '1']],
      '김재웅이 삼성 타선에 실점을 내주며 키움의 패배를 막지 못했습니다.'
    ),
    aiReview: review(
      'game-20260723-2', '삼성 3-1 키움, 김재윤 호투',
      '삼성이 선발 김재윤의 안정적인 투구를 앞세워 키움을 제압했습니다.',
      ['김재윤 선발 호투', '삼성의 꾸준한 추가점', '키움 타선 1득점'],
      '김재윤은 경기 초반부터 스트라이크존을 적극적으로 공략했습니다.'
    ),
  },
  'game-20260723-3': {
    id: 'game-20260723-3',
    date: '2026-07-23',
    time: '18:30',
    stadium: '광주 기아 챔피언스 필드',
    awayTeam: TEAMS.HANWHA,
    homeTeam: TEAMS.KIA,
    awayScore: 9,
    homeScore: 3,
    status: 'FINISHED',
    awayPitcher: '왕옌청',
    homePitcher: '시라카와 케이쇼',
    broadcast: 'SBS SPORTS',
    inningScores: { away: [0, 0, 3, 2, 0, 2, 2, 0, 0], home: [0, 0, 0, 2, 0, 0, 0, 0, 1] },
    awayStats: { runs: 9, hits: 10, errors: 1, walks: 4 },
    homeStats: { runs: 3, hits: 6, errors: 2, walks: 2 },
    headToHeadRecord: '2026 정규시즌 한화–KIA 상대 전적',
    awayLineup: makeLineup([
      ['LF', '오재원'], ['RF', '요나단 페라자'], ['CF', '문현빈'], ['DH', '노시환'],
      ['C', '허인서'], ['1B', '김태연'], ['2B', '이도윤'], ['3B', '박정현'], ['SS', '심우준'],
    ]),
    homeLineup: makeLineup([
      ['CF', '김호령'], ['LF', '해럴드 카스트로'], ['DH', '김도영'], ['RF', '나성범'],
      ['2B', '김선빈'], ['C', '한준수'], ['1B', '윤도현'], ['3B', '변우혁'], ['SS', '김규성'],
    ]),
    bestPlayer: highlight(
      'game3-best', '왕옌청', '한화 이글스', '한화', 'HANWHA', '선발투수', 'PITCHER',
      '초반 리드를 지킨 안정적인 선발 투구',
      [['구분', '투수'], ['역할', '선발'], ['팀 득점', '9']],
      '한화 타선이 만든 초반 리드를 지키며 대승의 기반을 마련했습니다.'
    ),
    worstPlayer: highlight(
      'game3-worst', '시라카와 케이쇼', 'KIA 타이거즈', 'KIA', 'KIA', '선발투수', 'PITCHER',
      '초반 대량 실점으로 경기 주도권 허용',
      [['구분', '투수'], ['역할', '선발'], ['팀 실점', '9']],
      '초반 한화 타선의 집중 공격을 막지 못해 KIA가 일찍 추격하는 흐름이 됐습니다.'
    ),
    aiReview: review(
      'game-20260723-3', '한화 9-3 KIA, 초반부터 타선 폭발',
      '한화가 초반 대량 득점과 안정적인 마운드 운영으로 KIA에 승리했습니다.',
      ['1·3회 5득점', '한화 장단 13안타', '왕옌청의 리드 수성'],
      '왕옌청은 넉넉한 득점 지원 속에서도 공격적인 투구를 이어갔습니다.'
    ),
  },
  'game-20260723-4': {
    id: 'game-20260723-4',
    date: '2026-07-23',
    time: '18:30',
    stadium: '부산 사직 야구장',
    awayTeam: TEAMS.SSG,
    homeTeam: TEAMS.LOTTE,
    awayScore: 5,
    homeScore: 2,
    status: 'FINISHED',
    awayPitcher: '김민준',
    homePitcher: '엘빈 로드리게스',
    broadcast: 'SPOTV',
    inningScores: { away: [1, 1, 1, 0, 0, 0, 0, 2, 0], home: [0, 0, 0, 0, 0, 0, 0, 0, 2] },
    awayStats: { runs: 5, hits: 9, errors: 2, walks: 4 },
    homeStats: { runs: 2, hits: 7, errors: 2, walks: 4 },
    headToHeadRecord: '2026 정규시즌 SSG–롯데 상대 전적',
    awayLineup: makeLineup([
      ['2B', '정준재'], ['SS', '박성한'], ['LF', '마드리스'], ['DH', '김재환'],
      ['1B', '전의산'], ['CF', '최지훈'], ['C', '조형우'], ['RF', '임근우'], ['3B', '홍대인'],
    ]),
    homeLineup: makeLineup([
      ['CF', '황성빈'], ['2B', '고승민'], ['RF', '레이예스'], ['DH', '한동희'],
      ['1B', '나승엽'], ['3B', '한태양'], ['LF', '전준우'], ['SS', '전민재'], ['C', '손성빈'],
    ]),
    bestPlayer: highlight(
      'game4-best', '김민준', 'SSG 랜더스', 'SSG', 'SSG', '선발투수', 'PITCHER',
      '롯데 타선을 억제한 선발 호투',
      [['구분', '투수'], ['역할', '선발'], ['팀 실점', '2']],
      '경기 내내 롯데 타선의 흐름을 끊어 SSG가 리드를 유지할 수 있게 했습니다.'
    ),
    worstPlayer: highlight(
      'game4-worst', '엘빈 로드리게스', '롯데 자이언츠', '롯데', 'LOTTE', '선발투수', 'PITCHER',
      '중반 실점으로 SSG에 흐름을 내줌',
      [['구분', '투수'], ['역할', '선발'], ['팀 실점', '5']],
      'SSG가 중반에 만든 득점 흐름을 차단하지 못해 롯데가 끌려갔습니다.'
    ),
    aiReview: review(
      'game-20260723-4', 'SSG 5-2 롯데, 김민준 호투로 승리',
      'SSG가 선발 김민준의 호투와 중반 집중타로 롯데를 꺾었습니다.',
      ['김민준의 안정적인 선발 투구', '4·6회 추가점', 'SSG 수비 무실책'],
      '김민준은 위기에서 실점을 최소화하며 선발 역할을 완수했습니다.'
    ),
  },
  'game-20260723-5': {
    id: 'game-20260723-5',
    date: '2026-07-23',
    time: '18:30',
    stadium: '수원 KT위즈파크',
    awayTeam: TEAMS.DOOSAN,
    homeTeam: TEAMS.KT,
    awayScore: 0,
    homeScore: 0,
    status: 'CANCELLED',
    currentInning: '그라운드 사정 취소',
    awayPitcher: '곽빈',
    homePitcher: '로건 앨런',
    broadcast: 'SPOTV2',
  },
  'game-20260724-1': {
    id: 'game-20260724-1',
    date: '2026-07-24',
    time: '18:30',
    stadium: '잠실 야구장',
    awayTeam: TEAMS.SAMSUNG,
    homeTeam: TEAMS.DOOSAN,
    awayScore: 0,
    homeScore: 0,
    status: 'SCHEDULED',
    awayPitcher: '크리스 페덱',
    homePitcher: '최민석',
    broadcast: 'MBC SPORTS+',
    headToHeadRecord: '2026 정규시즌 삼성–두산 상대 전적',
    aiPreview: {
      id: 'ai-p-24-1',
      gameId: 'game-20260724-1',
      headline: '1위 삼성 페덱 vs 두산 에이스 최민석, 잠실 빅매치!',
      summary: '1위 삼성의 외국인 선발 크리스 페덱과 두산의 에이스 최민석(ERA 2.19, 리그 1위)의 맞대결입니다.',
      keyFactors: ['최민석 리그 ERA 1위(2.19)의 탈삼진 능력', '삼성 원정 연승 행진', '두산 홈 경기 높은 승률'],
      pitcherAnalysis: '최민석의 150km/h 강속구와 슬라이더 조합이 삼성 좌타 라인업을 상대로 어떻게 작동할지가 핵심 승부처입니다.',
      updatedAt: '2026-07-24 12:00',
    },
  },
  'game-20260724-2': {
    id: 'game-20260724-2',
    date: '2026-07-24',
    time: '18:30',
    stadium: '대전 한화생명이글스파크',
    awayTeam: TEAMS.LG,
    homeTeam: TEAMS.HANWHA,
    awayScore: 0,
    homeScore: 0,
    status: 'SCHEDULED',
    awayPitcher: '임찬규',
    homePitcher: '박준영',
    broadcast: 'KBS N SPORTS',
    headToHeadRecord: '2026 정규시즌 LG–한화 상대 전적',
    aiPreview: {
      id: 'ai-p-24-2',
      gameId: 'game-20260724-2',
      headline: '7연패 LG, 대전 원정에서 반등할까? 임찬규 vs 박준영',
      summary: '7연패에 빠진 LG 트윈스가 대전 원정에서 한화 이글스와 맞붙습니다. 어제 9-3 대승을 거둔 한화의 기세를 LG 임찬규가 꺾을 수 있을지 주목됩니다.',
      keyFactors: ['LG 7연패 탈출 의지', '한화 어제 9-3 대승 기세', '임찬규의 대전 원정 성적'],
      pitcherAnalysis: '임찬규의 안정적인 구위가 한화 타선의 상승세를 꺾을 수 있을지, 박준영이 LG 중심 타선을 막아낼 수 있을지가 관전 포인트입니다.',
      updatedAt: '2026-07-24 12:00',
    },
  },
  'game-20260724-3': {
    id: 'game-20260724-3',
    date: '2026-07-24',
    time: '18:30',
    stadium: '부산 사직 야구장',
    awayTeam: TEAMS.KT,
    homeTeam: TEAMS.LOTTE,
    awayScore: 0,
    homeScore: 0,
    status: 'SCHEDULED',
    awayPitcher: '로건 앨런',
    homePitcher: '나균안',
    broadcast: 'SPOTV',
    headToHeadRecord: '2026 정규시즌 KT–롯데 상대 전적',
    aiPreview: {
      id: 'ai-p-24-3',
      gameId: 'game-20260724-3',
      headline: 'KT 로건 앨런 vs 롯데 나균안, 사직 야간 경기!',
      summary: '2위 KT의 외국인 에이스 로건 앨런이 사직에서 롯데 나균안과 맞대결합니다.',
      keyFactors: ['로건 앨런의 원정 투구 안정감', '나균안의 사직 홈 성적', '롯데 타선의 반등 의지'],
      pitcherAnalysis: '로건 앨런의 커트패스트볼과 나균안의 직구-슬라이더 조합이 양 팀 타선을 어떻게 상대하느냐가 승패를 가를 것입니다.',
      updatedAt: '2026-07-24 12:00',
    },
  },
  'game-20260724-4': {
    id: 'game-20260724-4',
    date: '2026-07-24',
    time: '18:30',
    stadium: '인천 SSG랜더스필드',
    awayTeam: TEAMS.NC,
    homeTeam: TEAMS.SSG,
    awayScore: 0,
    homeScore: 0,
    status: 'SCHEDULED',
    awayPitcher: '구창모',
    homePitcher: '해치',
    broadcast: 'SBS SPORTS',
    headToHeadRecord: '2026 정규시즌 NC–SSG 상대 전적',
    aiPreview: {
      id: 'ai-p-24-4',
      gameId: 'game-20260724-4',
      headline: 'NC 구창모 vs SSG 해치, 인천 문학 에이스 맞대결!',
      summary: 'NC의 좌완 에이스 구창모와 SSG의 외국인 선발 해치가 인천 SSG랜더스필드에서 격돌합니다.',
      keyFactors: ['구창모의 좌완 제구력', '해치의 삼진 능력', 'NC 어제 승리 기세 연장 여부'],
      pitcherAnalysis: '구창모의 체인지업과 해치의 포심패스트볼 대결이 경기의 핵심 변수가 될 전망입니다.',
      updatedAt: '2026-07-24 12:00',
    },
  },
  'game-20260724-5': {
    id: 'game-20260724-5',
    date: '2026-07-24',
    time: '18:30',
    stadium: '광주 기아 챔피언스 필드',
    awayTeam: TEAMS.KIWOOM,
    homeTeam: TEAMS.KIA,
    awayScore: 0,
    homeScore: 0,
    status: 'SCHEDULED',
    awayPitcher: '선발 미정',
    homePitcher: '선발 미정',
    broadcast: 'SPOTV2',
    headToHeadRecord: '2026 정규시즌 키움–KIA 상대 전적',
    aiPreview: {
      id: 'ai-p-24-5',
      gameId: 'game-20260724-5',
      headline: '키움 vs KIA, 광주 챔피언스 필드 금요일 나이트!',
      summary: '연패 수렁에 빠진 키움 히어로즈가 어제 한화에 3-9로 대패한 KIA와 광주에서 맞붙습니다.',
      keyFactors: ['키움 연패 탈출 의지', 'KIA 홈 경기 반등 여부', '양 팀 불펜 운영 전략'],
      pitcherAnalysis: '양 팀 선발 투수가 아직 미정이며, 경기 당일 발표될 예정입니다.',
      updatedAt: '2026-07-24 12:00',
    },
  },
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const game = gameDetailMap[id];

  if (!game) {
    return NextResponse.json(
      { success: false, error: '경기 정보를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: game });
}

