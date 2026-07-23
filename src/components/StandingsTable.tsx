'use client';

import React from 'react';
import { KBOTeamStanding } from '../types/kbo';

interface StandingsTableProps {
  standings: KBOTeamStanding[];
  selectedTeam: string;
  onTeamSelect: (teamCode: string) => void;
  title?: string;
  subtitle?: string;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  selectedTeam,
  onTeamSelect,
  title = '2026 KBO 팀 순위',
  subtitle = '포스트시즌 1~5위',
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <h2 className="text-base font-bold text-white">{title}</h2>
        </div>
        <span className="text-xs text-slate-400">{subtitle}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800/60">
              <th className="py-2.5 px-3 text-center w-12">순위</th>
              <th className="py-2.5 px-3">팀</th>
              <th className="py-2.5 px-2 text-center">경기</th>
              <th className="py-2.5 px-2 text-center">승</th>
              <th className="py-2.5 px-2 text-center">패</th>
              <th className="py-2.5 px-2 text-center">무</th>
              <th className="py-2.5 px-2 text-center font-bold text-slate-300">승률</th>
              <th className="py-2.5 px-2 text-center">차</th>
              <th className="py-2.5 px-3 text-center hidden sm:table-cell">최근 10경기</th>
              <th className="py-2.5 px-3 text-center">연속/비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-slate-300">
            {standings.map((row) => {
              const isSelected = selectedTeam === row.team.code;
              const isPlayoffs = row.rank <= 5;
              const isWinStreak = row.streak.includes('승') || row.streak.includes('V12');

              return (
                <tr
                  key={row.team.id}
                  onClick={() => onTeamSelect(row.team.code)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-rose-500/10 hover:bg-rose-500/15'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Rank & Change */}
                  <td className="py-3 px-3 text-center font-bold">
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-md ${
                          row.rank === 1
                            ? 'bg-amber-500/20 text-amber-300 font-black border border-amber-500/40'
                            : isPlayoffs
                            ? 'bg-slate-800 text-slate-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {row.rank}
                      </span>
                      {row.rankChange !== undefined && (
                        <span className="text-[10px] font-medium shrink-0">
                          {row.rankChange > 0 && (
                            <span className="text-rose-400">▲{row.rankChange}</span>
                          )}
                          {row.rankChange < 0 && (
                            <span className="text-indigo-400">▼{Math.abs(row.rankChange)}</span>
                          )}
                          {row.rankChange === 0 && (
                            <span className="text-slate-600">-</span>
                          )}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Team Name */}
                  <td className="py-3 px-3 font-semibold">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black border ${row.team.logoBg}`}
                      >
                        {row.team.shortName[0]}
                      </span>
                      <span className={isSelected ? 'text-rose-300 font-bold' : 'text-slate-100'}>
                        {row.team.name}
                      </span>
                    </div>
                  </td>

                  {/* Games, Wins, Losses, Draws */}
                  <td className="py-3 px-2 text-center text-slate-400">{row.gamesPlayed}</td>
                  <td className="py-3 px-2 text-center text-slate-200 font-semibold">{row.wins}</td>
                  <td className="py-3 px-2 text-center text-slate-400">{row.losses}</td>
                  <td className="py-3 px-2 text-center text-slate-500">{row.draws}</td>

                  {/* Win Rate */}
                  <td className="py-3 px-2 text-center font-bold text-amber-400">
                    {row.winRate.toFixed(3).replace(/^0/, '')}
                  </td>

                  {/* Games Behind */}
                  <td className="py-3 px-2 text-center text-slate-400 font-mono">
                    {row.gameBehind === 0 ? '-' : row.gameBehind.toFixed(1)}
                  </td>

                  {/* Recent 10 */}
                  <td className="py-3 px-3 text-center text-slate-400 hidden sm:table-cell">
                    {row.recent10}
                  </td>

                  {/* Streak */}
                  <td className="py-3 px-3 text-center font-medium">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] ${
                        isWinStreak
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {row.streak}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
