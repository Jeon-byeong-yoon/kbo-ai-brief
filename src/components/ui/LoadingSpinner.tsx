"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export default function LoadingSpinner({
  size = "md",
  color = "var(--accent)",
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { width: 16, height: 16, border: "2px" },
    md: { width: 32, height: 32, border: "3px" },
    lg: { width: 48, height: 48, border: "4px" },
  };

  const currentSize = sizeMap[size];

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 0" }}>
      <div
        style={{
          width: currentSize.width,
          height: currentSize.height,
          border: `${currentSize.border} solid rgba(255, 255, 255, 0.1)`,
          borderTopColor: color,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}
