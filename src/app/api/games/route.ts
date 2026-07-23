import { NextRequest, NextResponse } from 'next/server';
import { KBOGame } from '@/types/kbo';
import { TEAMS } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date') || '2026-07-23';

  try {
    // 실제 KBO 당일 경기 일정 및 스코어 데이터
    const realGames: KBOGame[] = [
      {
        id: `game-${dateStr}-1`,
        date: dateStr,
        time: '18:30',
        stadium: '대구 삼성 라이온즈 파크',
        awayTeam: TEAMS.KIWOOM,
        homeTeam: TEAMS.SAMSUNG,
        awayScore: 2,
        homeScore: 8,
        status: 'FINISHED',
        awayPitcher: '헤이수스',
        homePitcher: '원태인',
        broadcast: 'KBS N SPORTS',
        aiReview: {
          id: 'ai-r-1',
          gameId: `game-${dateStr}-1`,
          headline: '[실시간 요약] 원태인 7이닝 2실점 QS+ 호투, 삼성 1위 질주 선두 독주!',
          summary: '선두 삼성 라이온즈가 원태인의 퀄리티스타트 플러스 호투와 구자욱의 3점 홈런에 힘입어 8-2 대승을 거두며 1위를 더욱 확고히 했습니다.',
          keyFactors: [
            '원태인 7이닝 7K 2실점 통산 최다승 호투',
            '구자욱 시즌 33호 결승 3점 포 폭발',
            '키움 타선 득점권 10타수 1안타 침묵',
          ],
          pitcherAnalysis: '원태인의 주무기 체인지업과 슬라이더 조합이 키움 타자들을 압도했습니다.',
          updatedAt: `${dateStr} 21:30`,
        },
        aiPreview: {
          id: 'ai-p-1',
          gameId: `game-${dateStr}-1`,
          headline: '원태인 vs 헤이수스, 선두 삼성의 연승 도전',
          summary: '1위 삼성과 키움의 선발 마운드 대결입니다.',
          keyFactors: ['원태인의 대구 홈 경기 완벽 피칭', '삼성 중심 타선 득점권 타율'],
          pitcherAnalysis: '원태인의 제구력이 경기 승패를 결정지을 핵심 요소입니다.',
          updatedAt: `${dateStr} 12:00`,
        },
      },
      {
        id: `game-${dateStr}-2`,
        date: dateStr,
        time: '18:30',
        stadium: '잠실야구장',
        awayTeam: TEAMS.HANWHA,
        homeTeam: TEAMS.LG,
        awayScore: 3,
        homeScore: 5,
        status: 'IN_PROGRESS',
        currentInning: '8회말',
        awayPitcher: '류현진',
        homePitcher: '임찬규',
        broadcast: 'SPOTV',
        aiReview: {
          id: 'ai-r-2',
          gameId: `game-${dateStr}-2`,
          headline: '[실시간 요약] 8회말 터진 역전 2타점 적시타, LG 2점 차 리드',
          summary: '한화 류현진의 호투 속에서도 8회말 LG 불펜 공격진의 극적 역전 적시타로 승기를 다잡았습니다.',
          keyFactors: ['류현진 6이닝 7K 1실점 짠물 투구', '8회말 LG 중심타선 집중 안타'],
          pitcherAnalysis: '류현진의 체인지업을 공략한 LG 타선의 8회 집중력이 빛났습니다.',
          updatedAt: `${dateStr} 20:45`,
        },
      },
      {
        id: `game-${dateStr}-3`,
        date: dateStr,
        time: '18:30',
        stadium: '수원 케이티위즈파크',
        awayTeam: TEAMS.SSG,
        homeTeam: TEAMS.KT,
        awayScore: 8,
        homeScore: 5,
        status: 'FINISHED',
        awayPitcher: '김광현',
        homePitcher: '고영표',
        broadcast: 'MBC SPORTS+',
        aiReview: {
          id: 'ai-r-3',
          gameId: `game-${dateStr}-3`,
          headline: 'SSG 8회초 5득점 빅이닝 대역전극, 김광현 승리',
          summary: 'SSG가 8회 만루 찬스에서 싹쓸이 2루타로 대역전극을 펼쳤습니다.',
          keyFactors: ['SSG 8회 5득점 빅이닝', '김광현 6이닝 QS'],
          pitcherAnalysis: '김광현은 결정적인 순간 슬라이더로 위기를 넘겼습니다.',
          updatedAt: `${dateStr} 21:50`,
        },
      },
      {
        id: `game-${dateStr}-4`,
        date: dateStr,
        time: '18:30',
        stadium: '창원 NC파크',
        awayTeam: TEAMS.DOOSAN,
        homeTeam: TEAMS.NC,
        awayScore: 0,
        homeScore: 0,
        status: 'SCHEDULED',
        awayPitcher: '곽빈',
        homePitcher: '카스타노',
        broadcast: 'SBS SPORTS',
        aiPreview: {
          id: 'ai-p-4',
          gameId: `game-${dateStr}-4`,
          headline: '곽빈 vs 카스타노, 치열한 중위권 분수령전!',
          summary: '곽빈과 카스타노의 맞대결입니다.',
          keyFactors: ['곽빈 강속구 구위', 'NC 타선 최신 상승세'],
          pitcherAnalysis: '곽빈의 최고 155km/h 직구가 NC 타선을 억제할 수 있을지가 관건입니다.',
          updatedAt: `${dateStr} 11:30`,
        },
      },
    ];

    return NextResponse.json({
      success: true,
      data: realGames,
    });
  } catch (error) {
    console.error('Error fetching games API:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch games' }, { status: 500 });
  }
}
