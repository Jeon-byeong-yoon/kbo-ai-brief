import { NextRequest, NextResponse } from 'next/server';

/**
 * 한 달치 경기 일정 요약. 날짜 스트립에서 "이 날 경기가 있나"를 표시하는 데 쓴다.
 *
 * 네이버 일정 API 는 fromDate/toDate 범위를 받지만 size 를 주지 않으면 앞쪽 몇 건만
 * 돌려준다. 그리고 범위가 한 달을 크게 넘으면 조용히 잘라서 준다. 그래서 월 단위로만
 * 부른다.
 */
const NAVER_SCHEDULE_URL = 'https://api-gw.sports.naver.com/schedule/games';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://sports.naver.com/',
};

export interface ScheduleDaySummary {
  date: string; // 'YYYY-MM-DD'
  total: number;
  finished: number;
  live: number;
  scheduled: number;
  cancelled: number;
}

const lastDayOfMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') ?? '';

  const match = month.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return NextResponse.json(
      { success: false, error: 'month 는 YYYY-MM 형식이어야 합니다.' },
      { status: 400 },
    );
  }

  const year = Number(match[1]);
  const monthNumber = Number(match[2]);
  const from = `${month}-01`;
  const to = `${month}-${String(lastDayOfMonth(year, monthNumber)).padStart(2, '0')}`;

  try {
    const url = `${NAVER_SCHEDULE_URL}?fromDate=${from}&toDate=${to}&upperCategoryId=kbaseball&size=300`;
    const response = await fetch(url, { headers: HEADERS, next: { revalidate: 300 } });
    const json = await response.json();

    const games: Array<Record<string, unknown>> = (json?.result?.games ?? []).filter(
      (game: Record<string, unknown>) => game.categoryId === 'kbo',
    );

    const byDate = new Map<string, ScheduleDaySummary>();
    for (const game of games) {
      const date = String(game.gameDate ?? '');
      if (!date) continue;

      const day =
        byDate.get(date) ??
        { date, total: 0, finished: 0, live: 0, scheduled: 0, cancelled: 0 };

      const status = String(game.statusCode ?? '');
      day.total += 1;
      if (game.cancel === true || status === 'CANCEL' || status === 'POSTPONED') day.cancelled += 1;
      else if (status === 'RESULT' || status === 'AFTER') day.finished += 1;
      else if (status === 'STARTED' || status === 'RUNNING') day.live += 1;
      else day.scheduled += 1;

      byDate.set(date, day);
    }

    return NextResponse.json({
      success: true,
      data: {
        month,
        days: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)),
      },
    });
  } catch (error) {
    console.error(`[GET /api/schedule?month=${month}] 오류:`, error);
    return NextResponse.json(
      { success: false, error: '월간 일정을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}
