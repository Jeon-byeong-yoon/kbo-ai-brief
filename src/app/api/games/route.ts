import { NAVER_HEADERS } from '@/lib/naver';
import { NextRequest, NextResponse } from 'next/server';
import { KBOGame, GameStatus } from '@/types/kbo';
import { TEAMS } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get('date') || '2026-07-28';

  try {
    // 네이버 일정 API 의 ?date= 는 무시되고 항상 '오늘' 경기를 돌려준다.
    // 특정 날짜를 받으려면 fromDate/toDate 로 범위를 주고 size 를 명시해야 한다.
    const url =
      `https://api-gw.sports.naver.com/schedule/games` +
      `?fromDate=${requestedDate}&toDate=${requestedDate}&upperCategoryId=kbaseball&size=50`;
    const response = await fetch(url, {
      headers: NAVER_HEADERS,
      cache: 'no-store',
    });

    const json = await response.json();
    const rawGames = json?.result?.games || [];
    const kboGames = rawGames.filter((g: any) => g.categoryId === 'kbo');

    const games: KBOGame[] = await Promise.all(kboGames.map(async (g: any, index: number) => {
      // 상세 정보 조회 (선발 투수 등)
      let detail = g;
      try {
        const detailRes = await fetch(`https://api-gw.sports.naver.com/schedule/games/${g.gameId}`, {
          headers: NAVER_HEADERS,
          cache: 'no-store',
        });
        const detailJson = await detailRes.json();
        if (detailJson?.result?.game) {
          detail = detailJson.result.game;
        }
      } catch (err) {
        console.error(`Failed to fetch detail for game ${g.gameId}`, err);
      }

      // 상태 매핑
      let status: GameStatus = 'SCHEDULED';
      if (detail.statusCode === 'BEFORE') status = 'SCHEDULED';
      else if (detail.statusCode === 'STARTED' || detail.statusCode === 'RUNNING') status = 'IN_PROGRESS';
      else if (detail.statusCode === 'RESULT' || detail.statusCode === 'AFTER') status = 'FINISHED';
      else if (detail.statusCode === 'CANCEL' || detail.statusInfo === '취소' || detail.statusInfo === '우천취소') status = 'CANCELLED';
      else if (detail.statusCode === 'POSTPONED') status = 'POSTPONED';

      const homeCode = detail.homeTeamCode || g.homeTeamCode;
      const awayCode = detail.awayTeamCode || g.awayTeamCode;

      const homeTeam = TEAMS[homeCode] || TEAMS[Object.keys(TEAMS).find(k => TEAMS[k].name.includes(detail.homeTeamName || g.homeTeamName)) || ''] || {
        id: `t_${homeCode}`, name: detail.homeTeamName || g.homeTeamName, shortName: detail.homeTeamName || g.homeTeamName, code: homeCode, logoBg: 'bg-slate-800'
      };
      const awayTeam = TEAMS[awayCode] || TEAMS[Object.keys(TEAMS).find(k => TEAMS[k].name.includes(detail.awayTeamName || g.awayTeamName)) || ''] || {
        id: `t_${awayCode}`, name: detail.awayTeamName || g.awayTeamName, shortName: detail.awayTeamName || g.awayTeamName, code: awayCode, logoBg: 'bg-slate-800'
      };

      const awayStarter = detail.awayStarterName || detail.awayCurrentPitcherName || '미정';
      const homeStarter = detail.homeStarterName || detail.homeCurrentPitcherName || '미정';

      const gameTimeMatch = detail.gameDateTime ? detail.gameDateTime.match(/T(\d{2}:\d{2})/) : null;
      const gameTime = gameTimeMatch ? gameTimeMatch[1] : '18:30';

      const game: KBOGame = {
        id: g.gameId,
        date: g.gameDate || detail.gameDate || requestedDate,
        time: gameTime,
        stadium: detail.stadium || '구장 미정',
        awayTeam,
        homeTeam,
        awayScore: detail.awayTeamScore || 0,
        homeScore: detail.homeTeamScore || 0,
        status,
        currentInning: detail.currentInning || undefined,
        awayPitcher: awayStarter,
        homePitcher: homeStarter,
        broadcast: detail.broadChannel || '미정',
      };

      // 브리핑을 열 수 있는지만 표시한다. 경기 전이면 선발·팀 흐름, 끝난 경기면
      // 실제 기록을 모달에서 받아 보여준다. 여기서 문장을 만들지 않는다.
      game.hasPreview = status === 'SCHEDULED';
      game.hasResult = status === 'FINISHED';

      return game;
    }));

    return NextResponse.json({
      success: true,
      data: games,
    });

  } catch (error) {
    console.error('Error fetching live KBO games:', error);
    return NextResponse.json({
      success: false,
      error: '실시간 경기 일정을 불러오지 못했습니다.',
    }, { status: 500 });
  }
}
