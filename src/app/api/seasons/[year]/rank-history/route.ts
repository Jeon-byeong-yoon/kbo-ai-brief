import { NextResponse } from 'next/server';
import { fetchRankHistory } from '@/lib/rank-history';

export async function GET(_request: Request, context: { params: Promise<{ year: string }> }) {
  const { year } = await context.params;
  const parsed = Number(year);

  if (!Number.isInteger(parsed) || parsed < 2008) {
    return NextResponse.json({ success: false, error: '지원하지 않는 시즌입니다.' }, { status: 400 });
  }

  try {
    const data = await fetchRankHistory(parsed);
    if (!data) {
      return NextResponse.json(
        { success: false, error: '이 시즌의 순위 변동을 만들지 못했습니다.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[GET /api/seasons/${year}/rank-history] 오류:`, error);
    return NextResponse.json(
      { success: false, error: '순위 변동을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
