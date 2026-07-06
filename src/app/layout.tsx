import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KBO AI Brief — KBO 경기 AI 프리뷰/리뷰",
  description:
    "KBO 경기 정보를 한눈에. AI가 경기 전 관전 포인트와 경기 후 흐름을 요약해드립니다.",
  keywords: ["KBO", "야구", "AI", "경기", "프리뷰", "리뷰", "순위"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <header style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(11, 15, 26, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
        }}>
          <div className="container" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "56px",
          }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>⚾</span>
                <span style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.3px",
                }}>
                  KBO <span style={{ color: "var(--accent)" }}>AI Brief</span>
                </span>
              </div>
            </Link>
            <nav style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Link href="/" className="nav-link">
                오늘 경기
              </Link>
              <Link href="/standings" className="nav-link">
                팀 순위
              </Link>
            </nav>
          </div>
        </header>
        <main style={{ paddingTop: "24px", paddingBottom: "60px" }}>
          {children}
        </main>
        <footer style={{
          borderTop: "1px solid var(--border)",
          padding: "20px 0",
          marginTop: "40px",
        }}>
          <div className="container" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              ⚾ KBO AI Brief — 포트폴리오 프로젝트
            </span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              데이터는 실제와 다를 수 있습니다
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
