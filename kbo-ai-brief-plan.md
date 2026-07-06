# KBO AI Brief — 프로젝트 계획서

> **버전**: v1.0  
> **작성일**: 2026-07-06  
> **목표**: KBO 경기 데이터 + AI 프리뷰/리뷰 웹앱 MVP 완성

---

## 1. 프로젝트 개요

### 핵심 컨셉

- 오늘 열리는 KBO 경기 목록을 보여준다
- 팀 순위와 최근 경기 흐름을 보여준다
- 경기 전: AI가 관전 포인트를 요약해준다 (AI 프리뷰)
- 경기 후: AI가 경기 흐름과 승부처를 요약해준다 (AI 리뷰)
- 실시간 중계 없이, 경기 중 **2분 단위 스코어 갱신** 방식

### MVP 완료 기준

- [ ] 오늘 경기 목록이 보인다
- [ ] 팀 순위가 보인다
- [ ] 경기 상세 화면이 있다
- [ ] AI 경기 프리뷰를 생성하고 저장할 수 있다
- [ ] 경기 종료 후 AI 리뷰를 생성하고 저장할 수 있다
- [ ] 경기 중 스코어를 2분 단위로 갱신하는 구조가 있다
- [ ] 모든 데이터는 DB를 거쳐 프론트에 표시된다

---

## 2. 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| 프론트엔드 | Next.js 14 (App Router) | TypeScript |
| 스타일 | Tailwind CSS | 커스텀 다크 테마 |
| ORM | Prisma | MySQL 연결 |
| 데이터베이스 | MySQL 8.0 | Docker Compose |
| AI | OpenAI API (gpt-4o-mini) | 응답 DB 캐싱 |
| 크롤러 | Python (requests + BeautifulSoup) | 별도 프로세스 |
| 배포 | Vercel (프론트) + Railway (MySQL) | MVP 이후 |

---

## 3. 프로젝트 디렉토리 구조

```
kbo-ai-brief/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 홈 화면
│   │   ├── layout.tsx                  # 루트 레이아웃
│   │   ├── globals.css                 # 글로벌 스타일
│   │   ├── games/
│   │   │   └── [id]/
│   │   │       └── page.tsx            # 경기 상세 페이지
│   │   ├── standings/
│   │   │   └── page.tsx                # 팀 순위 페이지
│   │   └── api/
│   │       ├── games/
│   │       │   ├── today/
│   │       │   │   └── route.ts        # GET /api/games/today
│   │       │   └── [id]/
│   │       │       ├── route.ts        # GET /api/games/:id
│   │       │       ├── ai-preview/
│   │       │       │   └── route.ts    # POST /api/games/:id/ai-preview
│   │       │       └── ai-review/
│   │       │           └── route.ts    # POST /api/games/:id/ai-review
│   │       └── standings/
│   │           └── route.ts            # GET /api/standings
│   ├── components/
│   │   ├── ui/
│   │   │   ├── StatusBadge.tsx         # 경기 상태 배지
│   │   │   ├── TeamLogo.tsx            # 팀 로고 컴포넌트
│   │   │   └── LoadingSpinner.tsx      # 로딩 스피너
│   │   ├── game/
│   │   │   ├── GameCard.tsx            # 경기 카드 (홈 화면)
│   │   │   ├── ScoreBoard.tsx          # 스코어보드
│   │   │   ├── InningScoreTable.tsx    # 이닝별 점수표
│   │   │   └── AiContent.tsx           # AI 프리뷰/리뷰 표시
│   │   └── standings/
│   │       └── StandingsTable.tsx      # 순위표
│   ├── lib/
│   │   ├── prisma.ts                   # Prisma 싱글톤
│   │   └── openai.ts                   # OpenAI 싱글톤
│   └── types/
│       └── index.ts                    # 도메인 타입 정의
├── prisma/
│   ├── schema.prisma                   # DB 스키마
│   └── seed.ts                         # 더미 데이터
├── crawler/
│   ├── db.py                           # MySQL 연결
│   ├── utils.py                        # 공통 유틸
│   ├── collect_schedule.py             # 경기 일정 수집
│   ├── collect_standings.py            # 팀 순위 수집
│   ├── collect_game_scores.py          # 경기 중 스코어 갱신
│   └── requirements.txt
├── docker/
│   └── mysql/
│       └── init.sql                    # DB 초기화
├── docker-compose.yml                  # MySQL Docker 설정
├── .env.local                          # 환경변수 (git 제외)
├── .env.example                        # 환경변수 예시
└── README.md
```

