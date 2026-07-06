import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const games = await prisma.game.findMany({
      where: {
        gameDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        aiPreview: { select: { id: true } },
        aiReview: { select: { id: true } },
      },
      orderBy: [{ startTime: "asc" }, { id: "asc" }],
    });

    const result = games.map((game) => ({
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
      lastUpdatedAt: game.lastUpdatedAt?.toISOString() ?? null,
      hasAiPreview: !!game.aiPreview,
      hasAiReview: !!game.aiReview,
    }));

    return NextResponse.json({
      date: today.toISOString().split("T")[0],
      games: result,
    });
  } catch (error) {
    console.error("[GET /api/games/today] 오류:", error);
    return NextResponse.json(
      { error: "경기 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
