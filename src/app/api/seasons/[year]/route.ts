import { NextResponse } from 'next/server';
import { fetchSeasonRecords } from '@/lib/season-records';
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
    const data = await fetchSeasonRecords(year);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[GET /api/seasons/${year}] 오류:`, error);
    return NextResponse.json(
      { success: false, error: '시즌 기록을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
