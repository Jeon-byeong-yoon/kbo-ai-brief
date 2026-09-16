'use client';

import React, { useState } from 'react';
import { TeamAsset, findTeam, teamLogoSrc } from '@/lib/team-assets';

interface TeamBadgeProps {
  /** 구단 코드 · 이름 · 네이버 코드 아무거나 넘겨도 된다 */
  team?: TeamAsset | string | null;
  /** 코드로 못 찾았을 때 배지에 넣을 글자 */
  fallbackLabel?: string;
  size?: number;
  radius?: number;
  className?: string;
}

/**
 * 구단 로고 이미지가 등록돼 있으면 그걸 쓰고, 없으면 구단 상징색 배지로 떨어진다.
 * public/teams/ 에 파일을 넣고 team-assets.ts 의 logo 에 이름만 적으면
 * 이 컴포넌트를 쓰는 화면 전체가 한 번에 바뀐다.
 */
export const TeamBadge: React.FC<TeamBadgeProps> = ({
  team,
  fallbackLabel,
  size = 34,
  radius = 10,
  className = '',
}) => {
  const asset = typeof team === 'string' || team == null ? findTeam(team ?? undefined) : team;
  const logo = teamLogoSrc(asset);
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogo = !!logo && !logoFailed;

  const label = asset?.mono ?? fallbackLabel?.slice(0, 3) ?? '–';
  const fontSize = label.length > 2 ? size * 0.32 : size * 0.37;

  const shared: React.CSSProperties = { width: size, height: size, borderRadius: radius };

  if (showLogo) {
    // 구단 공식 엠블럼은 자기 색과 형태를 다 갖고 있어서 배경 칩을 깔지 않는다.
    // 라이트·다크 어느 쪽 배경에서도 그대로 읽힌다.
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center ${className}`}
        style={shared}
        title={asset?.name}
      >
        {/* 엠블럼은 10개뿐이고 파일이 작아서 최적화 파이프라인을 태울 이유가 없다.
            파일이 빠졌을 때 색 배지로 되돌아가려면 onError 가 필요하다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          alt={asset?.name ?? ''}
          className="h-full w-full object-contain"
          onError={() => setLogoFailed(true)}
        />
      </span>
    );
  }

  const style = {
    ...shared,
    fontSize: `${fontSize}px`,
    '--team-fg': asset?.light[0] ?? '#5A6069',
    '--team-bg': asset?.light[1] ?? '#F1F3F5',
    '--team-fg-dark': asset?.dark[0] ?? '#C9CDD3',
    '--team-bg-dark': asset?.dark[1] ?? '#212326',
  } as React.CSSProperties;

  return (
    <span
      className={`team-badge inline-flex shrink-0 items-center justify-center overflow-hidden font-bold leading-none tracking-tight ${className}`}
      style={style}
      title={asset?.name ?? fallbackLabel}
    >
      {label}
    </span>
  );
};
