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
  const [visibleCounts, setVisibleCounts] = useState({ PITCHER: 5, BATTER: 5 });
  const visibleCount = visibleCounts[activeCategory];
  const nextCount = visibleCount < 10 ? 10 : visibleCount < 20 ? 20 : 50;
  const activePlayers = activeCategory === 'PITCHER' ? pitcherLeaders : batterLeaders;
  const canExpand = visibleCount < Math.min(50, activePlayers.length);

  const showMore = () => {
    setVisibleCounts((current) => ({
      ...current,
      [activeCategory]: Math.min(nextCount, activePlayers.length, 50),
    }));
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800/80 overflow-hidden shadow-lg">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <div>
            <h2 className="text-base font-bold text-white">2026 KBO 실시간 선수 랭킹</h2>
            <p className="mt-0.5 text-[10px] font-semibold text-emerald-400">
              7월 23일 경기 결과 반영 · 네이버 스포츠 기준
            </p>
          </div>
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
            투수 Top {visibleCounts.PITCHER} (ERA/WAR)
          </button>
          <button
            onClick={() => setActiveCategory('BATTER')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'BATTER'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            타자 Top {visibleCounts.BATTER} (OPS/홈런)
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
                {pitcherLeaders.slice(0, visibleCounts.PITCHER).map((p) => (
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
                {batterLeaders.slice(0, visibleCounts.BATTER).map((b) => (
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
        {canExpand && (
          <button
            type="button"
            onClick={showMore}
            className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950/60 py-2.5 text-xs font-black text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            Top {nextCount} 더보기 <span aria-hidden="true">▼</span>
          </button>
        )}
      </div>
    </div>
  );
};
