import { TeamBadge } from '@/components/ui/TeamBadge';
import { TrophyIcon } from '@/components/ui/Icons';
import Link from 'next/link';

const RESULT_SOURCE = 'https://www.koreabaseball.com/MediaNews/News/BreakingNews/View.aspx?bdSe=62619';

export function ChampionBanner() {
  return (
    <section
      aria-label="2026 KBO 한국시리즈 우승팀"
      className="rounded-card border border-accent/25 bg-accent-soft p-5 shadow-card sm:p-6"
    >
      <div className="flex items-start gap-4 sm:items-center">
        <TeamBadge team="SAMSUNG" size={52} radius={12} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
            <TrophyIcon size={14} />
            2026 한국시리즈 우승 · 삼성 라이온즈
          </div>
          <h2 className="mt-1 text-[19px] font-bold leading-snug tracking-[-0.035em] text-fg sm:text-[23px]">
            삼성 라이온즈의 우승을 축하합니다!
          </h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg2">
            KT 위즈를 4승 1패로 꺾고 통산 9번째 한국시리즈 우승을 차지했습니다.
            <span className="ml-1">2026 정규시즌 1위는 KT 위즈입니다.</span>
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 sm:ml-[68px]">
        <Link href="/postseason" className="text-xs font-semibold text-accent hover:underline">포스트시즌 대진표 보기 →</Link>
        <a href={RESULT_SOURCE} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-fg2 hover:underline">KBO 우승 결과 ↗</a>
      </div>
    </section>
  );
}
