'use client';

import React from 'react';
import {
  ADVANCED_FROM,
  CareerBattingSeason,
  CareerPitchingSeason,
} from '@/types/player-career';

const th = 'whitespace-nowrap pb-2.5 text-center text-2xs font-semibold text-fg3';
const td = 'tnum border-t border-hair py-2.5 text-center text-[12.5px] text-fg2';
const tdTotal = 'tnum border-t-2 border-line py-2.5 text-center text-[12.5px] font-semibold text-fg';

const rate = (n: number) => n.toFixed(3).replace(/^0/, '');
/** 고급 지표가 없는 시즌은 0 이 아니라 빈 칸으로 둔다. 없는 값을 0 으로 보이면 안 된다. */
const opt = (n: number | null, digits = 2) => (n === null ? '—' : n.toFixed(digits));

const Shell: React.FC<{ minWidth: number; title: string; children: React.ReactNode }> = ({
  minWidth,
  title,
  children,
}) => (
  <section className="rounded-card border border-line bg-surface px-5 pb-4 pt-4 shadow-card">
    <h2 className="pb-3 text-[15px] font-bold tracking-[-0.025em] text-fg">{title}</h2>
    <div className="custom-scrollbar -mx-1 overflow-x-auto px-1">
      <table className="w-full border-collapse" style={{ minWidth }}>
        {children}
      </table>
    </div>
  </section>
);

export const BattingCareer: React.FC<{
  rows: CareerBattingSeason[];
  total: CareerBattingSeason | null;
}> = ({ rows, total }) => {
  if (rows.length === 0) return null;
  const cells = (r: CareerBattingSeason, cls: string) => (
    <>
      <td className={cls}>{r.games}</td>
      <td className={cls}>{r.atBats}</td>
      <td className={cls}>{r.hits}</td>
      <td className={cls}>{r.doubles}</td>
      <td className={cls}>{r.triples}</td>
      <td className={cls}>{r.homeRuns}</td>
      <td className={cls}>{r.rbi}</td>
      <td className={cls}>{r.runs}</td>
      <td className={cls}>{r.steals}</td>
      <td className={cls}>{r.walks}</td>
      <td className={cls}>{r.strikeouts}</td>
      <td className={cls}>{rate(r.avg)}</td>
      <td className={cls}>{rate(r.obp)}</td>
      <td className={cls}>{rate(r.slg)}</td>
      <td className={cls}>{rate(r.ops)}</td>
      <td className={cls}>{r.wrcPlus === null ? '—' : r.wrcPlus.toFixed(1)}</td>
      <td className={cls}>{opt(r.war)}</td>
    </>
  );

  return (
    <Shell minWidth={940} title="타자 기록">
      <thead>
        <tr>
          <th className={`${th} text-left`}>연도</th>
          <th className={`${th} text-left`}>팀</th>
          {['G', '타수', '안타', '2루타', '3루타', '홈런', '타점', '득점', '도루', '볼넷', '삼진', '타율', '출루', '장타', 'OPS', 'wRC+', 'WAR'].map(
            (h) => (
              <th key={h} className={th}>
                {h}
              </th>
            ),
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.year}>
            <td className={`${td} text-left font-semibold text-fg`}>{r.year}</td>
            <td className={`${td} text-left`}>{r.teamShortName}</td>
            {cells(r, td)}
          </tr>
        ))}
        {total && (
          <tr>
            <td className={`${tdTotal} text-left`}>통산</td>
            <td className={`${tdTotal} text-left`}>{rows.length}시즌</td>
            {cells(total, tdTotal)}
          </tr>
        )}
      </tbody>
    </Shell>
  );
};

export const PitchingCareer: React.FC<{
  rows: CareerPitchingSeason[];
  total: CareerPitchingSeason | null;
}> = ({ rows, total }) => {
  if (rows.length === 0) return null;
  const cells = (r: CareerPitchingSeason, cls: string) => (
    <>
      <td className={cls}>{r.games}</td>
      <td className={cls}>{r.wins}</td>
      <td className={cls}>{r.losses}</td>
      <td className={cls}>{r.saves}</td>
      <td className={cls}>{r.holds}</td>
      <td className={cls}>{r.innings}</td>
      <td className={cls}>{r.strikeouts}</td>
      <td className={cls}>{r.walks}</td>
      <td className={cls}>{r.earnedRuns}</td>
      <td className={cls}>{r.era.toFixed(2)}</td>
      <td className={cls}>{r.whip.toFixed(2)}</td>
      <td className={cls}>{opt(r.war)}</td>
    </>
  );

  return (
    <Shell minWidth={780} title="투수 기록">
      <thead>
        <tr>
          <th className={`${th} text-left`}>연도</th>
          <th className={`${th} text-left`}>팀</th>
          {['G', '승', '패', '세', '홀', '이닝', '삼진', '볼넷', '자책', 'ERA', 'WHIP', 'WAR'].map((h) => (
            <th key={h} className={th}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.year}>
            <td className={`${td} text-left font-semibold text-fg`}>{r.year}</td>
            <td className={`${td} text-left`}>{r.teamShortName}</td>
            {cells(r, td)}
          </tr>
        ))}
        {total && (
          <tr>
            <td className={`${tdTotal} text-left`}>통산</td>
            <td className={`${tdTotal} text-left`}>{rows.length}시즌</td>
            {cells(total, tdTotal)}
          </tr>
        )}
      </tbody>
    </Shell>
  );
};

export const AdvancedNote: React.FC = () => (
  <p className="text-2xs leading-relaxed text-fg3">
    WAR 과 wRC+ 는 네이버가 {ADVANCED_FROM}년부터만 제공합니다. 그 전 시즌은 값이 없어
    빈 칸(—)으로 두었습니다. 추정으로 채우지 않습니다. 통산 WAR 도 값이 있는 시즌만
    더한 것입니다.
  </p>
);
