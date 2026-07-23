"use client";

import Link from "next/link";
import { GameListItem } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import TeamLogo from "@/components/ui/TeamLogo";

interface GameCardProps {
  game: GameListItem;
}

function formatLastUpdated(iso: string | null): string {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}초 전 업데이트`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전 업데이트`;
  return `${Math.floor(diff / 3600)}시간 전 업데이트`;
}

export default function GameCard({ game }: GameCardProps) {
  const isLive = game.status === "LIVE";
  const isFinal = game.status === "FINAL";
  const isScheduled = game.status === "SCHEDULED";
  const showScore = isLive || isFinal;

  return (
    <Link href={`/games/${game.id}`} className="card-link">
      <div className="card" style={{
        padding: "18px 20px",
        marginBottom: "12px",
        borderLeft: isLive ? "3px solid var(--status-live)" : isFinal ? "3px solid var(--border-light)" : "3px solid var(--status-scheduled)",
      }}>
        {/* 상단: 상태 배지 + 시간 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "14px",
        }}>
          <StatusBadge status={game.status} inning={game.currentInning} />
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {game.startTime} · {game.stadium}
            </span>
          </div>
        </div>

        {/* 중단: 팀 대결 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* 원정팀 */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: 1,
          }}>
            <TeamLogo shortName={game.awayTeam.shortName} />
            <span style={{
              fontWeight: 700,
              fontSize: "15px",
              color: isFinal && game.awayScore < game.homeScore ? "var(--text-muted)" : "var(--text-primary)",
            }}>
              {game.awayTeam.shortName}
            </span>
          </div>

          {/* 스코어 / VS */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 16px",
          }}>
            {showScore ? (
              <>
                <span style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  fontFamily: "'Inter', sans-serif",
                  color: isFinal && game.awayScore < game.homeScore ? "var(--text-muted)" : "var(--text-primary)",
                }}>
                  {game.awayScore}
                </span>
                <span style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}>:</span>
                <span style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  fontFamily: "'Inter', sans-serif",
                  color: isFinal && game.homeScore < game.awayScore ? "var(--text-muted)" : "var(--text-primary)",
                }}>
                  {game.homeScore}
                </span>
              </>
            ) : (
              <span style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-muted)",
              }}>VS</span>
            )}
          </div>

          {/* 홈팀 */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: 1,
            justifyContent: "flex-end",
          }}>
            <span style={{
              fontWeight: 700,
              fontSize: "15px",
              color: isFinal && game.homeScore < game.awayScore ? "var(--text-muted)" : "var(--text-primary)",
            }}>
              {game.homeTeam.shortName}
            </span>
            <TeamLogo shortName={game.homeTeam.shortName} />
          </div>
        </div>

        {/* 하단: 업데이트 시간 + 버튼 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border)",
        }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {isLive && game.lastUpdatedAt
              ? formatLastUpdated(game.lastUpdatedAt)
              : isScheduled
              ? "경기 시작 전"
              : "최종 결과"}
          </span>
          <span style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--accent)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            {isFinal && game.hasAiReview
              ? "AI 리뷰 보기 →"
              : !isFinal && game.hasAiPreview
              ? "AI 프리뷰 보기 →"
              : "경기 상세 →"}
          </span>
        </div>
      </div>
    </Link>
  );
}
