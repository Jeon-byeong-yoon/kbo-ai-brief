import React from 'react';

/** 'WWLWL' 또는 '3승 2패' 어느 쪽으로 와도 최근 전적을 승/패 칩으로 그린다. */
export const RecentForm: React.FC<{ value: string }> = ({ value }) => {
  const letters = value?.match(/[WLD]/g);

  if (!letters?.length) {
    return <span className="text-xs text-fg2">{value || '-'}</span>;
  }

  return (
    <div className="flex justify-center gap-[3px]">
      {letters.map((ch, i) => {
        const win = ch === 'W';
        const draw = ch === 'D';
        return (
          <span
            key={`${ch}-${i}`}
            className={`flex h-[14px] w-[14px] items-center justify-center rounded-[4px] text-[9px] font-bold ${
              win ? 'bg-win-soft text-win' : 'bg-surface2 text-fg3'
            }`}
          >
            {draw ? '무' : win ? '승' : '패'}
          </span>
        );
      })}
    </div>
  );
};
