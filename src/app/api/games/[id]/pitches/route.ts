import { NextResponse } from 'next/server';
import { fetchGamePitches } from '@/lib/pitch-data';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const home = url.searchParams.get('home') ?? '';
  const away = url.searchParams.get('away') ?? '';
  const live = url.searchParams.get('live') === '1';

  if (!home || !away) {
    return NextResponse.json(
      { success: false, error: 'home, away 팀 코드가 필요합니다.' },
      { status: 400 },
    );
  }

  try {
    const data = await fetchGamePitches(id, home, away, live);
    if (!data) {
      return NextResponse.json(
        { success: false, error: '이 경기의 투구 추적 데이터가 없습니다.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[GET /api/games/${id}/pitches] 오류:`, error);
    return NextResponse.json(
      { success: false, error: '투구 데이터를 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
