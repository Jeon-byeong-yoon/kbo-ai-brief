import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KBO AI Brief - 준실시간 KBO 야구 경기 정보 & AI 관전 포인트',
  description: 'KBO 리그 경기 실시간 스코어, 팀 순위 및 OpenAI 기반 AI 경기 프리뷰와 리뷰 요약 서비스를 제공하는 KBO 야구 정보 웹앱입니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-rose-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
