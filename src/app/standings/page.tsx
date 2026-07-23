import { prisma } from "@/lib/prisma";
import { StandingItem } from "@/types";

export const revalidate = 300; // 5분

async function getStandings(): Promise<StandingItem[]> {
  const currentYear = new Date().getFullYear();
  const standings = await prisma.standing.findMany({
    where: { season: currentYear },
    include: { team: true },
    orderBy: { rank: "asc" },
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

function Last10Badge({ value }: { value: string | null }) {
  if (!value) return <span style={{ color: "var(--text-muted)" }}>-</span>;
  const wins = parseInt(value.match(/(\d+)승/)?.[1] ?? "0");
  const color = wins >= 7 ? "var(--win-color)" : wins <= 3 ? "var(--loss-color)" : "var(--text-secondary)";
  return <span style={{ color, fontWeight: 600 }}>{value}</span>;
}

export default async function StandingsPage() {
  const standings = await getStandings();
  const currentYear = new Date().getFullYear();

  return (
    <div className="container">
      {/* 헤더 */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "4px" }}>
          {currentYear} KBO 팀 순위
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          정규시즌 기준
        </p>
      </div>

      {/* 순위표 */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["순위", "팀", "경기", "승", "패", "무", "승률", "게임차", "최근10경기"].map((h, i) => (
                  <th key={h} style={{
                    padding: "14px 16px",
                    textAlign: i <= 1 ? "left" : "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standings.map((s, idx) => {
                const isTop3 = s.rank <= 3;
                const isLast = s.rank === standings.length;
                return (
                  <tr
                    key={s.team.id}
                    className={isTop3 ? "standing-row-top3" : "standing-row"}
                    style={{
                      borderBottom: idx < standings.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    {/* 순위 */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: "26px", height: "26px",
                        borderRadius: "6px",
                        background: isTop3 ? "var(--accent-dim)" : "transparent",
                        fontSize: "13px",
                        fontWeight: 800,
                        fontFamily: "'Inter', sans-serif",
                        color: isTop3 ? "var(--accent)" : isLast ? "var(--loss-color)" : "var(--text-secondary)",
                      }}>
                        {s.rank}
                      </span>
                    </td>
                    {/* 팀 */}
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {s.team.shortName}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {s.team.name.replace(s.team.shortName, "").trim()}
                        </span>
                      </div>
                    </td>
                    {/* 경기 */}
                    <td style={{ padding: "14px 16px", textAlign: "center", color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif" }}>
                      {s.gamesPlayed}
                    </td>
                    {/* 승 */}
                    <td style={{ padding: "14px 16px", textAlign: "center", color: "var(--win-color)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                      {s.wins}
                    </td>
                    {/* 패 */}
                    <td style={{ padding: "14px 16px", textAlign: "center", color: "var(--loss-color)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                      {s.losses}
                    </td>
                    {/* 무 */}
                    <td style={{ padding: "14px 16px", textAlign: "center", color: "var(--draw-color)", fontFamily: "'Inter', sans-serif" }}>
                      {s.draws}
                    </td>
                    {/* 승률 */}
                    <td style={{ padding: "14px 16px", textAlign: "center", color: "var(--text-primary)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                      {s.winRate.toFixed(3)}
                    </td>
                    {/* 게임차 */}
                    <td style={{ padding: "14px 16px", textAlign: "center", color: "var(--text-secondary)", fontFamily: "'Inter', sans-serif" }}>
                      {s.rank === 1 ? <span style={{ color: "var(--accent)", fontWeight: 700 }}>-</span> : s.gamesBehind.toFixed(1)}
                    </td>
                    {/* 최근 10경기 */}
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <Last10Badge value={s.last10} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 범례 */}
      <div style={{
        display: "flex", gap: "20px", marginTop: "16px",
        flexWrap: "wrap", padding: "0 4px",
      }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          <span style={{ color: "var(--accent)" }}>■</span> 포스트시즌 진출권 (상위 5팀)
        </span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          승률 = 승 / (승 + 패)
        </span>
      </div>
    </div>
  );
}
