import { NextRequest, NextResponse } from 'next/server';
import { fetchLivePlayerData } from '@/lib/player-data';

const clampInteger = (value: string | null, fallback: number, min: number, max: number) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = clampInteger(searchParams.get('limit'), 50, 1, 50);
  const offset = clampInteger(searchParams.get('offset'), 0, 0, 49);
  const type = searchParams.get('type');

  if (type && type !== 'pitcher' && type !== 'batter') {
    return NextResponse.json(
      { success: false, error: 'type은 pitcher 또는 batter여야 합니다.' },
      { status: 400 }
    );
  }

  try {
    const live = await fetchLivePlayerData();
    const slice = <T,>(players: T[]) => players.slice(offset, offset + limit);
    const total = type === 'pitcher'
      ? live.pitchers.length
      : type === 'batter'
        ? live.batters.length
        : Math.max(live.pitchers.length, live.batters.length);

    return NextResponse.json({
      success: true,
      data: {
        pitchers: type === 'batter' ? [] : slice(live.pitchers),
        batters: type === 'pitcher' ? [] : slice(live.batters),
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
        seasonYear: 2026,
        statsThrough: '2026-07-23',
        sourceUpdatedAt: live.sourceUpdatedAt,
        source: 'NAVER_SPORTS',
      },
    });
  } catch (error) {
    console.error('Error fetching live KBO player stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: '실시간 선수 기록을 불러오지 못했습니다.',
        source: 'NAVER_SPORTS',
      },
      { status: 502 }
    );
  }
}
