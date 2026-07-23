"use client";

import { useState } from "react";
import { AiPreviewContent, AiReviewContent, GameStatus } from "@/types";

interface AiContentProps {
  gameId: number;
  status: GameStatus;
  preview: { content: string; modelName: string; generatedAt: string } | null;
  review: { content: string; modelName: string; generatedAt: string } | null;
  onPreviewGenerated?: (preview: { content: string; modelName: string; generatedAt: string }) => void;
  onReviewGenerated?: (review: { content: string; modelName: string; generatedAt: string }) => void;
}

export default function AiContentSection({
  gameId, status, preview, review,
  onPreviewGenerated, onReviewGenerated,
}: AiContentProps) {
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = async () => {
    setLoadingPreview(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/${gameId}/ai-preview`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onPreviewGenerated?.(data.preview);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "생성 실패");
    } finally {
      setLoadingPreview(false);
    }
  };

  const generateReview = async () => {
    setLoadingReview(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/${gameId}/ai-review`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onReviewGenerated?.(data.review);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "생성 실패");
    } finally {
      setLoadingReview(false);
    }
  };

  const isFinal = status === "FINAL";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {error && (
        <div style={{
          padding: "10px 14px",
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "var(--radius-sm)",
          fontSize: "13px",
          color: "#EF4444",
        }}>
          {error}
        </div>
      )}

      {/* AI 프리뷰 섹션 */}
      {!isFinal && (
        <div className="ai-section">
          <div className="ai-section-title">
            <span>🤖</span>
            <span>AI 경기 프리뷰</span>
            {preview && (
              <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>
                {preview.modelName}
              </span>
            )}
          </div>

          {preview ? (
            <PreviewContent content={preview.content} />
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                경기 시작 전, AI가 관전 포인트를 요약해드립니다.
              </p>
              <button
                className="btn btn-primary"
                onClick={generatePreview}
                disabled={loadingPreview}
              >
                {loadingPreview ? (
                  <>
                    <span style={{ width: 14, height: 14, border: "2px solid #0B0F1A", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    AI 분석 중...
                  </>
                ) : "✨ AI 프리뷰 생성하기"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI 리뷰 섹션 */}
      {isFinal && (
        <div className="ai-section">
          <div className="ai-section-title">
            <span>📊</span>
            <span>AI 경기 리뷰</span>
            {review && (
              <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>
                {review.modelName}
              </span>
            )}
          </div>

          {review ? (
            <ReviewContent content={review.content} />
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                경기가 종료되었습니다. AI가 경기 흐름과 승부처를 요약해드립니다.
              </p>
              <button
                className="btn btn-primary"
                onClick={generateReview}
                disabled={loadingReview}
              >
                {loadingReview ? (
                  <>
                    <span style={{ width: 14, height: 14, border: "2px solid #0B0F1A", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    AI 분석 중...
                  </>
                ) : "📊 AI 리뷰 생성하기"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PreviewContent({ content }: { content: string }) {
  let parsed: AiPreviewContent;
  try {
    parsed = JSON.parse(content);
  } catch {
    return <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{content}</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{
        padding: "12px 14px",
        background: "rgba(245,158,11,0.06)",
        borderRadius: "var(--radius-sm)",
        fontSize: "14px",
        color: "var(--text-primary)",
        lineHeight: 1.7,
        fontWeight: 500,
      }}>
        {parsed.summary}
      </div>

      <div>
        <p className="section-title">👀 관전 포인트</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {parsed.watchPoints?.map((point, i) => (
            <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <span style={{
                width: "20px", height: "20px",
                background: "var(--accent-dim)",
                color: "var(--accent)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700, flexShrink: 0, marginTop: "1px",
              }}>{i + 1}</span>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{point}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="section-title">⚡ 변수</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {parsed.variables?.map((v, i) => (
            <div key={i} style={{
              padding: "8px 12px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "var(--radius-sm)",
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              borderLeft: "2px solid var(--border-light)",
            }}>
              {v}
            </div>
          ))}
        </div>
      </div>

      {parsed.watchPlayer && (
        <div style={{
          padding: "10px 14px",
          background: "rgba(245,158,11,0.04)",
          borderRadius: "var(--radius-sm)",
          fontSize: "13px",
          color: "var(--accent)",
          lineHeight: 1.6,
          fontStyle: "italic",
        }}>
          💡 {parsed.watchPlayer}
        </div>
      )}
    </div>
  );
}

function ReviewContent({ content }: { content: string }) {
  let parsed: AiReviewContent;
  try {
    parsed = JSON.parse(content);
  } catch {
    return <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7 }}>{content}</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{
        padding: "12px 14px",
        background: "rgba(245,158,11,0.06)",
        borderRadius: "var(--radius-sm)",
        fontSize: "14px",
        color: "var(--text-primary)",
        lineHeight: 1.7,
        fontWeight: 500,
      }}>
        {parsed.summary}
      </div>

      {parsed.keyMoment && (
        <div>
          <p className="section-title">⚔️ 승부처</p>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, padding: "8px 0" }}>
            {parsed.keyMoment}
          </p>
        </div>
      )}

      {parsed.impressivePlayer && (
        <div>
          <p className="section-title">🌟 인상적인 활약</p>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, padding: "8px 0" }}>
            {parsed.impressivePlayer}
          </p>
        </div>
      )}

      {parsed.gameFlow && (
        <div>
          <p className="section-title">📈 경기 흐름</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{
              padding: "8px 12px",
              background: "rgba(34,197,94,0.06)",
              borderRadius: "var(--radius-sm)",
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              borderLeft: "2px solid var(--win-color)",
            }}>
              {parsed.gameFlow.winner}
            </div>
            <div style={{
              padding: "8px 12px",
              background: "rgba(239,68,68,0.04)",
              borderRadius: "var(--radius-sm)",
              fontSize: "13px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              borderLeft: "2px solid rgba(239,68,68,0.4)",
            }}>
              {parsed.gameFlow.loser}
            </div>
          </div>
        </div>
      )}

      {parsed.nextWatch && (
        <div style={{
          padding: "10px 14px",
          background: "rgba(245,158,11,0.04)",
          borderRadius: "var(--radius-sm)",
          fontSize: "13px",
          color: "var(--accent)",
          lineHeight: 1.6,
          fontStyle: "italic",
        }}>
          🔭 {parsed.nextWatch}
        </div>
      )}
    </div>
  );
}
