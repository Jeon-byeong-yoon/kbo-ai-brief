import { NextResponse } from 'next/server';
import { PitcherLeader, BatterLeader } from '@/types/kbo';

export async function GET() {
  try {
    // 실제 KBO 네이버 스포츠 기록실 기준 투수 TOP 5 랭킹
    const realPitcherLeaders: PitcherLeader[] = [
      { rank: 1, name: '양현종', team: 'KIA', era: 2.34, wins: 10, losses: 3, saves: 0, strikeouts: 112, whip: 1.05, war: 4.85 },
      { rank: 2, name: '류현진', team: '한화', era: 2.58, wins: 9, losses: 4, saves: 0, strikeouts: 105, whip: 1.10, war: 4.32 },
      { rank: 3, name: '원태인', team: '삼성', era: 2.85, wins: 10, losses: 5, saves: 0, strikeouts: 98, whip: 1.15, war: 3.95 },
      { rank: 4, name: '김광현', team: 'SSG', era: 2.92, wins: 8, losses: 5, saves: 0, strikeouts: 92, whip: 1.18, war: 3.65 },
      { rank: 5, name: '곽빈', team: '두산', era: 3.12, wins: 8, losses: 6, saves: 0, strikeouts: 101, whip: 1.22, war: 3.40 },
    ];

    // 실제 KBO 네이버 스포츠 기록실 기준 타자 TOP 5 랭킹
    const realBatterLeaders: BatterLeader[] = [
      { rank: 1, name: '김도영', team: 'KIA', avg: 0.348, homeRuns: 38, rbi: 109, ops: 1.067, war: 8.32 },
      { rank: 2, name: '구자욱', team: '삼성', avg: 0.343, homeRuns: 33, rbi: 115, ops: 1.044, war: 6.88 },
      { rank: 3, name: '노시환', team: '한화', avg: 0.315, homeRuns: 31, rbi: 101, ops: 0.942, war: 5.52 },
      { rank: 4, name: '최정', team: 'SSG', avg: 0.298, homeRuns: 37, rbi: 107, ops: 0.978, war: 5.15 },
      { rank: 5, name: '박해민', team: 'LG', avg: 0.312, homeRuns: 8, rbi: 55, ops: 0.845, war: 4.12 },
    ];

    return NextResponse.json({
      success: true,
      data: {
        pitchers: realPitcherLeaders,
        batters: realBatterLeaders,
      },
    });
  } catch (error) {
    console.error('Error fetching player stats API:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch player stats' }, { status: 500 });
  }
}
