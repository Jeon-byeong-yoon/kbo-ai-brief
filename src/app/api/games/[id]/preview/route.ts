import { NextResponse } from 'next/server';
import { fetchGamePreview } from '@/lib/game-preview';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const data = await fetchGamePreview(id);
    if (!data) {
      return NextResponse.json(
        { success: false, error: '이 경기의 프리뷰 정보가 없습니다.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[GET /api/games/${id}/preview] 오류:`, error);
    return NextResponse.json(
      { success: false, error: '프리뷰 정보를 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
