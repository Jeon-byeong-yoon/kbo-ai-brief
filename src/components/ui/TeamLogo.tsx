"use client";

interface TeamLogoProps {
  shortName: string;
  size?: "sm" | "md" | "lg";
}

const TEAM_CLASSES: Record<string, string> = {
  LG: "team-lg",
  두산: "team-두산",
  KT: "team-kt",
  SSG: "team-ssg",
  NC: "team-nc",
  키움: "team-키움",
  한화: "team-한화",
  롯데: "team-롯데",
  삼성: "team-삼성",
  KIA: "team-kia",
};

export default function TeamLogo({ shortName, size = "md" }: TeamLogoProps) {
  const cls = TEAM_CLASSES[shortName] ?? "team-lg";
  const sizeCls = size === "lg" ? "team-badge team-badge-lg" : "team-badge";

  return (
    <span className={`${sizeCls} ${cls}`}>
      {shortName}
    </span>
  );
}
