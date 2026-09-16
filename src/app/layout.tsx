import type { Metadata, Viewport } from 'next';
import './globals.css';
import { THEME_STORAGE_KEY } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'KBO AI Brief - 준실시간 KBO 야구 경기 정보 & AI 관전 포인트',
  description:
    'KBO 리그 경기 실시간 스코어, 팀 순위 및 OpenAI 기반 AI 경기 프리뷰와 리뷰 요약 서비스를 제공하는 KBO 야구 정보 웹앱입니다.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F7F9' },
    { media: '(prefers-color-scheme: dark)', color: '#0C0D0F' },
  ],
};

/**
 * 저장해 둔 테마를 첫 페인트 전에 심는다. 이게 없으면 다크를 고른 사용자에게
 * 흰 화면이 한 프레임 번쩍인다. 고른 적이 없으면 아무것도 하지 않고,
 * CSS 의 prefers-color-scheme 이 시스템 설정을 따라간다.
 */
const themeBootstrap = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-screen bg-bg font-sans text-fg antialiased">{children}</body>
    </html>
  );
}
