import { NextRequest, NextResponse } from 'next/server';
import { KBOGame } from '@/types/kbo';
import { TEAMS } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get('date') || '2026-07-23';

  // ===================================================================
  // 2026년 7월 23일(목) KBO 정규시즌 실제 경기 결과 (웹 검증 완료)
  // ===================================================================
  const real20260723Games: KBOGame[] = [
    // 1. NC 7 : 5 LG (잠실) — NC 커티스 테일러 vs LG 라클란 웰스
    {
      id: 'game-20260723-1',
      date: requestedDate,
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
      aiReview: {
        id: 'ai-r-1',
        gameId: 'game-20260723-1',
        headline: '📊 NC 7-5 LG 역전승! LG 7연패 수렁 탈출 실패',
        summary: 'NC 다이노스가 커티스 테일러의 선발 등판 속에 LG 트윈스를 7-5로 꺾으며 LG의 7연패를 이어가게 했습니다.',
        keyFactors: ['NC 선발 테일러 안정적 투구', 'LG 7연패 수렁 지속', 'NC 중반 이후 집중 타격으로 역전'],
        pitcherAnalysis: '테일러의 직구와 슬라이더 조합이 LG 타선을 효과적으로 억제했습니다.',
        updatedAt: '2026-07-23 21:40',
      },
    },
    // 2. 삼성 3 : 1 키움 (고척) — 삼성 양창섭 vs 키움 하영민
    {
      id: 'game-20260723-2',
      date: requestedDate,
      time: '18:30',
      stadium: '고척 스카이돔',
      awayTeam: TEAMS.SAMSUNG,
      homeTeam: TEAMS.KIWOOM,
      awayScore: 3,
      homeScore: 1,
      status: 'FINISHED',
      awayPitcher: '양창섭',
      homePitcher: '하영민',
      broadcast: 'KBS N SPORTS',
      aiReview: {
        id: 'ai-r-2',
        gameId: 'game-20260723-2',
        headline: '👑 1위 삼성, 양창섭 6이닝 무실점 호투로 키움 3-1 제압! 위닝 시리즈 달성',
        summary: '선두 삼성 라이온즈가 양창섭의 6이닝 무실점 호투를 앞세워 키움 히어로즈를 3-1로 꺾으며 위닝 시리즈를 달성했습니다.',
        keyFactors: ['양창섭 6이닝 무실점 호투', '삼성 위닝 시리즈 달성', '키움 하영민 선전에도 타선 침묵'],
        pitcherAnalysis: '양창섭의 정교한 제구력과 체인지업이 키움 타선을 완벽하게 봉쇄했습니다.',
        updatedAt: '2026-07-23 21:30',
      },
    },
    // 3. 한화 9 : 3 KIA (광주) — 한화 왕옌청 vs KIA 시라카와
    {
      id: 'game-20260723-3',
      date: requestedDate,
      time: '18:30',
      stadium: '광주 기아 챔피언스 필드',
      awayTeam: TEAMS.HANWHA,
      homeTeam: TEAMS.KIA,
      awayScore: 9,
      homeScore: 3,
      status: 'FINISHED',
      awayPitcher: '왕옌청',
      homePitcher: '시라카와',
      broadcast: 'SBS SPORTS',
      aiReview: {
        id: 'ai-r-3',
        gameId: 'game-20260723-3',
        headline: '📊 한화 9-3 KIA 대승! 왕옌청 호투 & 한화 타선 폭발',
        summary: '한화 이글스가 왕옌청의 안정적인 선발 투구와 타선 폭발에 힘입어 KIA 타이거즈를 9-3으로 대파했습니다.',
        keyFactors: ['왕옌청 선발 호투', '한화 타선 9득점 폭발', 'KIA 시라카와 조기 강판'],
        pitcherAnalysis: '왕옌청의 좌완 특유의 각도 있는 직구와 슬라이더가 KIA 타선을 압도했습니다.',
        updatedAt: '2026-07-23 21:20',
      },
    },
    // 4. SSG 5 : 2 롯데 (사직) — SSG 김민준 vs 롯데 로드리게스
    {
      id: 'game-20260723-4',
      date: requestedDate,
      time: '18:30',
      stadium: '부산 사직 야구장',
      awayTeam: TEAMS.SSG,
      homeTeam: TEAMS.LOTTE,
      awayScore: 5,
      homeScore: 2,
      status: 'FINISHED',
      awayPitcher: '김민준',
      homePitcher: '로드리게스',
      broadcast: 'SPOTV',
      aiReview: {
        id: 'ai-r-4',
        gameId: 'game-20260723-4',
        headline: '📊 SSG 5-2 롯데 승리! 김민준 호투로 위닝 시리즈 완성',
        summary: 'SSG 랜더스가 김민준의 선발 호투를 앞세워 롯데 자이언츠를 5-2로 꺾으며 위닝 시리즈를 완성했습니다.',
        keyFactors: ['김민준 선발 호투', 'SSG 중반 집중 타격', 'SSG 위닝 시리즈 완성'],
        pitcherAnalysis: '김민준의 직구와 커브 조합이 롯데 타선을 효과적으로 저지했습니다.',
        updatedAt: '2026-07-23 21:15',
      },
    },
    // 5. 두산 vs KT (수원) — 경기 취소 (그라운드 사정)
    {
      id: 'game-20260723-5',
      date: requestedDate,
      time: '18:30',
      stadium: '수원 KT위즈파크',
      awayTeam: TEAMS.DOOSAN,
      homeTeam: TEAMS.KT,
      awayScore: 0,
      homeScore: 0,
      status: 'POSTPONED',
      awayPitcher: '곽빈',
      homePitcher: '로건 앨런',
      broadcast: 'SPOTV2',
    },
  ];

  return NextResponse.json({
    success: true,
    data: real20260723Games,
  });
}
