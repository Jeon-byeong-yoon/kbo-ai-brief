'use client';

import React, { useState } from 'react';
import { PitcherLeader, BatterLeader } from '../types/kbo';

interface PlayerLeaderboardProps {
  pitcherLeaders: PitcherLeader[];
  batterLeaders: BatterLeader[];
}

export const PlayerLeaderboard: React.FC<PlayerLeaderboardProps> = ({
  pitcherLeaders,
  batterLeaders,
}) => {
  const [activeCategory, setActiveCategory] = useState<'PITCHER' | 'BATTER'>('PITCHER');

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <h2 className="text-base font-bold text-white">2026 KBO 주요 세부 지표 랭킹</h2>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveCategory('PITCHER')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'PITCHER'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            투수 Top 5 (ERA/WAR)
          </button>
          <button
            onClick={() => setActiveCategory('BATTER')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'BATTER'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            타자 Top 5 (OPS/홈런)
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeCategory === 'PITCHER' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-800/60 pb-2">
                  <th className="py-2 text-center w-10">순위</th>
                  <th className="py-2">선수 (팀)</th>
                  <th className="py-2 text-center">ERA</th>
                  <th className="py-2 text-center">승/패/세</th>
                  <th className="py-2 text-center">WHIP</th>
                  <th className="py-2 text-center">삼진</th>
                  <th className="py-2 text-center font-bold text-amber-400">WAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {pitcherLeaders.map((p) => (
                  <tr key={p.rank} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 text-center font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-md ${
                          p.rank === 1
                            ? 'bg-amber-500/20 text-amber-300 font-black border border-amber-500/40'
                            : 'text-slate-400'
                        }`}
                      >
                        {p.rank}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold">
                      <span className="text-slate-100">{p.name}</span>
                      <span className="text-slate-500 text-[11px] font-normal ml-1">({p.team})</span>
                    </td>
                    <td className="py-2.5 text-center font-black text-rose-400">{p.era.toFixed(2)}</td>
                    <td className="py-2.5 text-center text-slate-300">
                      {p.wins}승 {p.losses}패 {p.saves}세
                    </td>
                    <td className="py-2.5 text-center text-slate-400">{p.whip.toFixed(2)}</td>
                    <td className="py-2.5 text-center text-slate-300">{p.strikeouts}</td>
                    <td className="py-2.5 text-center font-bold text-amber-400">{p.war.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-800/60 pb-2">
                  <th className="py-2 text-center w-10">순위</th>
                  <th className="py-2">선수 (팀)</th>
                  <th className="py-2 text-center">타율</th>
                  <th className="py-2 text-center">홈런</th>
                  <th className="py-2 text-center">타점</th>
                  <th className="py-2 text-center">OPS</th>
                  <th className="py-2 text-center font-bold text-amber-400">WAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {batterLeaders.map((b) => (
                  <tr key={b.rank} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 text-center font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-md ${
                          b.rank === 1
                            ? 'bg-amber-500/20 text-amber-300 font-black border border-amber-500/40'
                            : 'text-slate-400'
                        }`}
                      >
                        {b.rank}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold">
                      <span className="text-slate-100">{b.name}</span>
                      <span className="text-slate-500 text-[11px] font-normal ml-1">({b.team})</span>
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-200">
                      {b.avg.toFixed(3).replace(/^0/, '')}
                    </td>
                    <td className="py-2.5 text-center font-black text-rose-400">{b.homeRuns}개</td>
                    <td className="py-2.5 text-center text-slate-300">{b.rbi}타점</td>
                    <td className="py-2.5 text-center font-bold text-indigo-400">{b.ops.toFixed(3)}</td>
                    <td className="py-2.5 text-center font-bold text-amber-400">{b.war.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