---

## 4. 데이터베이스 설계

### 4-1. teams 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INT PK | 팀 ID |
| name | VARCHAR(50) | 팀 풀네임 (예: LG 트윈스) |
| short_name | VARCHAR(10) | 줄임 이름 (예: LG) |
| logo_url | VARCHAR(255) | 팀 로고 URL |
| created_at | DATETIME | 생성일 |
| updated_at | DATETIME | 수정일 |

### 4-2. games 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INT PK | 경기 ID |
| game_date | DATE | 경기 날짜 |
| start_time | VARCHAR(10) | 시작 시간 (예: 18:30) |
| stadium | VARCHAR(100) | 구장명 |
| home_team_id | INT FK | 홈팀 |
| away_team_id | INT FK | 원정팀 |
| status | ENUM | SCHEDULED / LIVE / FINAL / CANCELLED / POSTPONED |
| current_inning | VARCHAR(20) | 현재 이닝 (예: 7회초) |
| home_score | INT | 홈팀 점수 |
| away_score | INT | 원정팀 점수 |
| home_hits | INT | 홈팀 안타 |
| away_hits | INT | 원정팀 안타 |
| home_errors | INT | 홈팀 실책 |
| away_errors | INT | 원정팀 실책 |
| home_walks | INT | 홈팀 볼넷 |
| away_walks | INT | 원정팀 볼넷 |
| inning_scores | JSON | 이닝별 점수 |
| last_updated_at | DATETIME | 마지막 갱신 시각 |
| created_at | DATETIME | 생성일 |
| updated_at | DATETIME | 수정일 |

### 4-3. standings 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INT PK | |
| team_id | INT FK | 팀 |
| season | INT | 시즌 연도 |
| rank | INT | 순위 |
| games_played | INT | 경기 수 |
| wins | INT | 승 |
| losses | INT | 패 |
| draws | INT | 무 |
| win_rate | FLOAT | 승률 |
| games_behind | FLOAT | 게임차 |
| last_10 | VARCHAR(30) | 최근 10경기 (예: 6승3패1무) |

### 4-4. team_stats 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| team_id | INT FK | 팀 |
| season | INT | 시즌 |
| batting_average | FLOAT | 팀 타율 |
| era | FLOAT | 팀 평균자책점 |
| runs | INT | 득점 |
| hits | INT | 안타 |
| home_runs | INT | 홈런 |
| stolen_bases | INT | 도루 |

### 4-5. ai_previews / ai_reviews 테이블

| 컬럼 | 타입 | 설명 |
|---|---|---|
| game_id | INT FK UNIQUE | 경기 (1:1) |
| content | TEXT | JSON 형태 AI 응답 |
| model_name | VARCHAR(50) | 사용 모델명 |
| generated_at | DATETIME | 생성 시각 |

---

## 5. API 설계

### GET /api/games/today
오늘 날짜 기준 경기 목록 반환

### GET /api/games/:id
특정 경기 상세 + 팀 순위 + AI 프리뷰/리뷰

### GET /api/standings
전체 팀 순위 반환

### POST /api/games/:id/ai-preview
- 이미 생성된 프리뷰가 있으면 DB 캐시 반환
- ?force=true 옵션으로 강제 재생성 가능
- AI가 없을 경우 더미 응답으로 fallback

### POST /api/games/:id/ai-review
- 경기 상태가 FINAL일 때만 생성
- 이미 생성된 리뷰가 있으면 DB 캐시 반환

---

## 6. 프론트엔드 페이지 구조

