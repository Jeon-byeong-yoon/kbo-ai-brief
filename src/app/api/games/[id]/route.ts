import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameId = parseInt(id);

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "유효하지 않은 경기 ID입니다." }, { status: 400 });
    }

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        homeTeam: true,
        awayTeam: true,
        aiPreview: true,
        aiReview: true,
      },
    });

    if (!game) {
      return NextResponse.json({ error: "경기를 찾을 수 없습니다." }, { status: 404 });
    }

    // 팀 순위 조회
    const currentYear = new Date().getFullYear();
    const [homeStanding, awayStanding] = await Promise.all([
      prisma.standing.findUnique({
        where: { teamId_season: { teamId: game.homeTeamId, season: currentYear } },
      }),
      prisma.standing.findUnique({
        where: { teamId_season: { teamId: game.awayTeamId, season: currentYear } },
      }),
    ]);

    const result = {
      id: game.id,
      gameDate: game.gameDate.toISOString().split("T")[0],
      startTime: game.startTime,
      stadium: game.stadium,
      homeTeam: {
        id: game.homeTeam.id,
        name: game.homeTeam.name,
        shortName: game.homeTeam.shortName,
        logoUrl: game.homeTeam.logoUrl,
      },
      awayTeam: {
        id: game.awayTeam.id,
        name: game.awayTeam.name,
        shortName: game.awayTeam.shortName,
        logoUrl: game.awayTeam.logoUrl,
      },
      status: game.status,
      currentInning: game.currentInning,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      homeHits: game.homeHits,
      awayHits: game.awayHits,
      homeErrors: game.homeErrors,
      awayErrors: game.awayErrors,
      homeWalks: game.homeWalks,
      awayWalks: game.awayWalks,
      inningScores: game.inningScores,
      lastUpdatedAt: game.lastUpdatedAt?.toISOString() ?? null,
      hasAiPreview: !!game.aiPreview,
      hasAiReview: !!game.aiReview,
      homeStanding: homeStanding
        ? {
            rank: homeStanding.rank,
            gamesPlayed: homeStanding.gamesPlayed,
            wins: homeStanding.wins,
            losses: homeStanding.losses,
            draws: homeStanding.draws,
            winRate: homeStanding.winRate,
            gamesBehind: homeStanding.gamesBehind,
            last10: homeStanding.last10,
          }
        : null,
      awayStanding: awayStanding
        ? {
            rank: awayStanding.rank,
            gamesPlayed: awayStanding.gamesPlayed,
            wins: awayStanding.wins,
            losses: awayStanding.losses,
            draws: awayStanding.draws,
            winRate: awayStanding.winRate,
            gamesBehind: awayStanding.gamesBehind,
            last10: awayStanding.last10,
          }
        : null,
      aiPreview: game.aiPreview
        ? {
            id: game.aiPreview.id,
            content: game.aiPreview.content,
            modelName: game.aiPreview.modelName,
            generatedAt: game.aiPreview.generatedAt.toISOString(),
          }
        : null,
      aiReview: game.aiReview
        ? {
            id: game.aiReview.id,
            content: game.aiReview.content,
            modelName: game.aiReview.modelName,
            generatedAt: game.aiReview.generatedAt.toISOString(),
          }
        : null,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/games/:id] 오류:", error);
    return NextResponse.json(
      { error: "경기 정보를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
