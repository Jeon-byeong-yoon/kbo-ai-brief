import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();

    const standings = await prisma.standing.findMany({
      where: { season: currentYear },
      include: { team: true },
      orderBy: { rank: "asc" },
    });

    const result = standings.map((s) => ({
      rank: s.rank,
      team: {
        id: s.team.id,
        name: s.team.name,
        shortName: s.team.shortName,
        logoUrl: s.team.logoUrl,
      },
      gamesPlayed: s.gamesPlayed,
      wins: s.wins,
      losses: s.losses,
      draws: s.draws,
      winRate: s.winRate,
      gamesBehind: s.gamesBehind,
      last10: s.last10,
    }));

    return NextResponse.json({
      season: currentYear,
      standings: result,
    });
  } catch (error) {
    console.error("[GET /api/standings] 오류:", error);
    return NextResponse.json(
      { error: "팀 순위를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
