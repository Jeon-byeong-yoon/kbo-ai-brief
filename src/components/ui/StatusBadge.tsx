"use client";

import { GameStatus } from "@/types";

interface StatusBadgeProps {
  status: GameStatus;
  inning?: string | null;
}

const STATUS_CONFIG = {
  LIVE: { label: "진행중", className: "badge-live", dot: true },
  FINAL: { label: "종료", className: "badge-final", dot: false },
  SCHEDULED: { label: "경기 전", className: "badge-scheduled", dot: false },
  CANCELLED: { label: "취소", className: "badge-cancelled", dot: false },
  POSTPONED: { label: "우천순연", className: "badge-cancelled", dot: false },
};

export default function StatusBadge({ status, inning }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.SCHEDULED;

  return (
    <span className={`badge ${config.className}`}>
      {config.dot && <span className="dot" />}
      {status === "LIVE" && inning ? inning : config.label}
    </span>
  );
}
