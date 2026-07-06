import { prisma } from "@/lib/prisma";
import GameCard from "@/components/game/GameCard";
import Link from "next/link";
import { GameListItem, StandingItem } from "@/types";

export const revalidate = 60; // 1분마다 재검증

async function getTodayGames(): Promise<GameListItem[]> {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const games = await prisma.game.findMany({
    where: { gameDate: { gte: startOfDay, lte: endOfDay } },
    include: {
      homeTeam: true,
      awayTeam: true,
      aiPreview: { select: { id: true } },
      aiReview: { select: { id: true } },
    },
    orderBy: [{ startTime: "asc" }, { id: "asc" }],
  });

  return games.map((g) => ({
    id: g.id,
    gameDate: g.gameDate.toISOString().split("T")[0],
    startTime: g.startTime,
    stadium: g.stadium,
    homeTeam: { id: g.homeTeam.id, name: g.homeTeam.name, shortName: g.homeTeam.shortName, logoUrl: g.homeTeam.logoUrl },
    awayTeam: { id: g.awayTeam.id, name: g.awayTeam.name, shortName: g.awayTeam.shortName, logoUrl: g.awayTeam.logoUrl },
    status: g.status as GameListItem["status"],
    currentInning: g.currentInning,
    homeScore: g.homeScore,
    awayScore: g.awayScore,
    lastUpdatedAt: g.lastUpdatedAt?.toISOString() ?? null,
    hasAiPreview: !!g.aiPreview,
    hasAiReview: !!g.aiReview,
  }));
}

async function getTopStandings(): Promise<StandingItem[]> {
  const currentYear = new Date().getFullYear();
  const standings = await prisma.standing.findMany({
    where: { season: currentYear },
    include: { team: true },
    orderBy: { rank: "asc" },
    take: 5,
  });

  return standings.map((s) => ({
    rank: s.rank,
    team: { id: s.team.id, name: s.team.name, shortName: s.team.shortName, logoUrl: s.team.logoUrl },
    gamesPlayed: s.gamesPlayed,
    wins: s.wins,
    losses: s.losses,
    draws: s.draws,
    winRate: s.winRate,
    gamesBehind: s.gamesBehind,
    last10: s.last10,
  }));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export default async function HomePage() {
  const [games, standings] = await Promise.all([getTodayGames(), getTopStandings()]);

  const liveGames = games.filter((g) => g.status === "LIVE");
  const scheduledGames = games.filter((g) => g.status === "SCHEDULED");
  const finalGames = games.filter((g) => g.status === "FINAL");

  return (
    <div className="container">
      {/* 날짜 헤더 */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{
          fontSize: "22px",
          fontWeight: 800,
          color: "var(--text-primary)",
          marginBottom: "4px",
        }}>
          오늘의 KBO 경기
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {formatDate(new Date())}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
        {/* 왼쪽: 경기 목록 */}
        <div>
          {games.length === 0 ? (
            <div className="card" style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>😴</p>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                오늘은 경기가 없습니다
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                내일 경기를 기대해주세요!
              </p>
            </div>
          ) : (
            <>
              {/* 진행중 경기 */}
              {liveGames.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <div className="section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: "var(--status-live)",
                      display: "inline-block",
                      animation: "pulse-live 1.5s ease-in-out infinite",
                    }} />
                    진행 중 ({liveGames.length})
                  </div>
                  {liveGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              )}

              {/* 예정 경기 */}
              {scheduledGames.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <p className="section-title">예정 ({scheduledGames.length})</p>
                  {scheduledGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              )}

              {/* 종료 경기 */}
              {finalGames.length > 0 && (
                <div>
                  <p className="section-title">종료 ({finalGames.length})</p>
                  {finalGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 팀 순위 미리보기 */}
        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}>
            <p className="section-title" style={{ margin: 0 }}>팀 순위 TOP 5</p>
            <Link href="/standings" style={{
              fontSize: "12px",
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 600,
            }}>
              전체 보기 →
            </Link>
          </div>

          <div className="card" style={{ padding: "4px 0" }}>
            {standings.map((s, idx) => (
              <div key={s.team.id} style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 16px",
                borderBottom: idx < standings.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <span style={{
                  width: "24px",
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: "'Inter', sans-serif",
                  color: s.rank <= 3 ? "var(--accent)" : "var(--text-muted)",
                  flexShrink: 0,
                }}>
                  {s.rank}
                </span>
                <span style={{
                  flex: 1,
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginLeft: "8px",
                }}>
                  {s.team.shortName}
                </span>
                <span style={{
                  fontSize: "12px",
                  fontFamily: "'Inter', sans-serif",
                  color: "var(--text-secondary)",
                  marginRight: "12px",
                }}>
                  {s.winRate.toFixed(3)}
                </span>
                <span style={{
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  fontFamily: "'Inter', sans-serif",
                }}>
                  {s.last10}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
