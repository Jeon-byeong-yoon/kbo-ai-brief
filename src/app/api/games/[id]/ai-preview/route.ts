import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/openai";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gameId = parseInt(id);
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    if (isNaN(gameId)) {
      return NextResponse.json({ error: "유효하지 않은 경기 ID입니다." }, { status: 400 });
    }

    // 이미 생성된 프리뷰가 있고 force=true가 아니면 캐시 반환
    if (!force) {
      const existing = await prisma.aiPreview.findUnique({ where: { gameId } });
      if (existing) {
        return NextResponse.json({
          cached: true,
          preview: {
            id: existing.id,
            content: existing.content,
            modelName: existing.modelName,
            generatedAt: existing.generatedAt.toISOString(),
          },
        });
      }
    }

    // 경기 데이터 조회
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { homeTeam: true, awayTeam: true },
    });

    if (!game) {
      return NextResponse.json({ error: "경기를 찾을 수 없습니다." }, { status: 404 });
    }

    if (game.status === "FINAL") {
      return NextResponse.json({ error: "종료된 경기는 프리뷰를 생성할 수 없습니다." }, { status: 400 });
    }

    // 팀 순위 조회
    const currentYear = new Date().getFullYear();
    const [homeStanding, awayStanding, homeStats, awayStats] = await Promise.all([
      prisma.standing.findUnique({ where: { teamId_season: { teamId: game.homeTeamId, season: currentYear } } }),
      prisma.standing.findUnique({ where: { teamId_season: { teamId: game.awayTeamId, season: currentYear } } }),
      prisma.teamStat.findUnique({ where: { teamId_season: { teamId: game.homeTeamId, season: currentYear } } }),
      prisma.teamStat.findUnique({ where: { teamId_season: { teamId: game.awayTeamId, season: currentYear } } }),
    ]);

    // AI 프롬프트 데이터 구성
    const gameData = {
      홈팀: game.homeTeam.name,
      원정팀: game.awayTeam.name,
      구장: game.stadium,
      경기시간: game.startTime,
      홈팀순위: homeStanding ? `${homeStanding.rank}위 (${homeStanding.wins}승 ${homeStanding.losses}패 ${homeStanding.draws}무, 승률 ${homeStanding.winRate.toFixed(3)})` : "정보 없음",
      원정팀순위: awayStanding ? `${awayStanding.rank}위 (${awayStanding.wins}승 ${awayStanding.losses}패 ${awayStanding.draws}무, 승률 ${awayStanding.winRate.toFixed(3)})` : "정보 없음",
      홈팀최근10경기: homeStanding?.last10 ?? "정보 없음",
      원정팀최근10경기: awayStanding?.last10 ?? "정보 없음",
      홈팀타율: homeStats?.battingAverage.toFixed(3) ?? "정보 없음",
      원정팀타율: awayStats?.battingAverage.toFixed(3) ?? "정보 없음",
      홈팀평균자책점: homeStats?.era.toFixed(2) ?? "정보 없음",
      원정팀평균자책점: awayStats?.era.toFixed(2) ?? "정보 없음",
    };

    const prompt = `다음 KBO 경기 데이터를 바탕으로 일반 야구 팬이 이해하기 쉬운 경기 프리뷰를 작성해줘.

조건:
- 너무 전문적인 용어는 피하고 쉽게 설명해줘.
- 승부를 단정하지 말고, 흐름과 변수를 중심으로 설명해줘.
- 야구 초보도 이해할 수 있게 작성해줘.

반드시 아래 JSON 형식으로만 응답해줘 (다른 텍스트 없이 순수 JSON만):
{
  "summary": "경기 한줄 요약",
  "watchPoints": ["관전포인트1", "관전포인트2", "관전포인트3"],
  "variables": ["변수1", "변수2"],
  "watchPlayer": "오늘 경기에서 주목할 선수 또는 볼거리 한 문장"
}

경기 데이터:
${JSON.stringify(gameData, null, 2)}`;

    let content: string;
    const modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";

    try {
      const completion = await openai.chat.completions.create({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" },
      });

      content = completion.choices[0]?.message?.content ?? "";
      // JSON 유효성 검증
      JSON.parse(content);
    } catch (aiError) {
      console.warn("[AI Preview] OpenAI 호출 실패, 더미 응답 사용:", aiError);
      content = JSON.stringify({
        summary: `${game.awayTeam.name}과 ${game.homeTeam.name}의 경기입니다. (AI 키 미설정 - 더미 응답)`,
        watchPoints: [
          "두 팀의 선발 투수 맞대결에 주목하세요.",
          "최근 흐름에서 앞선 팀이 유리한 고지를 점할 가능성이 높습니다.",
          "중반 이후 불펜 싸움이 승부를 가를 수 있습니다.",
        ],
        variables: [
          "날씨와 구장 조건이 투타 균형에 영향을 줄 수 있습니다.",
          "선발 투수의 초반 이닝 관리가 경기 흐름을 좌우합니다.",
        ],
        watchPlayer: "오늘 경기는 선발 투수가 얼마나 긴 이닝을 버텨주느냐가 핵심입니다.",
      });
    }

    // DB 저장 (이미 있으면 업데이트)
    const preview = await prisma.aiPreview.upsert({
      where: { gameId },
      update: { content, modelName, generatedAt: new Date() },
      create: { gameId, content, modelName, generatedAt: new Date() },
    });

    return NextResponse.json({
      cached: false,
      preview: {
        id: preview.id,
        content: preview.content,
        modelName: preview.modelName,
        generatedAt: preview.generatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[POST /api/games/:id/ai-preview] 오류:", error);
    return NextResponse.json(
      { error: "AI 프리뷰 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
