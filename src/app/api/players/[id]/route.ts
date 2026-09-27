import { NextResponse } from 'next/server';
import { fetchPlayerCareer } from '@/lib/player-career';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const data = await fetchPlayerCareer(id);
    if (!data) {
      return NextResponse.json(
        { success: false, error: '이 선수의 기록을 찾지 못했습니다.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[GET /api/players/${id}] 오류:`, error);
    return NextResponse.json(
      { success: false, error: '선수 기록을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
