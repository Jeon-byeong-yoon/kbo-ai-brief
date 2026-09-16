/**
 * 서버 컴포넌트(app/layout.tsx)와 클라이언트 컴포넌트(ThemeToggle)가 같이 쓰는 값이라
 * 'use client' 가 붙지 않은 별도 모듈에 둔다. 'use client' 모듈에서 서버 쪽으로
 * 값을 import 하면 상수가 아니라 클라이언트 참조로 넘어가서 undefined 가 된다.
 */
export const THEME_STORAGE_KEY = 'kbo-theme';

export type Theme = 'light' | 'dark';
