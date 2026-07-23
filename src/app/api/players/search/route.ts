import { NextRequest, NextResponse } from 'next/server';
import { fetchLivePlayerData } from '@/lib/player-data';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (query.length < 1) {
    return NextResponse.json({ success: true, data: [] });
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
