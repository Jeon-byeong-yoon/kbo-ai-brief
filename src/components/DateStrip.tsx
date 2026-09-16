'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './ui/Icons';

interface ScheduleDay {
  date: string;
  total: number;
  finished: number;
  live: number;
  scheduled: number;
  cancelled: number;
}

interface DateStripProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onDateChange: (date: string) => void;
  /** '오늘'로 표시할 날짜. 앱이 테스트용으로 오늘을 고정하고 있어 밖에서 받는다. */
  today: string;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const pad = (n: number) => String(n).padStart(2, '0');
const toMonth = (date: string) => date.slice(0, 7);
const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/**
 * 네이버 스포츠 일정처럼 한 달치 날짜를 가로로 늘어놓고, 각 날짜에 경기가 있는지
 * 점으로 표시한다. 경기가 없는 날은 흐리게 처리하되 선택은 가능하게 둔다
 * (선택하면 "경기가 없습니다" 상태를 보여주는 게 맞다).
 */
export const DateStrip: React.FC<DateStripProps> = ({ selectedDate, onDateChange, today }) => {
  const [month, setMonth] = useState(() => toMonth(selectedDate));
  const [days, setDays] = useState<Map<string, ScheduleDay>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // 바깥에서 날짜가 바뀌면(예: 경기 카드에서 이동) 그 달로 따라간다.
  useEffect(() => {
    setMonth(toMonth(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    let alive = true;
    setIsLoading(true);

    fetch(`/api/schedule?month=${month}`)
      .then((res) => res.json())
      .then((json) => {
        if (!alive) return;
        const next = new Map<string, ScheduleDay>();
        if (json.success) {
          for (const day of json.data.days as ScheduleDay[]) next.set(day.date, day);
        }
        setDays(next);
      })
      .catch((err) => {
        console.error('Failed to fetch monthly schedule:', err);
        if (alive) setDays(new Map());
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [month]);

  // 선택한 날짜가 스트립 밖에 있으면 가운데로 끌어온다.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const cell = selectedRef.current;
    if (!scroller || !cell) return;
    const offset = cell.offsetLeft - scroller.clientWidth / 2 + cell.clientWidth / 2;
    scroller.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
  }, [selectedDate, month, isLoading]);

  const cells = useMemo(() => {
    const [year, m] = month.split('-').map(Number);
    return Array.from({ length: daysInMonth(year, m) }, (_, i) => {
      const date = `${month}-${pad(i + 1)}`;
      return {
        date,
        day: i + 1,
        weekday: WEEKDAYS[new Date(year, m - 1, i + 1).getDay()],
        summary: days.get(date),
      };
    });
  }, [month, days]);

  const monthTotals = useMemo(() => {
    let games = 0;
    days.forEach((d) => {
      games += d.total;
    });
    return { days: days.size, games };
  }, [days]);

  return (
    <section className="rounded-card border border-line bg-surface shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-hair px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => onDateChange(today)}
          className="flex items-center gap-1.5 rounded-chip px-2.5 py-1.5 text-xs font-semibold text-fg2 transition-colors hover:bg-surface2 hover:text-fg"
        >
          <CalendarIcon size={14} />
          오늘
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMonth(shiftMonth(month, -1))}
            aria-label="이전 달"
            className="flex h-7 w-7 items-center justify-center rounded-chip text-fg3 transition-colors hover:bg-surface2 hover:text-fg"
          >
            <ChevronLeftIcon />
          </button>
          <span className="tnum min-w-[92px] text-center text-[15px] font-bold tracking-[-0.025em] text-fg">
            {month.replace('-', '.')}
          </span>
          <button
            type="button"
            onClick={() => setMonth(shiftMonth(month, 1))}
            aria-label="다음 달"
            className="flex h-7 w-7 items-center justify-center rounded-chip text-fg3 transition-colors hover:bg-surface2 hover:text-fg"
          >
            <ChevronRightIcon />
          </button>
        </div>

        <span className="tnum hidden text-xs text-fg3 sm:block">
          {isLoading ? '불러오는 중' : monthTotals.games > 0 ? `${monthTotals.days}일 ${monthTotals.games}경기` : '경기 없음'}
        </span>
      </div>

      <div
        ref={scrollerRef}
        className="custom-scrollbar flex gap-1 overflow-x-auto px-3 py-3 sm:px-4"
      >
        {cells.map((cell) => {
          const isSelected = cell.date === selectedDate;
          const isToday = cell.date === today;
          const hasGames = (cell.summary?.total ?? 0) > 0;
          const isWeekend = cell.weekday === '일' || cell.weekday === '토';

          return (
            <button
              key={cell.date}
              ref={isSelected ? selectedRef : undefined}
              type="button"
              onClick={() => onDateChange(cell.date)}
              aria-pressed={isSelected}
              aria-label={`${cell.date}${hasGames ? ` 경기 ${cell.summary?.total}건` : ' 경기 없음'}`}
              className={`flex w-[46px] shrink-0 flex-col items-center gap-1 rounded-control py-2 transition-colors ${
                isSelected
                  ? 'bg-accent text-white'
                  : hasGames
                    ? 'text-fg hover:bg-surface2'
                    : 'text-fg3 hover:bg-surface2'
              }`}
            >
              <span
                className={`text-[11px] font-medium ${
                  isSelected
                    ? 'text-white/75'
                    : isWeekend && hasGames
                      ? 'text-fg2'
                      : 'text-fg3'
                }`}
              >
                {cell.weekday}
              </span>
              <span
                className={`tnum text-[15px] font-bold tracking-[-0.02em] ${
                  !isSelected && isToday ? 'text-accent' : ''
                }`}
              >
                {cell.day}
              </span>
              <span
                aria-hidden
                className={`h-[4px] w-[4px] rounded-full ${
                  hasGames
                    ? isSelected
                      ? 'bg-white/80'
                      : cell.summary!.live > 0
                        ? 'bg-live'
                        : 'bg-fg3'
                    : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
};
