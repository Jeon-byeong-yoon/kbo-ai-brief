'use client';

import React, { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from './ui/Icons';
import { THEME_STORAGE_KEY, type Theme } from '@/lib/theme';

/**
 * 고른 값은 localStorage 에 남기고, 고른 적이 없으면 시스템 설정을 따른다.
 * 첫 페인트 전에 data-theme 를 심는 스크립트는 app/layout.tsx 의 <head> 에 있다.
 */
function readResolvedTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  const explicit = document.documentElement.dataset.theme;
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeToggle: React.FC = () => {
  // 서버는 사용자의 선택을 알 수 없다. 마운트 전에는 어느 쪽도 활성으로 그리지 않아
  // 하이드레이션 불일치를 피한다.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(readResolvedTheme());

    // 시스템 설정을 따르는 동안에는 OS 쪽 변경도 즉시 반영한다.
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!document.documentElement.dataset.theme) setTheme(media.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const apply = (next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // 프라이빗 모드 등에서 저장이 막혀도 이번 세션 전환은 되게 둔다.
    }
    setTheme(next);
  };

  const button = (value: Theme, label: string, icon: React.ReactNode) => {
    const active = theme === value;
    return (
      <button
        type="button"
        onClick={() => apply(value)}
        aria-label={label}
        aria-pressed={active}
        className={`flex h-7 w-8 items-center justify-center rounded-chip transition-colors ${
          active ? 'bg-thumb text-fg shadow-thumb' : 'text-fg3 hover:text-fg2'
        }`}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className="flex gap-0.5 rounded-control bg-track p-[3px]" role="group" aria-label="화면 테마">
      {button('light', '라이트 모드', <SunIcon />)}
      {button('dark', '다크 모드', <MoonIcon />)}
    </div>
  );
};
