import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GameDetail } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import TeamLogo from "@/components/ui/TeamLogo";
import AiContentSection from "@/components/game/AiContent";

export const revalidate = 120; // 2분

async function getGame(id: number): Promise<GameDetail | null> {
  const game = await prisma.game.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true, aiPreview: true, aiReview: true },
  });
  if (!game) return null;

  const currentYear = new Date().getFullYear();
  const [homeStanding, awayStanding] = await Promise.all([
    prisma.standing.findUnique({ where: { teamId_season: { teamId: game.homeTeamId, season: currentYear } } }),
    prisma.standing.findUnique({ where: { teamId_season: { teamId: game.awayTeamId, season: currentYear } } }),
  ]);

  return {
    id: game.id,
    gameDate: game.gameDate.toISOString().split("T")[0],
    startTime: game.startTime,
    stadium: game.stadium,
    homeTeam: { id: game.homeTeam.id, name: game.homeTeam.name, shortName: game.homeTeam.shortName, logoUrl: game.homeTeam.logoUrl },
    awayTeam: { id: game.awayTeam.id, name: game.awayTeam.name, shortName: game.awayTeam.shortName, logoUrl: game.awayTeam.logoUrl },
    status: game.status as GameDetail["status"],
    currentInning: game.currentInning,
    homeScore: game.homeScore,
    awayScore: game.awayScore,
    homeHits: game.homeHits,
    awayHits: game.awayHits,
    homeErrors: game.homeErrors,
    awayErrors: game.awayErrors,
    homeWalks: game.homeWalks,
    awayWalks: game.awayWalks,
    inningScores: game.inningScores as GameDetail["inningScores"],
    lastUpdatedAt: game.lastUpdatedAt?.toISOString() ?? null,
    hasAiPreview: !!game.aiPreview,
    hasAiReview: !!game.aiReview,
    homeStanding: homeStanding ? { rank: homeStanding.rank, gamesPlayed: homeStanding.gamesPlayed, wins: homeStanding.wins, losses: homeStanding.losses, draws: homeStanding.draws, winRate: homeStanding.winRate, gamesBehind: homeStanding.gamesBehind, last10: homeStanding.last10 } : null,
    awayStanding: awayStanding ? { rank: awayStanding.rank, gamesPlayed: awayStanding.gamesPlayed, wins: awayStanding.wins, losses: awayStanding.losses, draws: awayStanding.draws, winRate: awayStanding.winRate, gamesBehind: awayStanding.gamesBehind, last10: awayStanding.last10 } : null,
    aiPreview: game.aiPreview ? { id: game.aiPreview.id, content: game.aiPreview.content, modelName: game.aiPreview.modelName, generatedAt: game.aiPreview.generatedAt.toISOString() } : null,
    aiReview: game.aiReview ? { id: game.aiReview.id, content: game.aiReview.content, modelName: game.aiReview.modelName, generatedAt: game.aiReview.generatedAt.toISOString() } : null,
  };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await getGame(parseInt(id));
  if (!game) notFound();

  const isFinal = game.status === "FINAL";
  const isLive = game.status === "LIVE";
  const showScore = isLive || isFinal;
  const homeWin = isFinal && game.homeScore > game.awayScore;
  const awayWin = isFinal && game.awayScore > game.homeScore;

  return (
    <div className="container">
      {/* 뒤로 가기 */}
      <a href="/" style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        fontSize: "13px", color: "var(--text-muted)", textDecoration: "none",
        marginBottom: "20px",
      }}>
        ← 오늘 경기 목록
      </a>

      {/* 스코어보드 */}
      <div className="card" style={{ padding: "28px 24px", marginBottom: "16px" }}>
        {/* 구장 / 시간 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "12px", marginBottom: "20px",
        }}>
          <StatusBadge status={game.status} inning={game.currentInning} />
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {game.startTime} · {game.stadium}
          </span>
        </div>

        {/* 팀 vs 팀 + 스코어 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* 원정팀 */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <TeamLogo shortName={game.awayTeam.shortName} size="lg" />
            <p style={{
              marginTop: "10px",
              fontSize: "16px", fontWeight: 700,
              color: awayWin ? "var(--text-primary)" : isFinal ? "var(--text-muted)" : "var(--text-primary)",
            }}>
              {game.awayTeam.shortName}
            </p>
            {game.awayStanding && (
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                {game.awayStanding.rank}위 · {game.awayStanding.last10}
              </p>
            )}
          </div>

          {/* 스코어 */}
          <div style={{ textAlign: "center", padding: "0 20px" }}>
            {showScore ? (
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{
                  fontSize: "52px", fontWeight: 900, fontFamily: "'Inter', sans-serif",
                  color: awayWin ? "var(--text-primary)" : isFinal ? "var(--text-muted)" : "var(--text-primary)",
                  lineHeight: 1,
                }}>
                  {game.awayScore}
                </span>
                <span style={{ fontSize: "20px", color: "var(--text-muted)", fontWeight: 300 }}>:</span>
                <span style={{
                  fontSize: "52px", fontWeight: 900, fontFamily: "'Inter', sans-serif",
                  color: homeWin ? "var(--text-primary)" : isFinal ? "var(--text-muted)" : "var(--text-primary)",
                  lineHeight: 1,
                }}>
                  {game.homeScore}
                </span>
              </div>
            ) : (
              <div style={{ padding: "16px 0" }}>
                <span style={{ fontSize: "28px", color: "var(--text-muted)", fontWeight: 700 }}>VS</span>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                  {game.startTime} 시작
                </p>
              </div>
            )}
          </div>

          {/* 홈팀 */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <TeamLogo shortName={game.homeTeam.shortName} size="lg" />
            <p style={{
              marginTop: "10px",
              fontSize: "16px", fontWeight: 700,
              color: homeWin ? "var(--text-primary)" : isFinal ? "var(--text-muted)" : "var(--text-primary)",
            }}>
              {game.homeTeam.shortName}
              <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "6px", fontWeight: 400 }}>홈</span>
            </p>
            {game.homeStanding && (
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                {game.homeStanding.rank}위 · {game.homeStanding.last10}
              </p>
            )}
          </div>
        </div>

        {/* 이닝별 점수표 */}
        {game.inningScores && showScore && (
          <div style={{ marginTop: "24px", overflowX: "auto" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse", fontSize: "12px",
              fontFamily: "'Inter', sans-serif",
            }}>
              <thead>
                <tr>
                  <th style={{ padding: "6px 8px", color: "var(--text-muted)", textAlign: "left", fontWeight: 600 }}>
                    팀
                  </th>
                  {Array.from({ length: 9 }, (_, i) => (
                    <th key={i} style={{ padding: "6px 8px", color: "var(--text-muted)", textAlign: "center", fontWeight: 600 }}>
                      {i + 1}
                    </th>
                  ))}
                  <th style={{ padding: "6px 8px", color: "var(--accent)", textAlign: "center", fontWeight: 700 }}>R</th>
                  <th style={{ padding: "6px 8px", color: "var(--text-muted)", textAlign: "center", fontWeight: 600 }}>H</th>
                  <th style={{ padding: "6px 8px", color: "var(--text-muted)", textAlign: "center", fontWeight: 600 }}>E</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: game.awayTeam.shortName, scores: game.inningScores.away, total: game.awayScore, hits: game.awayHits, errors: game.awayErrors },
                  { label: game.homeTeam.shortName, scores: game.inningScores.home, total: game.homeScore, hits: game.homeHits, errors: game.homeErrors },
                ].map((row) => (
                  <tr key={row.label} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px", fontWeight: 700, color: "var(--text-primary)" }}>{row.label}</td>
                    {Array.from({ length: 9 }, (_, i) => (
                      <td key={i} style={{ padding: "8px", textAlign: "center", color: "var(--text-secondary)" }}>
                        {row.scores[i] !== undefined ? row.scores[i] : "-"}
                      </td>
                    ))}
                    <td style={{ padding: "8px", textAlign: "center", fontWeight: 700, color: "var(--accent)" }}>{row.total}</td>
                    <td style={{ padding: "8px", textAlign: "center", color: "var(--text-secondary)" }}>{row.hits}</td>
                    <td style={{ padding: "8px", textAlign: "center", color: "var(--text-secondary)" }}>{row.errors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 마지막 업데이트 */}
        {isLive && game.lastUpdatedAt && (
          <p style={{ marginTop: "12px", fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>
            마지막 업데이트: {new Date(game.lastUpdatedAt).toLocaleTimeString("ko-KR")}
          </p>
        )}
      </div>

      {/* AI 섹션 */}
      <AiContentSection
        gameId={game.id}
        status={game.status}
        preview={game.aiPreview}
        review={game.aiReview}
      />
    </div>
  );
}
