import { NextResponse } from 'next/server';
import { fetchTeamPage } from '@/lib/team-page';
import { findTeam } from '@/lib/team-assets';

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const team = findTeam(code);
  if (!team) {
    return NextResponse.json({ success: false, error: '없는 구단입니다.' }, { status: 404 });
  }

  const yearParam = Number(new URL(request.url).searchParams.get('year'));
  const year = Number.isInteger(yearParam) && yearParam >= 2008 ? yearParam : new Date().getFullYear();

  try {
    const data = await fetchTeamPage(team.code, year);
    if (!data) {
      return NextResponse.json(
        { success: false, error: '이 시즌 구단 기록을 찾지 못했습니다.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`[GET /api/teams/${code}] 오류:`, error);
    return NextResponse.json(
      { success: false, error: '구단 기록을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