### 홈 화면 (/)
- 오늘 날짜 헤더
- 경기 카드 리스트 (SCHEDULED / LIVE / FINAL 상태별)
- 팀 순위 미리보기 (상위 5팀)

### 경기 상세 (/games/[id])
- 홈 vs 원정 헤더 + 스코어 크게 표시
- 이닝별 점수표 (LIVE / FINAL 시 표시)
- 팀 기본 정보 (순위, 최근 흐름)
- AI 프리뷰 섹션 (생성 버튼 포함)
- AI 리뷰 섹션 (FINAL 시만 표시)

### 팀 순위 (/standings)
- 전체 순위표 (순위/팀명/경기수/승/패/무/승률/게임차/최근10경기)

---

## 7. 디자인 시스템

### 컬러 팔레트
| 역할 | 색상 |
|---|---|
| 배경 | #0B0F1A (딥 네이비) |
| 카드 배경 | #141929 |
| 포인트 | #F59E0B (앰버) |
| 텍스트 primary | #F1F5F9 |
| 텍스트 secondary | #94A3B8 |
| LIVE 배지 | #EF4444 + 펄스 애니메이션 |
| FINAL 배지 | #6B7280 |
| SCHEDULED 배지 | #3B82F6 |

### 폰트
- 한국어: Noto Sans KR
- 숫자/영문: Inter

---

## 8. 단계별 작업 계획

### 완료된 작업 (Step 0)
- [x] Next.js 14 프로젝트 생성
- [x] Docker Compose MySQL 설정
- [x] Prisma 스키마 (Team, Game, Standing, TeamStat, AiPreview, AiReview)
- [x] 더미 데이터 Seed 파일 (KBO 10팀 + 오늘 경기 5게임)
- [x] 환경변수 파일 (.env.local, .env.example)
- [x] Prisma 싱글톤 클라이언트
- [x] OpenAI 싱글톤 클라이언트
- [x] TypeScript 타입 정의
- [x] API: GET /api/games/today
- [x] API: GET /api/games/[id]
- [x] API: POST /api/games/[id]/ai-preview (OpenAI 호출 + fallback)
- [x] API: POST /api/games/[id]/ai-review
- [x] API: GET /api/standings

### Step 1 — DB 기동 & 마이그레이션
```bash
docker compose up -d
npx prisma db push
npm run db:seed
```

### Step 2 — 글로벌 스타일 & 레이아웃
- globals.css (다크 테마, CSS 변수, 애니메이션)
- layout.tsx (Header, 네비게이션)

### Step 3 — 공통 UI 컴포넌트
- StatusBadge.tsx
- LoadingSpinner.tsx
- TeamLogo.tsx

### Step 4 — 경기 관련 컴포넌트
- GameCard.tsx
- ScoreBoard.tsx
- InningScoreTable.tsx
- AiContent.tsx (프리뷰/리뷰 표시 + 생성 버튼)

### Step 5 — 순위 컴포넌트
- StandingsTable.tsx

### Step 6 — 페이지 구현
- app/page.tsx (홈 화면)
- app/games/[id]/page.tsx (경기 상세)
- app/standings/page.tsx (팀 순위)

### Step 7 — Python 크롤러 골격
- crawler/db.py, utils.py
- crawler/collect_schedule.py
- crawler/collect_standings.py
- crawler/collect_game_scores.py
- crawler/requirements.txt

### Step 8 — README 작성

---

## 9. 실행 방법

```bash
# 1. Docker MySQL 실행
docker compose up -d

# 2. 의존성 설치
npm install

# 3. DB 스키마 적용
npx prisma db push

# 4. 더미 데이터 삽입
npm run db:seed

# 5. 개발 서버 실행
npm run dev
```

브라우저: http://localhost:3000

---

## 10. 이후 확장 계획 (MVP 이후)

- 관심 팀 설정 및 홈 화면 상단 고정
- 실제 KBO 크롤러 연결
- 선수 검색 / 비교
- 팀별 최근 흐름 그래프
- 단순 승부 예측 점수
- 야구 초보 모드
- 경기 전/후 AI 요약 알림
- PWA 변환
- Vercel + Railway 배포
