import { NextRequest, NextResponse } from 'next/server';
import { fetchLivePlayerData } from '@/lib/player-data';
import { fetchPlayerIndex, searchIndex } from '@/lib/player-index';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  // scope=career 면 2007년 이후 모든 시즌에서 찾는다. 선수 비교가 은퇴 선수도
  // 골라야 하기 때문이다. 기본값은 이번 시즌만 보는 대시보드용이다.
  const career = request.nextUrl.searchParams.get('scope') === 'career';

  if (query.length < 1) {
    return NextResponse.json({ success: true, data: [] });
  }

  if (career) {
    try {
      const index = await fetchPlayerIndex();
      return NextResponse.json({
        success: true,
        data: searchIndex(index, query).map((p) => ({
          id: `${p.playerType.toLowerCase()}-${p.playerId}`,
          playerId: p.playerId,
          name: p.name,
          team: p.teamName,
          teamCode: p.teamCode,
          position: p.playerType === 'PITCHER' ? '투수' : '야수',
          playerType: p.playerType,
          seasonYear: p.lastYear,
          span: p.firstYear === p.lastYear ? `${p.firstYear}` : `${p.firstYear}~${p.lastYear}`,
          stats: [],
        })),
      });
    } catch (error) {
      console.error('Error searching career player index:', error);
      return NextResponse.json(
        { success: false, error: '선수 색인을 불러오지 못했습니다.' },
        { status: 502 },
      );
    }
  }

  try {
    const live = await fetchLivePlayerData();
    const data = live.searchPlayers
      .filter((player) => player.name.includes(query))
      .sort((a, b) => {
        if (a.name === query) return -1;
        if (b.name === query) return 1;
        return a.name.localeCompare(b.name, 'ko');
      })
      .slice(0, 8);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        seasonYear: 2026,
        statsThrough: '2026-07-23',
        sourceUpdatedAt: live.sourceUpdatedAt,
        source: 'NAVER_SPORTS',
      },
    });
  } catch (error) {
    console.error('Error searching live KBO players:', error);
    return NextResponse.json(
      { success: false, error: '실시간 선수 검색 데이터를 불러오지 못했습니다.' },
      { status: 502 }
    );
  }
}
