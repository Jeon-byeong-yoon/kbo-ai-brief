import { NextResponse } from 'next/server';
import { fetchHeadToHead } from '@/lib/head-to-head';
import { FIRST_SEASON } from '@/types/season';

export async function GET(_request: Request, context: { params: Promise<{ year: string }> }) {
  const { year: rawYear } = await context.params;
  const year = Number(rawYear);
  const latest = new Date().getFullYear();

  if (!Number.isInteger(year) || year < FIRST_SEASON || year > latest) {
    return NextResponse.json(
      { success: false, error: `${FIRST_SEASON}~${latest} 시즌만 조회할 수 있습니다.` },
      { status: 400 },
    );
  }

  try {
    const data = await fetchHeadToHead(year);
    if (!data) {
      return NextResponse.json(
        { success: false, error: '이 시즌의 상대전적을 계산하지 못했습니다.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[GET /api/seasons/${year}/head-to-head] 오류:`, error);
    return NextResponse.json(
      { success: false, error: '상대전적을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
