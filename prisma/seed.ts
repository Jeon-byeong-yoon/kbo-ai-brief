import { PrismaClient, GameStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 KBO AI Brief 시드 데이터 삽입 시작...");

  // ========================
  // 1. 팀 데이터 (KBO 10개 구단)
  // ========================
  const teams = await Promise.all([
    prisma.team.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, name: "LG 트윈스", shortName: "LG", logoUrl: null },
    }),
    prisma.team.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, name: "두산 베어스", shortName: "두산", logoUrl: null },
    }),
    prisma.team.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, name: "KT 위즈", shortName: "KT", logoUrl: null },
    }),
    prisma.team.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, name: "SSG 랜더스", shortName: "SSG", logoUrl: null },
    }),
    prisma.team.upsert({
      where: { id: 5 },
      update: {},
      create: { id: 5, name: "NC 다이노스", shortName: "NC", logoUrl: null },
    }),
    prisma.team.upsert({
      where: { id: 6 },
      update: {},
      create: { id: 6, name: "키움 히어로즈", shortName: "키움", logoUrl: null },
    }),
    prisma.team.upsert({
      where: { id: 7 },
      update: {},
      create: { id: 7, name: "한화 이글스", shortName: "한화", logoUrl: null },
    }),
    prisma.team.upsert({
      where: { id: 8 },
      update: {},
      create: { id: 8, name: "롯데 자이언츠", shortName: "롯데", logoUrl: null },
    }),
    prisma.team.upsert({
      where: { id: 9 },
      update: {},
      create: { id: 9, name: "삼성 라이온즈", shortName: "삼성", logoUrl: null },
    }),
    prisma.team.upsert({
      where: { id: 10 },
      update: {},
      create: { id: 10, name: "KIA 타이거즈", shortName: "KIA", logoUrl: null },
    }),
  ]);
  console.log(`✅ 팀 ${teams.length}개 삽입 완료`);

  // ========================
  // 2. 팀 순위 (2026 시즌 더미)
  // ========================
  const standingsData = [
    { teamId: 10, rank: 1, wins: 42, losses: 27, draws: 1, winRate: 0.609, gamesBehind: 0, last10: "7승3패" },
    { teamId: 1, rank: 2, wins: 40, losses: 29, draws: 1, winRate: 0.580, gamesBehind: 2, last10: "6승4패" },
    { teamId: 9, rank: 3, wins: 38, losses: 31, draws: 1, winRate: 0.551, gamesBehind: 4, last10: "5승5패" },
    { teamId: 4, rank: 4, wins: 37, losses: 32, draws: 1, winRate: 0.536, gamesBehind: 5, last10: "6승4패" },
    { teamId: 3, rank: 5, wins: 36, losses: 33, draws: 1, winRate: 0.522, gamesBehind: 6, last10: "5승5패" },
    { teamId: 5, rank: 6, wins: 34, losses: 35, draws: 1, winRate: 0.493, gamesBehind: 8, last10: "4승6패" },
    { teamId: 2, rank: 7, wins: 32, losses: 37, draws: 1, winRate: 0.464, gamesBehind: 10, last10: "3승7패" },
    { teamId: 7, rank: 8, wins: 30, losses: 39, draws: 1, winRate: 0.435, gamesBehind: 12, last10: "5승5패" },
    { teamId: 6, rank: 9, wins: 28, losses: 41, draws: 1, winRate: 0.406, gamesBehind: 14, last10: "4승6패" },
    { teamId: 8, rank: 10, wins: 25, losses: 44, draws: 1, winRate: 0.362, gamesBehind: 17, last10: "3승7패" },
  ];

  for (const s of standingsData) {
    await prisma.standing.upsert({
      where: { teamId_season: { teamId: s.teamId, season: 2026 } },
      update: s,
      create: { ...s, season: 2026, gamesPlayed: s.wins + s.losses + s.draws },
    });
  }
  console.log("✅ 팀 순위 데이터 삽입 완료");

  // ========================
  // 3. 팀 스탯 (2026 시즌 더미)
  // ========================
  const teamStatsData = [
    { teamId: 10, battingAverage: 0.285, era: 3.82, runs: 420, hits: 870, homeRuns: 88, stolenBases: 55 },
    { teamId: 1, battingAverage: 0.278, era: 4.01, runs: 398, hits: 845, homeRuns: 79, stolenBases: 62 },
    { teamId: 9, battingAverage: 0.271, era: 3.95, runs: 385, hits: 820, homeRuns: 92, stolenBases: 38 },
    { teamId: 4, battingAverage: 0.269, era: 4.12, runs: 375, hits: 812, homeRuns: 85, stolenBases: 45 },
    { teamId: 3, battingAverage: 0.265, era: 4.25, runs: 361, hits: 798, homeRuns: 77, stolenBases: 71 },
    { teamId: 5, battingAverage: 0.262, era: 4.38, runs: 348, hits: 785, homeRuns: 68, stolenBases: 58 },
    { teamId: 2, battingAverage: 0.255, era: 4.51, runs: 332, hits: 762, homeRuns: 72, stolenBases: 42 },
    { teamId: 7, battingAverage: 0.251, era: 4.68, runs: 315, hits: 748, homeRuns: 65, stolenBases: 49 },
    { teamId: 6, battingAverage: 0.248, era: 4.79, runs: 298, hits: 730, homeRuns: 58, stolenBases: 88 },
    { teamId: 8, battingAverage: 0.242, era: 5.01, runs: 280, hits: 712, homeRuns: 55, stolenBases: 35 },
  ];

  for (const s of teamStatsData) {
    await prisma.teamStat.upsert({
      where: { teamId_season: { teamId: s.teamId, season: 2026 } },
      update: s,
      create: { ...s, season: 2026 },
    });
  }
  console.log("✅ 팀 스탯 데이터 삽입 완료");

  // ========================
  // 4. 오늘 경기 더미 데이터
  // ========================
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const gamesData = [
    {
      id: 1,
      gameDate: today,
      startTime: "14:00",
      stadium: "광주-기아 챔피언스 필드",
      homeTeamId: 10, // KIA
      awayTeamId: 9,  // 삼성
      status: GameStatus.FINAL,
      currentInning: "경기 종료",
      homeScore: 7,
      awayScore: 3,
      homeHits: 11,
      awayHits: 7,
      homeErrors: 0,
      awayErrors: 1,
      homeWalks: 4,
      awayWalks: 3,
      inningScores: {
        home: [2, 0, 1, 0, 2, 0, 1, 1, 0],
        away: [1, 0, 0, 1, 0, 0, 1, 0, 0],
      },
      lastUpdatedAt: new Date(),
    },
    {
      id: 2,
      gameDate: today,
      startTime: "18:00",
      stadium: "인천 SSG 랜더스 필드",
      homeTeamId: 4,  // SSG
      awayTeamId: 3,  // KT
      status: GameStatus.LIVE,
      currentInning: "7회초",
      homeScore: 4,
      awayScore: 5,
      homeHits: 8,
      awayHits: 10,
      homeErrors: 1,
      awayErrors: 0,
      homeWalks: 2,
      awayWalks: 5,
      inningScores: {
        home: [0, 2, 0, 1, 0, 0, 1, 0, 0],
        away: [0, 0, 2, 0, 1, 2, 0, 0, 0],
      },
      lastUpdatedAt: new Date(),
    },
    {
      id: 3,
      gameDate: today,
      startTime: "18:30",
      stadium: "잠실 야구장",
      homeTeamId: 2,  // 두산
      awayTeamId: 1,  // LG
      status: GameStatus.SCHEDULED,
      currentInning: null,
      homeScore: 0,
      awayScore: 0,
      homeHits: 0,
      awayHits: 0,
      homeErrors: 0,
      awayErrors: 0,
      homeWalks: 0,
      awayWalks: 0,
      inningScores: null,
      lastUpdatedAt: null,
    },
    {
      id: 4,
      gameDate: today,
      startTime: "18:30",
      stadium: "창원 NC 파크",
      homeTeamId: 5,  // NC
      awayTeamId: 7,  // 한화
      status: GameStatus.SCHEDULED,
      currentInning: null,
      homeScore: 0,
      awayScore: 0,
      homeHits: 0,
      awayHits: 0,
      homeErrors: 0,
      awayErrors: 0,
      homeWalks: 0,
      awayWalks: 0,
      inningScores: null,
      lastUpdatedAt: null,
    },
    {
      id: 5,
      gameDate: today,
      startTime: "18:30",
      stadium: "수원 KT 위즈 파크",
      homeTeamId: 6,  // 키움
      awayTeamId: 8,  // 롯데
      status: GameStatus.SCHEDULED,
      currentInning: null,
      homeScore: 0,
      awayScore: 0,
      homeHits: 0,
      awayHits: 0,
      homeErrors: 0,
      awayErrors: 0,
      homeWalks: 0,
      awayWalks: 0,
      inningScores: null,
      lastUpdatedAt: null,
    },
  ];

  for (const g of gamesData) {
    await prisma.game.upsert({
      where: { id: g.id },
      update: { ...g },
      create: { ...g },
    });
  }
  console.log(`✅ 경기 ${gamesData.length}개 삽입 완료`);

  // ========================
  // 5. AI 프리뷰 더미 (경기 3번 - LG vs 두산 예정 경기)
  // ========================
  await prisma.aiPreview.upsert({
    where: { gameId: 3 },
    update: {},
    create: {
      gameId: 3,
      content: JSON.stringify({
        summary: "잠실 라이벌전! LG와 두산의 자존심 대결이 오늘 저녁 펼쳐집니다.",
        watchPoints: [
          "LG의 선발 투수가 최근 3경기 연속 퀄리티스타트를 기록하며 절정의 폼을 유지 중입니다.",
          "두산은 홈 경기에서 올 시즌 승률 .560으로 준수한 모습을 보이고 있어 홈 이점이 변수가 될 수 있습니다.",
          "양 팀 모두 최근 10경기에서 비슷한 성적을 거두고 있어 팽팽한 승부가 예상됩니다.",
        ],
        variables: [
          "기온과 바람 등 잠실 야구장의 날씨 조건이 투수전이냐 타격전이냐를 가를 수 있습니다.",
          "양 팀 불펜 피로도가 변수입니다. 두 팀 모두 전날 접전을 치러 불펜 소모가 있었습니다.",
        ],
        watchPlayer: "오늘 이 경기는 선발 투수 대결에서 먼저 균형이 무너지는 팀이 어디냐를 주목해서 보면 재미있는 경기입니다.",
      }),
      modelName: "gpt-4o-mini (더미)",
      generatedAt: new Date(),
    },
  });
  console.log("✅ AI 프리뷰 더미 데이터 삽입 완료");

  // ========================
  // 6. AI 리뷰 더미 (경기 1번 - KIA vs 삼성 종료 경기)
  // ========================
  await prisma.aiReview.upsert({
    where: { gameId: 1 },
    update: {},
    create: {
      gameId: 1,
      content: JSON.stringify({
        summary: "KIA가 홈에서 삼성을 7-3으로 제압하며 1위 자리를 굳건히 지켰습니다.",
        keyMoment: "5회에 KIA가 2점 홈런을 포함한 집중 타선으로 2점을 추가해 4-1로 달아난 것이 결정적인 승부처였습니다.",
        impressivePlayer: "KIA 선발 투수가 7이닝 3실점으로 호투하며 팀 승리를 이끌었고, 중심 타선이 고루 활약하며 11안타를 만들어냈습니다.",
        gameFlow: {
          winner: "KIA는 초반 2점을 선제 득점한 뒤 리드를 놓치지 않으며 안정적인 경기를 펼쳤습니다.",
          loser: "삼성은 초반 1점을 내며 추격을 시도했지만, 중반 이후 KIA 불펜에 막혀 추가점을 만들어내지 못했습니다.",
        },
        nextWatch: "다음 경기에서는 삼성이 선발 로테이션을 재정비하고 반등에 나설 수 있을지 지켜보면 흥미롭습니다.",
      }),
      modelName: "gpt-4o-mini (더미)",
      generatedAt: new Date(),
    },
  });
  console.log("✅ AI 리뷰 더미 데이터 삽입 완료");

  console.log("\n🎉 모든 시드 데이터 삽입이 완료되었습니다!");
}

main()
  .catch((e) => {
    console.error("❌ 시드 실패:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
