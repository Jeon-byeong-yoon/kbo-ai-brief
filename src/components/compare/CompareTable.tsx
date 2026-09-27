'use client';

import React from 'react';
import { PlayerCareer } from '@/types/player-career';

/** 한 줄의 비교 항목. `better` 는 어느 쪽 값이 좋은지 판단하는 방향이다. */
interface Row {
  label: string;
  a: number | null;
  b: number | null;
  format: (v: number) => string;
  better: 'high' | 'low' | 'none';
  /** 이 지표가 무엇인지 한 줄 설명 */
  note?: string;
}

const int = (v: number) => Math.round(v).toLocaleString();
const two = (v: number) => v.toFixed(2);
const rate = (v: number) => v.toFixed(3).replace(/^0/, '');
const plus = (v: number) => v.toFixed(0);

export function pitchingRows(a: PlayerCareer, b: PlayerCareer): Row[] {
  const x = a.pitchingTotal;
  const y = b.pitchingTotal;
  const g = <K extends keyof NonNullable<typeof x>>(t: typeof x, k: K) =>
    t ? (t[k] as number | null) : null;
  return [
    { label: '시즌', a: a.pitching.length, b: b.pitching.length, format: int, better: 'none' },
    { label: '경기', a: g(x, 'games'), b: g(y, 'games'), format: int, better: 'none' },
    { label: '이닝', a: x ? x.outs / 3 : null, b: y ? y.outs / 3 : null, format: (v) => v.toFixed(1), better: 'high' },
    { label: '승', a: g(x, 'wins'), b: g(y, 'wins'), format: int, better: 'high' },
    { label: '패', a: g(x, 'losses'), b: g(y, 'losses'), format: int, better: 'low' },
    { label: '세이브', a: g(x, 'saves'), b: g(y, 'saves'), format: int, better: 'high' },
    { label: '탈삼진', a: g(x, 'strikeouts'), b: g(y, 'strikeouts'), format: int, better: 'high' },
    { label: '볼넷', a: g(x, 'walks'), b: g(y, 'walks'), format: int, better: 'low' },
    { label: 'ERA', a: g(x, 'era'), b: g(y, 'era'), format: two, better: 'low' },
    { label: 'WHIP', a: g(x, 'whip'), b: g(y, 'whip'), format: two, better: 'low' },
    {
      label: 'ERA+',
      a: g(x, 'eraPlus'),
      b: g(y, 'eraPlus'),
      format: plus,
      better: 'high',
      note: '뛴 시즌의 리그 평균자책으로 보정한 값. 100 이 평균',
    },
    {
      label: 'K/9',
      a: x && x.outs > 0 ? (x.strikeouts * 9) / (x.outs / 3) : null,
      b: y && y.outs > 0 ? (y.strikeouts * 9) / (y.outs / 3) : null,
      format: two,
      better: 'high',
    },
    { label: 'WAR', a: g(x, 'war'), b: g(y, 'war'), format: two, better: 'high' },
  ];
}

export function battingRows(a: PlayerCareer, b: PlayerCareer): Row[] {
  const x = a.battingTotal;
  const y = b.battingTotal;
  const g = <K extends keyof NonNullable<typeof x>>(t: typeof x, k: K) =>
    t ? (t[k] as number | null) : null;
  return [
    { label: '시즌', a: a.batting.length, b: b.batting.length, format: int, better: 'none' },
    { label: '경기', a: g(x, 'games'), b: g(y, 'games'), format: int, better: 'none' },
    { label: '타수', a: g(x, 'atBats'), b: g(y, 'atBats'), format: int, better: 'high' },
    { label: '안타', a: g(x, 'hits'), b: g(y, 'hits'), format: int, better: 'high' },
    { label: '홈런', a: g(x, 'homeRuns'), b: g(y, 'homeRuns'), format: int, better: 'high' },
    { label: '타점', a: g(x, 'rbi'), b: g(y, 'rbi'), format: int, better: 'high' },
    { label: '득점', a: g(x, 'runs'), b: g(y, 'runs'), format: int, better: 'high' },
    { label: '도루', a: g(x, 'steals'), b: g(y, 'steals'), format: int, better: 'high' },
    { label: '볼넷', a: g(x, 'walks'), b: g(y, 'walks'), format: int, better: 'high' },
    { label: '삼진', a: g(x, 'strikeouts'), b: g(y, 'strikeouts'), format: int, better: 'low' },
    { label: '타율', a: g(x, 'avg'), b: g(y, 'avg'), format: rate, better: 'high' },
    { label: '출루율', a: g(x, 'obp'), b: g(y, 'obp'), format: rate, better: 'high' },
    { label: '장타율', a: g(x, 'slg'), b: g(y, 'slg'), format: rate, better: 'high' },
    { label: 'OPS', a: g(x, 'ops'), b: g(y, 'ops'), format: rate, better: 'high' },
    {
      label: 'OPS+',
      a: g(x, 'opsPlus'),
      b: g(y, 'opsPlus'),
      format: plus,
      better: 'high',
      note: '뛴 시즌의 리그 출루율·장타율로 보정한 값. 100 이 평균',
    },
    { label: 'WAR', a: g(x, 'war'), b: g(y, 'war'), format: two, better: 'high' },
  ];
}

const Side: React.FC<{ value: number | null; format: (v: number) => string; lead: boolean }> = ({
  value,
  format,
  lead,
}) => (
  <span className={`tnum text-[14px] ${lead ? 'font-bold text-fg' : 'font-medium text-fg2'}`}>
    {value === null ? '—' : format(value)}
  </span>
);

export const CompareTable: React.FC<{ rows: Row[] }> = ({ rows }) => (
  <div className="flex flex-col">
    {rows.map((r) => {
      const both = r.a !== null && r.b !== null;
      const aLead = both && r.better !== 'none' && (r.better === 'high' ? r.a! > r.b! : r.a! < r.b!);
      const bLead = both && r.better !== 'none' && (r.better === 'high' ? r.b! > r.a! : r.b! < r.a!);
      // 두 값의 비율만큼 막대를 나눈다. 낮을수록 좋은 지표는 뒤집는다.
      const va = r.a ?? 0;
      const vb = r.b ?? 0;
      const wa = r.better === 'low' ? vb : va;
      const wb = r.better === 'low' ? va : vb;
      const share = wa + wb > 0 ? (wa / (wa + wb)) * 100 : 50;

      return (
        <div key={r.label} className="border-t border-hair py-2.5 first:border-t-0">
          <div className="flex items-center gap-3">
            <div className="w-[72px] shrink-0 text-right sm:w-[92px]">
              <Side value={r.a} format={r.format} lead={aLead} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="pb-1 text-center text-2xs font-semibold text-fg3">{r.label}</p>
              <div className="flex h-[6px] overflow-hidden rounded-chip bg-surface2">
                <div
                  className={aLead ? 'bg-accent' : 'bg-track'}
                  style={{ width: `${both ? share : 50}%` }}
                />
                <div className={bLead ? 'bg-accent' : 'bg-track'} style={{ width: `${both ? 100 - share : 50}%` }} />
              </div>
            </div>
            <div className="w-[72px] shrink-0 sm:w-[92px]">
              <Side value={r.b} format={r.format} lead={bLead} />
            </div>
          </div>
          {r.note && <p className="pt-1 text-center text-2xs text-fg3">{r.note}</p>}
        </div>
      );
    })}
  </div>
);
