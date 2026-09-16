import { NextRequest, NextResponse } from 'next/server';
import { KBOGame, GameStatus } from '@/types/kbo';
import { TEAMS } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get('date') || '2026-07-28';

  try {
    const url = `https://api-gw.sports.naver.com/schedule/games?date=${requestedDate}&upperCategoryId=kbaseball`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Referer': 'https://sports.naver.com/',
      },
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
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
            'Referer': 'https://sports.naver.com/',
          },
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
        date: requestedDate,
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

      // 임시 AI 프리뷰/리뷰 데이터 (데모용)
      if (status === 'SCHEDULED') {
        game.aiPreview = {
          id: `ai-p-${g.gameId}`,
          gameId: g.gameId,
          headline: `${awayTeam.shortName} ${awayStarter} vs ${homeTeam.shortName} ${homeStarter}, ${detail.stadium || '구장'} 맞대결!`,
          summary: `오늘 ${detail.stadium || '구장'}에서 ${awayTeam.name}와 ${homeTeam.name}의 경기가 열립니다. 선발투수 ${awayStarter}와 ${homeStarter}의 맞대결이 주목됩니다.`,
          keyFactors: [`${awayStarter}의 최근 호투 여부`, `${homeStarter}의 홈 경기 방어율`, `양 팀 타선의 집중력`],
          pitcherAnalysis: `${awayStarter}와 ${homeStarter} 모두 각 팀의 핵심 투수로, 초반 기싸움이 승패를 가를 전망입니다.`,
          updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        };
      } else if (status === 'FINISHED') {
         game.aiReview = {
          id: `ai-r-${g.gameId}`,
          gameId: g.gameId,
          headline: `${awayTeam.shortName} ${game.awayScore}-${game.homeScore} ${homeTeam.shortName} 경기 종료!`,
          summary: `${awayTeam.name}와 ${homeTeam.name}의 치열한 승부 끝에 경기가 종료되었습니다.`,
          keyFactors: ['선발 투수의 퀄리티 스타트 여부', '중심 타선의 결정적 한 방', '불펜의 리드 수성'],
          pitcherAnalysis: `선발투수들의 역투 속에서 불펜진의 활약이 돋보인 경기였습니다.`,
          updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        };
      }

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
