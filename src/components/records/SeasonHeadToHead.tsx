'use client';

import React from 'react';
import { HeadToHead } from '@/types/head-to-head';
import { TeamBadge } from '@/components/ui/TeamBadge';

export const SeasonHeadToHead: React.FC<{ data: HeadToHead }> = ({ data }) => {
  const { teamCodes, rows } = data;

  return (
    <div className="flex flex-col gap-3">
      <div className="custom-scrollbar -mx-1 overflow-x-auto px-1">
        <table className="w-full border-collapse" style={{ minWidth: 60 + teamCodes.length * 58 + 200 }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-surface pb-2.5 text-left text-2xs font-semibold text-fg3">
                팀
              </th>
              {teamCodes.map((code) => (
                <th key={code} className="pb-2.5">
                  <div className="flex justify-center">
                    <TeamBadge team={code} size={24} radius={7} />
                  </div>
                </th>
              ))}
              <th className="whitespace-nowrap pb-2.5 pl-3 text-right text-2xs font-semibold text-fg3">
                합계
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.teamCode} className="transition-colors hover:bg-surface2">
                <td className="sticky left-0 z-10 border-t border-hair bg-surface py-2.5 pr-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="tnum w-4 text-2xs font-bold text-fg3">{row.rank}</span>
                    <TeamBadge team={row.teamCode} fallbackLabel={row.shortName} size={22} radius={7} />
                    <span className="truncate text-[12.5px] font-semibold tracking-[-0.025em] text-fg">
                      {row.shortName}
                    </span>
                  </div>
                </td>

                {teamCodes.map((code) => {
                  if (code === row.teamCode) {
                    return (
                      <td key={code} className="border-t border-hair bg-surface2/60 py-2.5 text-center text-fg3">
                        ·
                      </td>
                    );
                  }
                  const cell = row.vs[code];
                  const tone =
                    cell.wins > cell.losses ? 'text-win' : cell.wins < cell.losses ? 'text-lose' : 'text-fg2';
                  return (
                    <td key={code} className="border-t border-hair py-2.5 text-center">
                      <span className={`tnum text-[12.5px] font-semibold ${tone}`}>
                        {cell.wins}-{cell.losses}
                      </span>
                      {cell.draws > 0 && <span className="tnum text-2xs text-fg3">-{cell.draws}</span>}
                    </td>
                  );
                })}

                <td className="tnum whitespace-nowrap border-t border-hair py-2.5 pl-3 text-right text-[12.5px] font-bold text-fg">
                  {row.total.wins}승 {row.total.losses}패
                  {row.total.draws > 0 ? ` ${row.total.draws}무` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-2xs leading-relaxed text-fg3">
        정규시즌 {data.from} ~ {data.to} · {data.games}경기 기준. 셀은 가로줄 팀이 세로줄 팀을 상대로 거둔
        승-패이며, 무승부가 있으면 뒤에 붙습니다. 일정 API 가 시범경기·포스트시즌을 구분해 주지 않아
        팀별 합계가 공식 기록과 정확히 일치하는 구간을 찾아 집계합니다.
      </p>
    </div>
  );
};
