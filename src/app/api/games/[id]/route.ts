import { NextResponse } from 'next/server';
import { fetchGameDetail } from '@/lib/game-detail';

/**
 * 경기 상세.
 *
 * 예전에는 'game-20260723-1' 같은 하드코딩 목업 ID 만 알고 있어서, 목록 API 가 주는
 * 실제 네이버 경기 ID('20260926LGHT02026')로는 전부 404 였다. 이제 네이버에서
 * 직접 받아 만든다.
 */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const data = await fetchGameDetail(id);
    if (!data) {
      return NextResponse.json(
        { success: false, error: '경기 정보를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[GET /api/games/${id}] 오류:`, error);
    return NextResponse.json(
      { success: false, error: '경기 정보를 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
