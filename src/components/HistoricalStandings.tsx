'use client';

import React from 'react';
import { HistoricalSeason } from '../types/kbo';

interface HistoricalStandingsProps {
  season: HistoricalSeason;
  selectedTeam: string;
  onTeamSelect: (teamCode: string) => void;
}

export const HistoricalStandings: React.FC<HistoricalStandingsProps> = ({
  season,
  selectedTeam,
  onTeamSelect,
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <h2 className="text-base font-bold text-white">{season.year}년 전년도 KBO 성적 복기</h2>
        </div>
        <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
          👑 우승팀: {season.champion}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800/60">
              <th className="py-2.5 px-3 text-center w-12">최종 순위</th>
              <th className="py-2.5 px-3">팀명</th>
              <th className="py-2.5 px-2 text-center">경기</th>
              <th className="py-2.5 px-2 text-center">승</th>
              <th className="py-2.5 px-2 text-center">패</th>
              <th className="py-2.5 px-2 text-center">무</th>
              <th className="py-2.5 px-2 text-center font-bold text-slate-300">승률</th>
              <th className="py-2.5 px-3 text-center">포스트시즌 결과</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40 text-slate-300">
            {season.teams.map((row) => {
              const isSelected = selectedTeam === row.code;
              const isChampion = row.rank === 1;

              return (
                <tr
                  key={row.code}
                  onClick={() => onTeamSelect(row.code)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-rose-500/10 hover:bg-rose-500/15'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <td className="py-3 px-3 text-center font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-md ${
                        isChampion
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                          : row.rank <= 5
                          ? 'bg-slate-800 text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {row.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold">
                    <span className={isSelected ? 'text-rose-300 font-bold' : 'text-slate-100'}>
                      {row.name}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center text-slate-400">{row.gamesPlayed}</td>
                  <td className="py-3 px-2 text-center text-slate-200 font-semibold">{row.wins}</td>
                  <td className="py-3 px-2 text-center text-slate-400">{row.losses}</td>
                  <td className="py-3 px-2 text-center text-slate-500">{row.draws}</td>
                  <td className="py-3 px-2 text-center font-bold text-amber-400">
                    {row.winRate.toFixed(3).replace(/^0/, '')}
                  </td>
                  <td className="py-3 px-3 text-center font-medium">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        isChampion
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                          : row.rank <= 5
                          ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                          : 'text-slate-500'
                      }`}
                    >
                      {row.postseasonResult}
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
