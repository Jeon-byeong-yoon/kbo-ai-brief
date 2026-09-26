import { NextResponse } from 'next/server';
import { predictChampionship } from '@/lib/prediction';
import { FIRST_SEASON } from '@/types/season';

export async function GET(request: Request, context: { params: Promise<{ year: string }> }) {
  const { year: rawYear } = await context.params;
  const year = Number(rawYear);
  const latest = new Date().getFullYear();

  if (!Number.isInteger(year) || year < FIRST_SEASON || year > latest) {
    return NextResponse.json(
      { success: false, error: `${FIRST_SEASON}~${latest} 시즌만 조회할 수 있습니다.` },
      { status: 400 },
    );
  }

  const iterations = Math.min(
    50000,
    Math.max(1000, Number(new URL(request.url).searchParams.get('iterations')) || 20000),
  );

  try {
    const data = await predictChampionship(year, iterations);
    if (!data) {
      return NextResponse.json(
        { success: false, error: '이 시즌의 예측을 계산하지 못했습니다.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[GET /api/predictions/${year}] 오류:`, error);
    return NextResponse.json(
      { success: false, error: '예측을 계산하지 못했습니다.' },
      { status: 500 },
    );
  }
}
