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

    // 이미 생성된 리뷰가 있으면 캐시 반환
    if (!force) {
      const existing = await prisma.aiReview.findUnique({ where: { gameId } });
      if (existing) {
        return NextResponse.json({
          cached: true,
          review: {
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

    if (game.status !== "FINAL") {
      return NextResponse.json(
        { error: "경기가 종료되지 않았습니다. 경기 종료 후에만 리뷰를 생성할 수 있습니다." },
        { status: 400 }
      );
    }

    const inningScores = game.inningScores as { home: number[]; away: number[] } | null;

    // AI 프롬프트 데이터 구성
    const gameResultData = {
      홈팀: game.homeTeam.name,
      원정팀: game.awayTeam.name,
      구장: game.stadium,
      최종스코어: `${game.homeTeam.shortName} ${game.homeScore} - ${game.awayScore} ${game.awayTeam.shortName}`,
      이닝별점수: inningScores
        ? {
            홈팀: inningScores.home.join(", "),
            원정팀: inningScores.away.join(", "),
          }
        : "정보 없음",
      홈팀안타: game.homeHits,
      원정팀안타: game.awayHits,
      홈팀실책: game.homeErrors,
      원정팀실책: game.awayErrors,
      홈팀볼넷: game.homeWalks,
      원정팀볼넷: game.awayWalks,
    };

    const prompt = `다음 KBO 경기 결과 데이터를 바탕으로 일반 팬이 이해하기 쉬운 경기 리뷰를 작성해줘.

조건:
- 경기 흐름을 중심으로 설명해줘.
- 승부처를 명확히 짚어줘.
- 특정 팀을 과하게 비난하거나 조롱하지 말고 중립적으로 작성해줘.
- 야구 초보도 이해할 수 있게 쉽게 작성해줘.

반드시 아래 JSON 형식으로만 응답해줘 (다른 텍스트 없이 순수 JSON만):
{
  "summary": "경기 한줄 요약",
  "keyMoment": "승부처 설명",
  "impressivePlayer": "인상적인 선수 또는 활약 설명",
  "gameFlow": {
    "winner": "승리팀의 경기 흐름",
    "loser": "패배팀의 경기 흐름"
  },
  "nextWatch": "다음 경기에서 볼 만한 포인트 한 문장"
}

경기 결과 데이터:
${JSON.stringify(gameResultData, null, 2)}`;

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
      JSON.parse(content);
    } catch (aiError) {
      console.warn("[AI Review] OpenAI 호출 실패, 더미 응답 사용:", aiError);
      const winner = game.homeScore > game.awayScore ? game.homeTeam.name : game.awayTeam.name;
      const loser = game.homeScore > game.awayScore ? game.awayTeam.name : game.homeTeam.name;
      content = JSON.stringify({
        summary: `${winner}이(가) ${Math.max(game.homeScore, game.awayScore)}-${Math.min(game.homeScore, game.awayScore)}으로 ${loser}을(를) 제압했습니다. (AI 키 미설정 - 더미 응답)`,
        keyMoment: "득점이 집중된 이닝에서 승부가 갈렸습니다.",
        impressivePlayer: "오늘 경기에서 활약한 선수들이 팀 승리를 이끌었습니다.",
        gameFlow: {
          winner: `${winner}은(는) 안정적인 경기 운영으로 리드를 지켰습니다.`,
          loser: `${loser}은(는) 추격을 시도했지만 역전에는 실패했습니다.`,
        },
        nextWatch: "다음 경기에서 두 팀이 어떻게 전열을 정비할지 주목하세요.",
      });
    }

    const review = await prisma.aiReview.upsert({
      where: { gameId },
      update: { content, modelName, generatedAt: new Date() },
      create: { gameId, content, modelName, generatedAt: new Date() },
    });

    return NextResponse.json({
      cached: false,
      review: {
        id: review.id,
        content: review.content,
        modelName: review.modelName,
        generatedAt: review.generatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[POST /api/games/:id/ai-review] 오류:", error);
    return NextResponse.json(
      { error: "AI 리뷰 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
